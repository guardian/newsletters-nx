import { getLinkOnNavBar, getPageHeading } from '../support/app.po';

describe('newsletters-ui', () => {
	beforeEach(() => cy.visit('/'));

	it('should display the link on the nav bar', () => {
		getLinkOnNavBar().contains('Newsletters');
	});
});

describe('newsletters-ui launched page', () => {
	beforeEach(() => cy.visit('/launched'));

	it('should display the link on the nav bar', () => {
		getLinkOnNavBar().contains('Newsletters');
	});

	it('should render the heading', () => {
		getPageHeading().contains('View launched newsletters');
	});
});

describe('newsletters-ui templates page', () => {
	beforeEach(() => cy.visit('/templates'));

	it('should display the link on the nav bar', () => {
		getLinkOnNavBar().contains('Newsletters');
	});

	it('should render the heading', () => {
		getPageHeading().contains('Email Rendering Templates');
	});
});
