const setCheckbox = (
  selector,
  shouldBeChecked
) => {
  cy.get(selector, {
    timeout: 30000,
  })
    .should('exist')
    .then(($checkbox) => {
      if (shouldBeChecked) {
        cy.wrap($checkbox)
          .check({
            force: true,
          })
          .should('be.checked')
      } else {
        cy.wrap($checkbox)
          .uncheck({
            force: true,
          })
          .should('not.be.checked')
      }
    })
}

Cypress.Commands.add(
  'configureOrganisationDocument',
  (options = {}) => {
    const {
      daysToComplete = 2,
      signatureTemplate = '1',
      initialsRequired = false,
      esealRequired = false,
      qrCodeRequired = false,
    } = options

    cy.get('#DaysToComplete', {
      timeout: 30000,
    })
      .should('be.visible')
      .clear()
      .type(String(daysToComplete))
      .should(
        'have.value',
        String(daysToComplete)
      )

    cy.get('#templateSelect', {
      timeout: 30000,
    })
      .should('be.visible')
      .select(String(signatureTemplate))
      .should(
        'have.value',
        String(signatureTemplate)
      )

    setCheckbox(
      '#InitialRequired',
      initialsRequired
    )

    setCheckbox(
      '#Eseal_Required',
      esealRequired
    )

    setCheckbox(
      '#QrCodeRequired',
      qrCodeRequired
    )
  }
)

Cypress.Commands.add(
  'dismissPermissionMessage',
  (expectedMessage) => {
    const alertSelector =
      '.sweet-alert.showSweetAlert.visible'

    // Confirm that the visible SweetAlert opened
    cy.get(alertSelector, {
      timeout: 30000,
    }).should('be.visible')

    // Confirm the correct permission message
    cy.contains(
      `${alertSelector} p`,
      expectedMessage,
      {
        timeout: 30000,
        matchCase: false,
      }
    ).should('be.visible')

    // Click the OK button belonging to this alert only
    cy.get(
      `${alertSelector} button.confirm`,
      {
        timeout: 30000,
      }
    )
      .should('be.visible')
      .and('contain.text', 'OK')
      .click()

    // Confirm that SweetAlert closed
    cy.get(
      '.sweet-alert.showSweetAlert.visible',
      {
        timeout: 30000,
      }
    ).should('not.exist')
  }
)