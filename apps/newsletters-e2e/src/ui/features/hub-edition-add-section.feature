@feature-add-section-to-layout
Feature: Add a section to an edition hub layout
	As an editor
	I want to add sections to an edition layout
	So that I can organise the newsletters

	Background:
		Given the editor is using the Stand workspace

	Rule: Adding a section and publishing persists the change

		Background:
			Given the editor is editing the layout for edition "uk" with the following sections
				| title |
				| News  |
				| Sport |

		Scenario: Adding a section to the top of the section list
			When the editor adds a new section to the beginning of the section list
			Then a new section with no name is displayed on the page
			When the editor publishes the layout
			Then the stored layout for edition "uk" consists of the following sections
				| title |
				|       |
				| News  |
				| Sport |
			And a success message is shown

		Scenario: Adding a section to the bottom of the section list
			When the editor adds a new section to the end of the section list
			Then a new section with no name is displayed on the page
			When the editor publishes the layout
			Then the stored layout for edition "uk" consists of the following sections
				| title |
				| News  |
				| Sport |
				|       |
			And a success message is shown

		Scenario: Adding a section between the "News" and "Sport" sections
			When the editor adds a new section between the "News" and "Sport" sections
			Then a new section with no name is displayed on the page
			When the editor publishes the layout
			Then the stored layout for edition "uk" consists of the following sections
				| title |
				| News  |
				|       |
				| Sport |
			And a success message is shown

	Rule: Cancelling an edit leaves the stored data unchanged

		Scenario: Adding a section and cancelling
			Given the editor is editing the layout for edition "uk" with the following sections
				| title |
				| News  |
				| Sport |
			When the editor adds a new section between the "News" and "Sport" sections
			Then a new section with no name is displayed on the page
			When the editor cancels editing the layout
			Then the editor is asked to confirm discarding their changes
			When the editor confirms discarding the changes
			Then the editor is returned to the read-only layout for edition "uk"
			And the stored layout for edition "uk" consists of the following sections
				| title |
				| News  |
				| Sport |
			And no layout has been saved
