describe('Sign Document Yourself', () => {
  const testDocument = 'cypress/fixtures/sample_document.docx'

  beforeEach(() => {
    cy.ugpassLogin(Cypress.env('UGPASS_USER'))
    cy.visit('/Dashboard')

    // Open Sign Document Yourself
    cy.contains('h5', 'Sign Document Yourself', {
      timeout: 30000,
    })
      .should('be.visible')
      .closest('.card-body')
      .find('button.sign-yourself-btn')
      .should('be.visible')
      .and('be.enabled')
      .click()

    // Confirm that the document creation page opened
    cy.location('pathname', {
      timeout: 30000,
    }).should('eq', '/Documents/CreateDocuments')

    cy.location('search').should('include', 'param=SIGN')

    cy.contains('Prepare document for Signing', {
      timeout: 30000,
    }).should('be.visible')

    // Both buttons should initially be disabled
    cy.get('#Continue').should('be.disabled')
    cy.get('#quickSign').should('be.disabled')

    // Upload the test document
    cy.get('#File')
      .should('exist')
      .selectFile(testDocument, {
        force: true,
      })

    // Confirm that the correct file was selected
    cy.get('#File').should(($input) => {
      expect($input[0].files).to.have.length(1)
      expect($input[0].files[0].name)
        .to.equal('sample_document.docx')
    })

    // Confirm that the document name was populated
    cy.get('#DocumentName', {
      timeout: 30000,
    })
      .should('not.have.value', '')

    // Wait for the upload to finish and both actions to become available
    cy.get('#Continue', {
      timeout: 60000,
    })
      .should('be.visible')
      .and('not.be.disabled')

    cy.get('#quickSign', {
      timeout: 60000,
    })
      .should('be.visible')
      .and('not.be.disabled')
  })

  it('opens the document preparation screen when Continue is clicked', () => {
    cy.get('#Continue')
      .should('be.visible')
      .and('not.be.disabled')
      .click()

    // Confirm that the PDF preparation viewer opened
    cy.get('#viwer', {
      timeout: 60000,
    }).should('be.visible')

    cy.get('#viewerui').should('be.visible')
    cy.get('#pdf-container').should('be.visible')

    // The Signature field should be available
    cy.get('#SIGNATURE')
      .should('be.visible')
      .and('contain.text', 'Signature')

    // The signing button should be present in the viewer
    cy.get('#Save')
      .should('exist')
      .and('contain.text', 'Sign')
  })

  it('starts the Quick Sign process when Quick Sign is clicked', () => {
    cy.get('#quickSign')
      .should('be.visible')
      .and('not.be.disabled')
      .click()

    // Confirm that the signing status interface opened
    cy.get('#signing-status-box', {
      timeout: 60000,
    }).should('be.visible')

    cy.get('#SigningModalheading')
      .should('be.visible')
      .and('contain.text', 'Document Signing Status')

    cy.get('#stepper-message')
      .should('be.visible')
      .and(
        'contain.text',
        'Check for UgPass mobile app notification'
      )

    // Confirm the signing process has started
    cy.contains('.step-label', 'Signatory Verification')
      .should('be.visible')

    cy.contains('.step-label', 'Document Signing')
      .should('be.visible')

    cy.contains('.step-label', 'Signing Successful')
      .should('be.visible')
  })
})