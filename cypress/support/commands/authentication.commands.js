const IDP_ORIGIN = 'https://api.ugpass.go.ug'

Cypress.Commands.add(
  'ugpassLogin',
  (accountType, emailOrPhone) => {
    if (!accountType) {
      throw new Error(
        'UgPass account type is required.'
      )
    }

    if (!emailOrPhone) {
      throw new Error(
        `UgPass ${accountType} test account is missing.`
      )
    }

    /*
     * Each account gets a separate cached session.
     *
     * Examples:
     * ['ugpass-login', 'individual', 'user@example.com']
     * ['ugpass-login', 'organisation', 'org@example.com']
     */
    const sessionId = [
      'ugpass-login',
      accountType,
      emailOrPhone,
    ]

    cy.session(
      sessionId,
      () => {
        cy.origin(IDP_ORIGIN, () => {
          cy.on(
            'uncaught:exception',
            (error) => {
              if (
                error.message.includes(
                  '$ is not defined'
                )
              ) {
                return false
              }

              return true
            }
          )
        })

        cy.visit('/')

        cy.get('button.login-button', {
          timeout: 30000,
        })
          .should('be.visible')
          .and('be.enabled')
          .click()

        cy.origin(
          IDP_ORIGIN,
          {
            args: {
              emailOrPhone,
            },
          },
          ({ emailOrPhone }) => {
            cy.location('pathname', {
              timeout: 30000,
            }).should('include', '/idp/Login')

            cy.get('body', {
              timeout: 20000,
            }).then(($body) => {
              const $acceptButton = $body
                .find('button')
                .filter((_, button) =>
                  button.innerText
                    .trim()
                    .toLowerCase()
                    .includes('accept')
                )

              if ($acceptButton.length > 0) {
                cy.wrap($acceptButton.first())
                  .should('be.visible')
                  .click()
              }
            })

            cy.get('#username', {
              timeout: 30000,
            })
              .should('be.visible')
              .and('be.enabled')
              .clear()
              .type(emailOrPhone, {
                log: false,
              })

            cy.get('#checkUser', {
              timeout: 30000,
            })
              .should('be.visible')
              .and('be.enabled')
              .click()

            cy.get(
              '#PushNotificationCode.NotificationCode',
              {
                timeout: 30000,
              }
            )
              .should('be.visible')
              .invoke('text')
              .then((verificationCode) => {
                expect(
                  verificationCode.trim(),
                  'UgPass verification code'
                ).not.to.equal('')
              })

            cy.location('pathname', {
              timeout: 180000,
            }).should('include', '/Dashboard')
          }
        )

        cy.location('hostname', {
          timeout: 180000,
        }).should('eq', 'sign.ugpass.go.ug')

        cy.location('pathname', {
          timeout: 180000,
        }).should('include', '/Dashboard')
      },
      {
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

        cacheAcrossSpecs: true,
      }
    )
  }
)