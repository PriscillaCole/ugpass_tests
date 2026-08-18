describe('UgPass Login Flow', () => {
  beforeEach(() => {
    cy.ugpassLogin(
    'individual',
    Cypress.env('UGPASS_INDIVIDUAL_USER')
  )
  })

  it('should log in and display the dashboard', () => {
    // cy.session restores authentication but leaves the page blank
    cy.visit('/Dashboard')

    cy.location('hostname', {
      timeout: 30000,
    }).should('eq', 'sign.ugpass.go.ug')

    cy.location('pathname', {
      timeout: 30000,
    }).should('include', '/Dashboard')

    cy.contains('Dashboard', {
      timeout: 30000,
    }).should('be.visible')
  })
})