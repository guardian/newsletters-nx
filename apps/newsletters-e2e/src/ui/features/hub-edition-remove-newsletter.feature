Feature: Remove a newsletter from an edition hub layout section
	As an editor
	I want to remove a newsletter from a section of an edition layout
	So that it no longer appears in that section

	Background:
		Given the editor is using the Stand workspace

	Scenario: Removing a newsletter and publishing persists the change
		Given the editor is editing the layout for edition "uk" with newsletters "Alpha" and "Beta" in section "News"
		When the editor removes "Alpha" from the layout
		Then "Alpha" is no longer listed in the layout
		And "Beta" is still listed in the layout
		When the editor publishes the layout
		Then the layout for edition "uk" is saved with only "beta" in section "News"
		And a success message is shown

	Scenario: Removing a newsletter and cancelling leaves stored data unchanged
		Given the editor is editing the layout for edition "uk" with newsletters "Alpha" and "Beta" in section "News"
		When the editor removes "Alpha" from the layout
		And the editor cancels editing the layout
		Then the editor is asked to confirm discarding their changes
		When the editor confirms discarding the changes
		Then the editor is returned to the read-only layout for edition "uk"
		And "Alpha" is still listed in the layout
		And no layout has been saved
