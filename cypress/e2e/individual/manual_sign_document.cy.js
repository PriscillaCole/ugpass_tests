describe(
  'Individual Manual Signing',
  () => {
    const testDocument =
      'cypress/fixtures/documents/individual_manual_sign.docx'

    beforeEach(() => {
      cy.startSigningFlow({
        accountType: 'individual',

        user: Cypress.env(
          'UGPASS_INDIVIDUAL_USER'
        ),

        documentPath: testDocument,
      })
    })

  it('places the signature and applies a watermark', () => {
    cy.get('#Continue').click()

    cy.get('#viwer', {
      timeout: 60000,
    }).should('be.visible')

    cy.get('#pdf-container', {
      timeout: 60000,
    }).should('be.visible')

    cy.get(
      '.pdf-page[data-page-number="0"] canvas',
      { timeout: 60000 }
    )
      .should('be.visible')
      .and(($canvas) => {
        expect($canvas[0].width)
          .to.be.greaterThan(0)

        expect($canvas[0].height)
          .to.be.greaterThan(0)
      })

    // Ensure the signatory is selected
    cy.get('#emailList li.list')
      .first()
      .should('be.visible')
      .then(($signatory) => {
        if (!$signatory.hasClass('selected')) {
          cy.wrap($signatory).click()
        }
      })

    // Native drag-and-drop
    cy.placeSignatureOnPdf()

    // Add watermark
    cy.get('#watermark-field')
      .should('be.visible')
      .clear()
      .type('UGPASS TEST DOCUMENT')

    cy.get('#setwatermarkid')
      .should('be.visible')
      .and('be.enabled')
      .click()

    cy.get('#Save', {
      timeout: 30000,
    })
      .should('be.visible')
      .and('not.be.disabled')
      .click()

    cy.get('#signing-status-box', {
      timeout: 60000,
    }).should('be.visible')

    cy.get('#SigningModalheading')
      .should(
        'contain.text',
        'Document Signing Status'
      )

    cy.get('#stepper-message')
      .should(
        'contain.text',
        'Check for UgPass mobile app notification'
      )
  })
})