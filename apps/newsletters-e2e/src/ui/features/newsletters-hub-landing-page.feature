@newsletters-hub-landing-page
@mode:serial
Feature: Newsletters hub landing page
	The Stand Newsletters hub landing page shows a set of Tiles linking to the
	individual 'detail' pages for each edition

	Scenario: The 'all newsletters page' link navigates to the page on the live site
		Given an editor's workspace uses the Stand design
		And the editor is viewing the newsletter hub landing page
		When the editor clicks the 'all newsletters page' link
		Then the user should be navigated to the all newsletters page on the live site

	Rule: There is a tile for each edition linking to a detail page

		Background:
			Given an editor's workspace uses the Stand design
			And the editor is viewing the newsletter hub landing page

		Scenario Outline: The edition tiles link to their respective detail pages
			When the editor clicks the '<name>' title
			Then the user should be navigated to the '<url>' page

			Examples:
				| name           | url          |
				| United Kingdom | /layouts/uk  |
				| United States  | /layouts/us  |
				| Australia      | /layouts/au  |
				| International  | /layouts/int |
				| Europe         | /layouts/eu  |

	Rule: The edition tiles display a summary of the newsletter grouping for their edition

		Background:
			Given an editor's workspace uses the Stand design

		Scenario: An edition with no layout setup displays the text 'no layout'
			Given the 'International' edition does not have a layout configured
			And the editor is viewing the newsletter hub landing page
			Then the 'International' tile should display the text 'No layout'

		Scenario Outline: An edition with a layout setup displays appropriate summary text
			Given the '<edition>' edition has <newsletters> newsletters and <groups> groups
			And the editor is viewing the newsletter hub landing page
			Then the '<edition>' tile should display the text '<text>'

			Examples:
				| edition        | newsletters | groups | text                        |
				| United Kingdom | 1           | 1      | 1 newsletter in 1 group     |
				| United States  | 1           | 2      | 1 newsletter in 2 groups    |
				| Australia      | 2           | 1      | 2 newsletters in 1 group    |
				| International  | 15          | 30     | 15 newsletters in 30 groups |
				| Europe         | 15          | 30     | 15 newsletters in 30 groups |

	Rule: The stand design only applies to users who have opted in

		Scenario: A user who has not opted in sees the legacy design
			Given an editor's workspace uses the Legacy design
			When the editor navigates to the newsletter hub landing page
			Then the page is displayed in the legacy design

		Scenario: A user who has opted in sees the stand design
			Given an editor's workspace uses the Stand design
			When the editor navigates to the newsletter hub landing page
			Then the page is displayed in the stand design
