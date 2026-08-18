Cypress.Commands.add(
  'uploadDocument',
  (documentPath) => {
    if (!documentPath) {
      throw new Error(
        'A document path is required.'
      )
    }

    /*
     * Supports both Windows and Unix-style paths.
     *
     * Example:
     * cypress/fixtures/documents/sample_document.docx
     * becomes:
     * sample_document.docx
     */
    const expectedFileName =
      documentPath.split(/[/\\]/).pop()

    cy.get('#File', {
      timeout: 30000,
    })
      .should('exist')
      .selectFile(documentPath, {
        force: true,
      })

    // Confirm that exactly one file was selected
    cy.get('#File')
      .should(($input) => {
        const files = $input[0].files

        expect(
          files,
          'selected files'
        ).to.have.length(1)

        expect(
          files[0].name,
          'selected filename'
        ).to.equal(expectedFileName)
      })

    // Confirm that the application populated the name
    cy.get('#DocumentName', {
      timeout: 30000,
    })
      .should('be.visible')
      .and('not.have.value', '')

    /*
     * Return the document-name input so the test
     * can chain another assertion if necessary.
     */
    return cy.get('#DocumentName')
  }
)