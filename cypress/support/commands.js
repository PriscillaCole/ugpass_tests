const IDP_ORIGIN = 'https://api.ugpass.go.ug'

Cypress.Commands.add('ugpassLogin', (emailOrPhone) => {
  if (!emailOrPhone) {
    throw new Error(
      'UgPass test account is missing. Set CYPRESS_UGPASS_USER before running Cypress.'
    )
  }

  cy.session(
    'ugpass-test-user',

    () => {

      cy.origin(IDP_ORIGIN, () => {
        cy.on('uncaught:exception', (error) => {
          if (error.message.includes('$ is not defined')) {
            return false
          }

          // Unexpected application errors will still fail the test
          return true
        })
      })

      // Visit the application's landing page using baseUrl
      cy.visit('/')

      // Open UgPass authentication
      cy.get('button.login-button', { timeout: 30000 })
        .should('be.visible')
        .and('be.enabled')
        .click()

      // Complete authentication on the UgPass identity-provider origin
      cy.origin(
        IDP_ORIGIN,
        {
          args: {
            emailOrPhone,
          },
        },
        ({ emailOrPhone }) => {
          cy.location('pathname', { timeout: 30000 })
            .should('include', '/idp/Login')

          /*
           * Handle the cookie notice when it appears.
           * The check is conditional because the notice might already
           * have been accepted during an earlier browser session.
           */
          cy.get('body', { timeout: 20000 }).then(($body) => {
            const $acceptButton = $body
              .find('button')
              .filter((_, button) => {
                return button.innerText
                  .trim()
                  .toLowerCase()
                  .includes('accept')
              })

            if ($acceptButton.length > 0) {
              cy.wrap($acceptButton.first())
                .should('be.visible')
                .click()
            }
          })

          // Enter email address or phone number
          cy.get('#username', { timeout: 30000 })
            .should('be.visible')
            .and('be.enabled')
            .clear()
            .type(emailOrPhone, {
              log: false,
            })

          // Request the verification code
          cy.get('#checkUser', { timeout: 30000 })
            .should('be.visible')
            .and('be.enabled')
            .click()

          // Confirm that a verification code was generated
          cy.get('#PushNotificationCode.NotificationCode', {
            timeout: 30000,
          })
            .should('be.visible')
            .invoke('text')
            .then((verificationCode) => {
              expect(
                verificationCode.trim(),
                'UgPass verification code'
              ).not.to.equal('')
            })

          /*
           * Wait for the user to approve the login.
           * Increase this timeout if mobile approval takes longer.
           */
          cy.location('pathname', {
            timeout: 180000,
          }).should('include', '/Dashboard')
        }
      )

      /*
       * Do not cache the session until authentication has completed
       * and UgPass has redirected to the signing application.
       */
      cy.location('hostname', {
        timeout: 180000,
      }).should('eq', 'sign.ugpass.go.ug')

      cy.location('pathname', {
        timeout: 180000,
      }).should('include', '/Dashboard')
    },

    {
      /*
       * Cypress runs this whenever it restores the session.
       * If visiting Dashboard redirects back to Login, validation
       * fails and the complete login process runs again.
       */
      validate() {
        cy.visit('/Dashboard', {
          failOnStatusCode: false,
        })

        cy.location('hostname', {
          timeout: 30000,
        }).should('eq', 'sign.ugpass.go.ug')

        cy.location('pathname', {
          timeout: 30000,
        }).should('include', '/Dashboard')
      },

      // Reuse the session across spec files in the same Cypress run
      cacheAcrossSpecs: true,
    }
  )
})


//placing a signature
Cypress.Commands.add('placeSignatureOnPdf', () => {
  const pageSelector =
    '.pdf-page[data-page-number="0"]'

  const layerSelector =
    `${pageSelector} .annotation-layer`

  // Wait for the PDF to render
  cy.get(pageSelector, {
    timeout: 60000,
  })
    .should('be.visible')
    .then(($page) => {
      const pageRect =
        $page[0].getBoundingClientRect()

      expect(pageRect.width, 'PDF width')
        .to.be.greaterThan(200)

      expect(pageRect.height, 'PDF height')
        .to.be.greaterThan(200)
    })

  cy.get(layerSelector, {
    timeout: 60000,
  })
    .should('exist')
    .then(($layer) => {
      const layerRect =
        $layer[0].getBoundingClientRect()

      expect(
        layerRect.width,
        'annotation layer width'
      ).to.be.greaterThan(200)

      expect(
        layerRect.height,
        'annotation layer height'
      ).to.be.greaterThan(200)

      /*
       * Drop at the centre of the annotation layer.
       * This leaves space on every side for the signature.
       */
      const targetX =
        layerRect.left + layerRect.width * 0.5

      const targetY =
        layerRect.top + layerRect.height * 0.5

      cy.get('#SIGNATURE', {
        timeout: 30000,
      })
        .should('be.visible')
        .and('not.be.disabled')
        .then(($signature) => {
          const signatureRect =
            $signature[0].getBoundingClientRect()

          const startX =
            signatureRect.left +
            signatureRect.width / 2

          const startY =
            signatureRect.top +
            signatureRect.height / 2

          // Begin dragging
          cy.wrap($signature)
            .trigger('mousedown', {
              button: 0,
              buttons: 1,
              which: 1,
              clientX: startX,
              clientY: startY,
              force: true,
            })

          // Move through several intermediate points
          const steps = 10

          for (
            let step = 1;
            step <= steps;
            step++
          ) {
            const progress =
              step / steps

            const currentX =
              startX +
              (targetX - startX) *
                progress

            const currentY =
              startY +
              (targetY - startY) *
                progress

            cy.get('body')
              .trigger('mousemove', {
                button: 0,
                buttons: 1,
                which: 1,
                clientX: currentX,
                clientY: currentY,
                force: true,
              })
          }

          /*
           * The important correction:
           * mousemove and mouseup must be triggered on
           * the annotation layer, not the PDF page.
           */
          cy.wrap($layer)
            .trigger('mousemove', {
              button: 0,
              buttons: 1,
              which: 1,
              clientX: targetX,
              clientY: targetY,
              force: true,
            })
            .trigger('mouseup', {
              button: 0,
              buttons: 0,
              which: 1,
              clientX: targetX,
              clientY: targetY,
              force: true,
            })
        })
    })

  // Verify that UgPass added the signature
  cy.get(layerSelector, {
    timeout: 30000,
  }).should(($layer) => {
    expect(
      $layer[0].children.length,
      'signature annotations'
    ).to.be.greaterThan(0)
  })
})