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
 * Assuming a grid of dots ( e.g. 3 x 3) with x/y axis like this:
 *
 * 0 1 2
 * 1
 * 2
 *
 * Usage:
 *
 *   cy.addLine({ column: 0, row: 0 }, { column: 1, row: 0 })
 *
 *   Will result in a line like this:
 *
 * 0-3 6
 * 1 4 7
 * 2 5 8
 *
 */
Cypress.Commands.add('addsLine', (from, to) => {
  const {column: xfrom, row: yfrom} = from;
  const {column: xto, row: yto} = to;

  cy.get(`[data-coordinates='x:${xfrom}y:${yfrom}']`).click('left');
  cy.get(`[data-coordinates='x:${xto}y:${yto}']`).click('left');
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
 *   cy.otherAddsLine({ column: 0, row: 0 }, { column: 1, row: 0 })
 *
 *   where each argument represents columns and row coordinates.
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
  const data = {from, to, colour, player};

  getStore().then(store => {
    store.handleLineAdded(data);
  });
});
