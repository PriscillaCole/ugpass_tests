describe('UgPass Manual Document Signing', () => {
  const documentPath =
    'cypress/fixtures/manual_sign_document.docx'

  beforeEach(() => {
    cy.ugpassLogin(Cypress.env('UGPASS_USER'))
    cy.visit('/Dashboard')

    cy.contains('h5', 'Sign Document Yourself', {
      timeout: 30000,
    })
      .closest('.card-body')
      .find('button.sign-yourself-btn')
      .should('be.visible')
      .click()

    cy.location('pathname', {
      timeout: 30000,
    }).should(
      'eq',
      '/Documents/CreateDocuments'
    )

    cy.get('#File')
      .should('exist')
      .selectFile(documentPath, {
        force: true,
      })

    cy.get('#DocumentName', {
      timeout: 30000,
    }).should('not.have.value', '')

    cy.get('#Continue', {
      timeout: 60000,
    })
      .should('be.visible')
      .and('not.be.disabled')
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