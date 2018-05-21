describe('When player 1 first loads app', function() {
  before(function() {
    cy.visit('/');
    cy.hash({ timeout: 2000 }).then((hash) => {
      Cypress.env("session_hash", hash)
    })
  })

  it('shows Welcome dialogue', function() {
    cy.contains('This is Pipopipette.');
  })

  it('redirects to url with session-specific hash', function() {
    const session_hash = Cypress.env("session_hash")
    expect(session_hash).to.match(/#\w{8}$/)
  })

  describe('when visiting page with session', function() {
    before(function() {
      const session_hash = Cypress.env("session_hash")
      cy.visit('/' + session_hash);
    })

    it('shows Welcome dialogue', function() {
      cy.contains('This is Pipopipette.');
    })
  });
})
