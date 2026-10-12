Feature: Add a newsletter to an edition hub layout section
	As an editor
	I want to add a newsletter to a section of an edition layout
	So that it appears in that section when the layout is published

	Background:
		Given the editor is using the Stand workspace
		And the editor is editing the layout for edition "uk" with empty sections "News" and "Sport", launched newsletters "Alpha" and "Beta" and a cancelled newsletter "Gamma"

	Scenario: Adding a newsletter and publishing persists the change
		When the editor opens the add newsletter area for section "News"
		And the editor adds "Alpha" to the layout
		Then "Alpha" is listed in section "News"
		And the add newsletter area is still open
		And "Alpha" is not offered in the add newsletter area
		And "Beta" is offered in the add newsletter area
		When the editor presses the "Save and publish layout" button
		Then the layout for edition "uk" is saved with "alpha" in section "News"

	Scenario: Cancelled newsletters are not offered
		When the editor opens the add newsletter area for section "News"
		Then "Gamma" is not offered in the add newsletter area

	Scenario: Only one add newsletter area is open at a time
		When the editor opens the add newsletter area for section "News"
		And the editor opens the add newsletter area for section "Sport"
		Then only 1 add newsletter area is open

	Scenario: Closing the add newsletter area
		When the editor opens the add newsletter area for section "News"
		And the editor closes the add newsletter area
		Then no add newsletter area is open

	Scenario: Adding a newsletter and cancelling leaves stored data unchanged
		When the editor opens the add newsletter area for section "News"
		And the editor adds "Alpha" to the layout
		And the editor presses the "Cancel" button
		Then the editor is asked to confirm discarding their changes
		When the editor confirms discarding the changes
		Then the stored layout is unchanged
