Cypress.Commands.add(
  'applyWatermark',
  (watermarkText) => {
    cy.get('#watermark-field')
      .should('be.visible')
      .clear()
      .type(watermarkText)

    cy.get('#setwatermarkid')
      .should('be.visible')
      .and('be.enabled')
      .click()
  }
)

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

//organisation
Cypress.Commands.add(
  'placeFieldOnPdf',
  (
    fieldSelector,
    options = {}
  ) => {
    const {
      pageNumber = 0,
      x = 0.5,
      y = 0.5,
      fieldName = fieldSelector,
    } = options

    const pageSelector =
      `.pdf-page[data-page-number="${pageNumber}"]`

    const layerSelector =
      `${pageSelector} .annotation-layer`

    cy.get(pageSelector, {
      timeout: 60000,
    })
      .should('be.visible')
      .then(($page) => {
        const pageRect =
          $page[0].getBoundingClientRect()

        expect(
          pageRect.width,
          'PDF width'
        ).to.be.greaterThan(200)

        expect(
          pageRect.height,
          'PDF height'
        ).to.be.greaterThan(200)
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

        const annotationsBefore =
          $layer[0].children.length

        const targetX =
          layerRect.left +
          layerRect.width * x

        const targetY =
          layerRect.top +
          layerRect.height * y

        cy.get(fieldSelector, {
          timeout: 30000,
        })
          .should('be.visible')
          .and('not.be.disabled')
          .then(($field) => {
            const fieldRect =
              $field[0].getBoundingClientRect()

            const startX =
              fieldRect.left +
              fieldRect.width / 2

            const startY =
              fieldRect.top +
              fieldRect.height / 2

            cy.log(
              `Place ${fieldName} on page ${
                pageNumber + 1
              }`
            )

            // Begin dragging
            cy.wrap($field)
              .trigger('mousedown', {
                button: 0,
                buttons: 1,
                which: 1,
                clientX: startX,
                clientY: startY,
                force: true,
              })

            // Move gradually to the PDF
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
             * Release on the annotation layer.
             * This is the method that worked for UgPass.
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

        /*
         * Confirm that this particular drag added
         * another annotation.
         */
        cy.get(layerSelector, {
          timeout: 30000,
        }).should(($updatedLayer) => {
          expect(
            $updatedLayer[0].children.length,
            `${fieldName} annotation`
          ).to.be.greaterThan(
            annotationsBefore
          )
        })
      })
  }
)

Cypress.Commands.add(
  'placeFieldIfAvailable',
  (
    fieldSelector,
    options = {}
  ) => {
    cy.get('body').then(($body) => {
      const $field =
        $body.find(fieldSelector)

      const exists =
        $field.length > 0

      const visible =
        exists &&
        $field.is(':visible')

      const enabled =
        exists &&
        !$field.is(':disabled')

      if (visible && enabled) {
        cy.placeFieldOnPdf(
          fieldSelector,
          options
        )
      } else {
        cy.log(
          `Skip ${options.fieldName || fieldSelector}: unavailable`
        )
      }
    })
  }
)

Cypress.Commands.add(
  'placeAvailableSigningFields',
  () => {
    // Signature is mandatory
    cy.placeFieldOnPdf(
      '#SIGNATURE',
      {
        fieldName: 'Signature',
        pageNumber: 0,
        x: 0.35,
        y: 0.25,
      }
    )

    // QR code, if requested and available
    cy.placeFieldIfAvailable(
      '#QRCODE',
      {
        fieldName: 'QR Code',
        pageNumber: 0,
        x: 0.5,
        y: 0.55,
      }
    )

    // Initial, only if the account has it
    cy.placeFieldIfAvailable(
      '#INITIAL',
      {
        fieldName: 'Initial',
        pageNumber: 0,
        x: 0.35,
        y: 0.65,
      }
    )

    // eSeal, only if the organisation has permission
    cy.placeFieldIfAvailable(
      '#ESEAL',
      {
        fieldName: 'eSeal',
        pageNumber: 0,
        x: 0.7,
        y: 0.65,
      }
    )
  }
)