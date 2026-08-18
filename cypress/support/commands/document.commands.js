// Custom command to open the "Sign Document Yourself" flow
Cypress.Commands.add(
  'openSignDocumentYourself',
  () => {
    cy.visit('/Dashboard')

    cy.contains(
      'h5',
      'Sign Document Yourself',
      {
        timeout: 30000,
      }
    )
      .should('be.visible')
      .closest('.card-body')
      .find('button.sign-yourself-btn')
      .should('be.visible')
      .and('be.enabled')
      .click()

    cy.location('pathname', {
      timeout: 30000,
    }).should(
      'eq',
      '/Documents/CreateDocuments'
    )

    cy.location('search')
      .should('include', 'param=SIGN')

    cy.contains(
      'Prepare document for Signing',
      {
        timeout: 30000,
      }
    ).should('be.visible')
  }
)

// Confirm that the document preparation page is ready for a document to be uploaded

Cypress.Commands.add(
  'prepareSigningDocument',
  (
    documentPath,
    options = {}
  ) => {
    const {
      expectContinue = true,
      expectQuickSign = true,
    } = options

    // Confirm actions are initially disabled
    if (expectContinue) {
      cy.get('#Continue')
        .should('be.visible')
        .and('be.disabled')
    }

    if (expectQuickSign) {
      cy.get('#quickSign')
        .should('be.visible')
        .and('be.disabled')
    }

    // Use the global upload command
    cy.uploadDocument(documentPath)

    // Wait for actions to become available
    if (expectContinue) {
      cy.get('#Continue', {
        timeout: 60000,
      })
        .should('be.visible')
        .and('not.be.disabled')
    }

    if (expectQuickSign) {
      cy.get('#quickSign', {
        timeout: 60000,
      })
        .should('be.visible')
        .and('not.be.disabled')
    }
  }
)

Cypress.Commands.add(
  'startSigningFlow',
  (options = {}) => {
    const {
      accountType,
      user,
      documentPath,
      expectContinue = true,
      expectQuickSign = true,
    } = options

    if (!accountType) {
      throw new Error(
        'accountType is required.'
      )
    }

    if (!user) {
      throw new Error(
        `The ${accountType} UgPass user is missing.`
      )
    }

    if (!documentPath) {
      throw new Error(
        'documentPath is required.'
      )
    }

    cy.ugpassLogin(
      accountType,
      user
    )

    cy.openSignDocumentYourself()

    cy.prepareSigningDocument(
      documentPath,
      {
        expectContinue,
        expectQuickSign,
      }
    )
  }
)