describe('Individual Quick Sign', () => {
  const testDocument =
    'cypress/fixtures/documents/individual_quick_sign.docx'

  beforeEach(() => {
    cy.startSigningFlow({
      accountType: 'individual',

      user: Cypress.env(
        'UGPASS_INDIVIDUAL_USER'
      ),

      documentPath: testDocument,

      expectContinue: true,
      expectQuickSign: true,
    })
  })

  it(
    'starts the Quick Sign process',
    () => {
      cy.get('#quickSign')
        .should('be.visible')
        .and('not.be.disabled')
        .click()

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

      cy.contains(
        '.step-label',
        'Signatory Verification'
      ).should('be.visible')

      cy.contains(
        '.step-label',
        'Document Signing'
      ).should('be.visible')

      cy.contains(
        '.step-label',
        'Signing Successful'
      ).should('be.visible')
    }
  )
})