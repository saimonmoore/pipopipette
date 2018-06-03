// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

const getStore = () => cy.window().its('app.store');

/*
 * Assuming a grid of dots like this:
 *
 * 0 3 6
 * 1 4 7
 * 2 5 8
 *
 * Usage:
 *
 *   cy.addLine(0, 3)
 *
 *   Will result in a line like this:
 *
 * 0-3 6
 * 1 4 7
 * 2 5 8
 *
 */
Cypress.Commands.add('addsLine', (from, to) => {
  cy
    .get('.Dot')
    .eq(from)
    .click('left');
  cy
    .get('.Dot')
    .eq(to)
    .click('left');
});

/*
 * Assuming a grid of dots ( e.g. 3 x 3) with x/y axis like this:
 *
 * 0 1 2
 * 1
 * 2
 *
 * Usage:
 *
 *   cy.OtherAddsLine([0,0], [1,0])
 *
 *   where each argument represents columns and row coordinates:
 *
 *   from: [column, row]
 *   to:   [column, row]
 *
 *   Will result in a line like this:
 *
 * 0-3 6
 * 1 4 7
 * 2 5 8
 *
 */
Cypress.Commands.add('otherAddsLine', (from, to) => {
  const colour = Cypress.env('player2_colour');
  const user_id = Cypress.env('player2_id');
  const player = {colour, user_id};
  const fromDot = {column: from[0], row: from[1]};
  const toDot = {column: to[0], row: to[1]};
  const data = {from: fromDot, to: toDot, colour, player};

  getStore().then(store => {
    store.handleLineAdded(data);
  });
});
