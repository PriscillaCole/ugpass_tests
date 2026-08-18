describe('Organisation Document Preparation', () => {
  const testDocument =
    'cypress/fixtures/documents/organisation_sign.docx'

  it(
    'prepares an organisation document and displays all signing fields',
    () => {
      /*
       * Login, open the signing page and upload
       * the document once.
       */
      cy.startSigningFlow({
        accountType: 'organisation',

        user: Cypress.env(
          'UGPASS_ORGANISATION_USER'
        ),

        documentPath: testDocument,

        expectContinue: true,
        expectQuickSign: true,
      })

      cy.log('Verify the default organisation options')

      cy.contains(
        'Prepare document for Signing',
        {
          timeout: 30000,
        }
      ).should('be.visible')

      cy.get('#DocumentName', {
        timeout: 60000,
      })
        .should('be.visible')
        .and('not.have.value', '')

      cy.get('#DaysToComplete')
        .should('be.visible')
        .and('have.value', '2')

      cy.get('#templateSelect')
        .should('be.visible')
        .and('have.value', '1')

      cy.get('#InitialRequired')
        .should('exist')
        .and('not.be.checked')

      cy.get('#Eseal_Required')
        .should('exist')
        .and('not.be.checked')

      cy.get('#QrCodeRequired')
        .should('exist')
        .and('not.be.checked')

      cy.get('#Continue')
        .should('be.visible')
        .and('not.be.disabled')

      cy.get('#quickSign')
        .should('be.visible')
        .and('not.be.disabled')

      cy.log('Verify all signature templates')

      const signatureTemplates = [
        {
          value: '1',
          label: 'Standard Signature',
        },
        {
          value: '2',
          label:
            'Standard Signature And Designation',
        },
        {
          value: '3',
          label:
            'Standard Signature And Handwrititten Signature',
        },
        {
          value: '4',
          label:
            'Standard Signature And Handwrititten Signature And Designation',
        },
      ]

      cy.get('#templateSelect option')
        .should(
          'have.length.at.least',
          signatureTemplates.length
        )

      signatureTemplates.forEach(
        ({ value, label }) => {
          cy.get(
            `#templateSelect option[value="${value}"]`
          ).should(
            'contain.text',
            label
          )
        }
      )

 cy.log(
  'Select Initial, eSeal and QR code'
)

cy.configureOrganisationDocument({
  daysToComplete: 2,
  signatureTemplate: '1',
  initialsRequired: true,
  esealRequired: true,
  qrCodeRequired: true,
})

cy.get('#InitialRequired')
  .should('be.checked')

cy.get('#Eseal_Required')
  .should('be.checked')

cy.get('#QrCodeRequired')
  .should('be.checked')

/*
 * First attempt: Initial permission should fail.
 */
cy.log('Verify Initial permission')

cy.get('#Continue')
  .should('be.visible')
  .and('not.be.disabled')
  .click()

cy.dismissPermissionMessage(
  /initial is not present/i
)

// Remove Initial after permission failure
cy.get('#InitialRequired')
  .uncheck({
    force: true,
  })
  .should('not.be.checked')

/*
 * Second attempt: eSeal permission should fail.
 */
cy.log('Verify eSeal permission')

cy.get('#Continue')
  .should('be.visible')
  .and('not.be.disabled')
  .click()

cy.dismissPermissionMessage(
  /you don't have eseal permission for logged in organization/i
)

// Remove eSeal after permission failure
cy.get('#Eseal_Required')
  .uncheck({
    force: true,
  })
  .should('not.be.checked')

/*
 * Third attempt: Continue with Signature and QR code.
 */
cy.log(
  'Continue without Initial and eSeal'
)

cy.get('#Continue')
  .should('be.visible')
  .and('not.be.disabled')
  .click()

cy.get('#pdf-container', {
  timeout: 60000,
}).should('be.visible')

cy.get(
  '.pdf-page[data-page-number="0"]',
  {
    timeout: 60000,
  }
)
  .should('exist')
  .and('be.visible')

// Signature should be available
cy.get('#SIGNATURE', {
  timeout: 30000,
})
  .should('be.visible')
  .and(
    'contain.text',
    'Signature'
  )

// QR code should be available
cy.get('#QRCODE', {
  timeout: 30000,
})
  .should('be.visible')
  .and(
    'contain.text',
    'QRCODE'
  )

// Unavailable paid fields should not be displayed
cy.get('#INITIAL')
  .should('not.be.visible')

cy.get('#ESEAL')
  .should('not.be.visible')

cy.get('#watermark-field')
  .should('be.visible')

cy.get('#Save')
  .should('exist')
  .and('contain.text', 'Sign')


  cy.get('#pdf-container', {
  timeout: 60000,
}).should('be.visible')

cy.get(
  '.pdf-page[data-page-number="0"]',
  {
    timeout: 60000,
  }
)
  .should('exist')
  .and('be.visible')

// Place Signature, QR code and any available paid fields
cy.placeAvailableSigningFields()

// Apply watermark only when available
cy.get('body').then(($body) => {
  const $watermark =
    $body.find('#watermark-field')

  if (
    $watermark.length > 0 &&
    $watermark.is(':visible')
  ) {
    cy.applyWatermark(
      'UGPASS TEST DOCUMENT'
    )
  }
})

// Start signing
cy.get('#Save', {
  timeout: 30000,
})
  .should('be.visible')
  .and('contain.text', 'Sign')
  .and('not.be.disabled')
  .click()

// Confirm signing started
cy.get('#signing-status-box', {
  timeout: 60000,
}).should('be.visible')

cy.get('#SigningModalheading')
  .should('be.visible')
  .and(
    'contain.text',
    'Document Signing Status'
  )

cy.get('#stepper-message')
  .should('be.visible')
  .and(
    'contain.text',
    'Check for UgPass mobile app notification'
  )
    }
  )
})