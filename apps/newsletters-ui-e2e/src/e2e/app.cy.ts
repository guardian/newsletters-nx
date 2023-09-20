import { getLinkOnNavBar } from '../support/app.po';

describe('newsletters-ui', () => {
	beforeEach(() => cy.visit('/'));

	it('should display the link on the nav bar', () => {
		// Custom command example, see `../support/commands.ts` file
		cy.login('my-email@something.com', 'myPassword');

		// Function helper example, see `../support/app.po.ts` file
		getLinkOnNavBar().contains('Newsletters');
	});
});
