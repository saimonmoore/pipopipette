// TODO: Fix grid size to 3 x 3
describe('When player 1 first loads app', function() {
  const getStore = () => cy.window().its('app.store');
  const getStorage = () => cy.window().its('app.storage');

  before(function() {
    cy.visit('/');
    cy.hash({timeout: 2000}).then(hash => {
      Cypress.env('session_hash', hash);
    });
  });

  it('shows Welcome dialogue', function() {
    cy.contains('This is Pipopipette.');
  });

  it('redirects to url with session-specific hash', function() {
    const session_hash = Cypress.env('session_hash');
    expect(session_hash).to.match(/#\w{8}$/);
  });

  context('when visiting page with session', function() {
    before(function() {
      const session_hash = Cypress.env('session_hash');
      cy.visit('/' + session_hash);
    });

    it('shows Welcome dialogue', function() {
      cy.contains('This is Pipopipette.');
    });

    context('when the other player joins', function() {
      before(function() {
        // Wait for the app to load...
        cy
          .get('#root > div > header > div.Status > span')
          .invoke('text')
          .should('eq', 'Waiting for other player');

        getStore().then(store => {
          const colour = Cypress.env('player2_colour');
          const user_id = Cypress.env('player2_id');

          store.handlePlayerAdded({user_id, colour});
          cy
            .get('#root > div > header > div.Status > span')
            .invoke('text')
            .should('eq', 'Game started');
        });
      });

      it('hides Welcome dialogue', function() {
        cy.get('.WaitingForPlayer').should('not.exist');
      });

      it('status shows game started', function() {
        cy
          .get('#root > div > header > div.Status > span')
          .invoke('text')
          .should('eq', 'Game started');
      });

      it("shows player 1's turn", function() {
        cy.contains('Your turn');
      });

      it('shows score zero for player 1', function() {
        cy
          .get(
            '#root > div > header > div > div.LeftPanel > div > div.RightPanel > div.Score > span',
          )
          .invoke('text')
          .should('eq', 'Score: 0');
      });

      it('shows score zero for player 2', function() {
        cy
          .get(
            '#root > div > header > div > div.RightPanel > div > div.RightPanel > div.Score > span',
          )
          .invoke('text')
          .should('eq', 'Score: 0');
      });

      context('when player 1 plays 1 line', function() {
        before(function() {
          cy.addsLine({column: 0, row: 0}, {column: 1, row: 0});
        });

        it("shows player 2's turn", function() {
          cy.contains('Their turn');
        });

        it('shows forbidden cursor', function() {
          cy.get('.Dot').should($dots => {
            $dots.each((i, $dot) => expect($dot).to.have.class('TheirTurn'));
          });
        });

        it('shows 1 line', function() {
          cy.get('.Line').should($lines => {
            expect($lines).to.have.length(1);
          });
        });

        it('shows score zero for player 1', function() {
          cy
            .get(
              '#root > div > header > div > div.LeftPanel > div > div.RightPanel > div.Score > span',
            )
            .invoke('text')
            .should('eq', 'Score: 0');
        });

        it('shows score zero for player 2', function() {
          cy
            .get(
              '#root > div > header > div > div.RightPanel > div > div.RightPanel > div.Score > span',
            )
            .invoke('text')
            .should('eq', 'Score: 0');
        });
      });

      context('when player 1 closes a box', function() {
        before(function() {
          cy.otherAddsLine({column: 1, row: 0}, {column: 1, row: 1});
          cy.addsLine({column: 1, row: 1}, {column: 0, row: 1});
          cy.otherAddsLine({column: 1, row: 1}, {column: 2, row: 1});
          cy.addsLine({column: 0, row: 1}, {column: 0, row: 0});
        });

        it("shows player 1's turn", function() {
          cy.contains('Your turn');
        });

        it('shows 1 box closed', function() {
          cy.get('.Box.Closed').should($boxes => {
            expect($boxes).to.have.length(1);
          });
        });

        it('shows score 1 for player 1', function() {
          cy
            .get(
              '#root > div > header > div > div.LeftPanel > div > div.RightPanel > div.Score > span',
            )
            .invoke('text')
            .should('eq', 'Score: 1');
        });

        it('shows score 0 for player 2', function() {
          cy
            .get(
              '#root > div > header > div > div.RightPanel > div > div.RightPanel > div.Score > span',
            )
            .invoke('text')
            .should('eq', 'Score: 0');
        });
      });

      context('when player 2 closes a box', function() {
        before(function() {
          cy.addsLine({column: 2, row: 1}, {column: 2, row: 0});
          cy.otherAddsLine({column: 2, row: 0}, {column: 1, row: 0});
        });

        it("shows player 2's turn", function() {
          cy.contains('Their turn');
        });

        it('shows 2 boxes closed', function() {
          cy.get('.Box.Closed').should($boxes => {
            expect($boxes).to.have.length(2);
          });
        });

        it('shows score 1 for player 1', function() {
          cy
            .get(
              '#root > div > header > div > div.LeftPanel > div > div.RightPanel > div.Score > span',
            )
            .invoke('text')
            .should('eq', 'Score: 1');
        });

        it('shows score 1 for player 2', function() {
          cy
            .get(
              '#root > div > header > div > div.RightPanel > div > div.RightPanel > div.Score > span',
            )
            .invoke('text')
            .should('eq', 'Score: 1');
        });

        it('shows forbidden cursor', function() {
          cy.get('.Dot').should($dots => {
            $dots.each((i, $dot) => expect($dot).to.have.class('TheirTurn'));
          });
        });
      });

      context('when player 2 wins', function() {
        before(function() {
          cy.otherAddsLine({column: 2, row: 1}, {column: 2, row: 2});
          cy.addsLine({column: 2, row: 2}, {column: 1, row: 2});
          cy.otherAddsLine({column: 1, row: 2}, {column: 1, row: 1});
          cy.otherAddsLine({column: 1, row: 2}, {column: 0, row: 2});
          cy.addsLine({column: 0, row: 2}, {column: 0, row: 1});
        });

        it('shows 4 boxes closed', function() {
          cy.get('.Box.Closed').should($boxes => {
            expect($boxes).to.have.length(4);
          });
        });

        it('shows score 2 for player 1', function() {
          cy
            .get(
              '#root > div > header > div > div.LeftPanel > div > div.RightPanel > div.Score > span',
            )
            .invoke('text')
            .should('eq', 'Score: 2');
        });

        it('shows score 2 for player 2', function() {
          cy
            .get(
              '#root > div > header > div > div.RightPanel > div > div.RightPanel > div.Score > span',
            )
            .invoke('text')
            .should('eq', 'Score: 2');
        });

        it('shows Game Over dialogue', function() {
          cy.contains('Game Over');
        });

        it('shows it was a draw', function() {
          cy.contains('Draw');
        });
      });
    });
  });
});
