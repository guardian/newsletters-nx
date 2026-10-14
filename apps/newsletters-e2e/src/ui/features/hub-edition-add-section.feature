@feature-add-section-to-layout
Feature: Add a section to an edition hub layout
	As an editor
	I want to add sections to an edition layout
	So that I can organise the newsletters

	Background:
		Given the editor is using the Stand workspace

	Rule: Adding a section and publishing persists the change

		Scenario: Adding a newsletter before another newsletter
			Given the editor is editing the layout for edition "uk" with newsletters "Alpha" and "Beta" in section "News"
			When the editor adds a new section before the "News" section
			Then a new section with no name is displayed on the page
			When the editor publishes the layout
			Then the layout for edition "uk" is saved with a new unnamed section before the "News" section
			And a success message is shown

		Scenario: Adding a newsletter after another newsletter
			Given the editor is editing the layout for edition "uk" with newsletters "Alpha" and "Beta" in section "News"
			When the editor adds a new section after the "News" section
			Then a new section with no name is displayed on the page
			When the editor publishes the layout
			Then the layout for edition "uk" is saved with a new unnamed section after the "News" section
			And a success message is shown

	Rule: Cancelling an edit leaves the stored data unchanged

		Scenario: Adding a newsletter and cancelling
			Given the editor is editing the layout for edition "uk" with newsletters "Alpha" and "Beta" in section "News"
			When the editor adds a new section before the "News" section
			Then a new section with no name is displayed on the page
			When the editor cancels editing the layout
			Then the editor is asked to confirm discarding their changes
			When the editor confirms discarding the changes
			Then the editor is returned to the read-only layout for edition "uk"
			And there is only 1 section named "News" in the layout
			And no layout has been saved
