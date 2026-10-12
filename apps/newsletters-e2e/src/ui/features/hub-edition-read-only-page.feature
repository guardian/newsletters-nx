Feature: View and edit an edition hub layout
	As an editor
	I want to review the sections, newsletters, and statuses in an edition layout
	So that I can understand its content before editing

	Background:
		Given the editor is using the Stand workspace

	Scenario Outline: Read-only mode offers an edit action
		Given the editor is viewing the layout for edition "<edition>" in read-only mode
		Then the "Edit layout" button is visible
		And the edit history controls are not visible
		And the "Publish layout" button is not visible

		Examples:
			| edition |
			| uk      |
			| us      |
			| au      |
			| int     |
			| eur     |

	Scenario Outline: Starting editing navigates to the edit page
		Given the editor is viewing the layout for edition "<edition>" in read-only mode
		When the editor chooses to edit the layout
		Then the editor is viewing the edit page at "/layouts/edit/<edition>"

		Examples:
			| edition |
			| uk      |
			| us      |
			| au      |
			| int     |
			| eur     |

	Scenario: An empty layout explains how to add content
		Given the editor is viewing the layout for edition "uk" in read-only mode
		Then a content box is displayed beneath the top section
		And the content box shows 'No content available. Click on "Edit layout" to add content.'
		And the "Edit layout" button is visible

	Scenario: Sections display their position and title in order
		Given the edition layout contains these sections:
			| position | title       |
			| 1        | Get started |
			| 2        | In depth    |
		When the edition layout loads
		Then each section is displayed in a bordered box beneath the edition header
		Then the section headings appear in this order:
			| heading                |
			| Section 1: Get started |
			| Section 2: In depth    |

	Scenario: A section lists its newsletter with a thumbnail and detail link
		Given the "Get started" section contains the newsletter "Morning Briefing" with status "live"
		When the edition layout loads
		Then "Morning Briefing" is listed in the "Get started" section
		And its newsletter thumbnail is visible
		And its title links to "/launched/morning-briefing"

	Scenario Outline: A newsletter displays its status
		Given the "Get started" section contains the newsletter "Morning Briefing" with status "<status>"
		When the edition layout loads
		Then "Morning Briefing" displays a "<label>" status pill

		Examples:
			| status    | label     |
			| live      | Live      |
			| pending   | Pending   |
			| paused    | Paused    |
			| cancelled | Cancelled |

	Scenario: A paused newsletter has a help control beside its status
		Given the "Get started" section contains the newsletter "Morning Briefing" with status "paused"
		When the edition layout loads
		Then a question-mark help control is visible beside the "Paused" status pill

	Scenario: Paused-state help opens on keyboard focus
		Given the "Get started" section contains the newsletter "Morning Briefing" with status "paused"
		When the edition layout loads
		And the editor moves keyboard focus to the status help control
		Then the paused-state tooltip is visible

	Scenario Outline: Status help explains why the newsletter is not visible
		Given the "Get started" section contains the newsletter "Morning Briefing" with status "<status>"
		When the edition layout loads
		And the editor focuses the status help control
		Then the status tooltip shows "<message>"

		Examples:
			| status    | message                                                                                  |
			| pending   | Not yet visible on the newsletters hub. It will appear once it's set to Live.           |
			| paused    | This newsletter is not yet live - it will not appear until its status is updated.        |
			| cancelled | This newsletter has been cancelled and will not be displayed on the newsletters hub.      |
