describe('When player 1 first loads app', function() {
  before(function() {
    cy.visit('/');
    cy.hash({ timeout: 2000 }).then((hash) => {
      Cypress.env("session_hash", hash)
    })
  })

  it('shows Welcome dialogue', function() {
    cy.contains('This is Pipopipette.')
  })

  it('redirects to url with session-specific hash', function() {
    const session_hash = Cypress.env("session_hash")
    expect(session_hash).to.match(/#\w{8}$/)
  })

  context('when visiting page with session', function() {
    const getStore = () => cy.window().its('app.store')

    before(function() {
      const session_hash = Cypress.env("session_hash")
      cy.visit('/' + session_hash)
    })

    it('shows Welcome dialogue', function() {
      cy.contains('This is Pipopipette.')
    })

    context('when the other player joins', function() {
      before(function() {
        getStore().then(store => {
          store.handlePlayerAdded({ user_id: 1, colour: "green" })
        })
      })

      it('hides Welcome dialogue', function() {
        cy.get('.WaitingForPlayer').should('not.exist')
      })

      it('shows correct turn', function() {
        cy.contains('Your turn')
      })

      it('shows score zero for player 1', function() {
        cy.get('#root > div > header > div > div.LeftPanel > div > div.RightPanel > div.Score > span').invoke('text').should('eq', 'Score: 0');
      })

      it('shows score zero for player 2', function() {
        cy.get('#root > div > header > div > div.RightPanel > div > div.RightPanel > div.Score > span').invoke('text').should('eq', 'Score: 0');
      })
    });
  });
})
