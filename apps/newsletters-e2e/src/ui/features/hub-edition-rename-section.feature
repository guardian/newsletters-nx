@feature-rename-section-in-layout
@mode:serial
Feature: Rename a section in an edition hub layout
	As an editor
	I want to rename sections to an edition layout
	So that I can organise the newsletters

	Background:
		Given the editor is using the Stand workspace

	Rule: Renaming a section and publishing persists the change

		Background:
			Given the stored layout for the uk edition consists of the following sections
				| title   |
				| News    |
				| Opinion |
				| Sport   |
			And the editor is editing the layout for the uk edition

		Scenario: Renaming a section and publishing
			When the editor renames the 'Opinion' section to 'Culture'
			Then a section named 'Opinion' should not be visible
			And a section named 'Culture' should be visible
			When the editor publishes the layout
			Then the stored layout for the uk edition should consist of the following sections
				| title   |
				| News    |
				| Culture |
				| Sport   |
			And a success message is shown

	Rule: Cancelling an edit leaves the stored data unchanged

		Background:
			Given the stored layout for the uk edition consists of the following sections
				| title   |
				| News    |
				| Opinion |
				| Sport   |
			And the editor is editing the layout for the uk edition

		Scenario: Renaming a section and cancelling
			When the editor renames the 'Opinion' section to 'Culture'
			Then a section named 'Opinion' should not be visible
			And a section named 'Culture' should be visible
			When the editor cancels editing the layout
			Then the editor is asked to confirm discarding their changes
			When the editor confirms discarding the changes
			Then the editor is returned to the read-only layout for edition "uk"
			And the stored layout for the uk edition should consist of the following sections
				| title   |
				| News    |
				| Opinion |
				| Sport   |
			And no layout has been saved

	Rule: Sections with a blank name are labelled as 'Unnamed section'

		Background:
			Given the stored layout for the uk edition consists of the following sections
				| title   |
				| News    |
				| Opinion |
				| Sport   |
			And the editor is editing the layout for the uk edition

		Scenario: Renaming a section to ''
			When the editor renames the 'Opinion' section to ''
			Then a section named 'Opinion' should not be visible
			And a section named 'Unnamed section' should be visible
