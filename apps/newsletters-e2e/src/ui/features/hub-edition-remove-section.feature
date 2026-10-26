@feature-remove-section-from-layout
@mode:serial
Feature: Remove a section from an edition hub layout
	As an editor
	I want to remove sections to an edition layout
	So that I can organise the newsletters

	Background:
		Given the editor is using the Stand workspace

	Rule: Removing a section and publishing persists the change
		Background:
			Given the stored layout for the uk edition consists of the following sections
				| title |
				| News  |
				| Opinion |
				| Sport |
			And the editor is editing the layout for the uk edition

		Scenario: Removing a section and publishing
			When the editor removes the 'Opinion' section
			Then the 'Opinion' section should not be visible
			When the editor publishes the layout
			Then the stored layout for the uk edition should consist of the following sections
				| title |
				| News  |
				| Sport |
			Then the editor is returned to the read-only layout for edition "uk"

	Rule: Cancelling an edit leaves the stored data unchanged
		Background:
			Given the stored layout for the uk edition consists of the following sections
				| title |
				| News  |
				| Opinion |
				| Sport |
			And the editor is editing the layout for the uk edition

		Scenario: Removing a section and cancelling
			When the editor removes the 'Opinion' section
			Then the 'Opinion' section should not be visible
			When the editor cancels editing the layout
			Then the editor is asked to confirm discarding their changes
			When the editor confirms discarding the changes
			Then the editor is returned to the read-only layout for edition "uk"
			And the stored layout for the uk edition should consist of the following sections
				| title |
				| News  |
				| Opinion |
				| Sport |
			And no layout has been saved

	Rule: Confirmation is required to delete a section
		Background:
			Given the stored layout for the uk edition consists of the following sections
				| title |
				| News  |
				| Opinion |
				| Sport |
			And the editor is editing the layout for the uk edition

		Scenario: Confirming deletion removes the section from the edit view
			When the editor requests removal of the 'Opinion' section
			Then the editor is asked to confirm removal
			When the editor confirms removal
			Then the 'Opinion' section is not shown on the page

		Scenario: Cancelling deletion keeps the section in the edit view
			When the editor requests removal of the 'Opinion' section
			Then the editor is asked to confirm removal
			When the editor cancels removal
			Then the 'Opinion' section remains on the page


