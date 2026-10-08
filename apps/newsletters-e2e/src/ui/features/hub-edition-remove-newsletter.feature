Feature: Remove a newsletter from a regional hub layout section
	As an editor
	I want to remove a newsletter from a section of a regional layout
	So that it no longer appears in that section

	Background:
		Given the editor is using the Stand workspace

	Scenario: Removing a newsletter and publishing persists the change
		Given the editor is editing the layout for region "uk" with newsletters "Alpha" and "Beta" in section "News"
		When the editor removes "Alpha" from the layout
		Then "Alpha" is no longer listed in the layout
		And "Beta" is still listed in the layout
		When the editor publishes the layout
		Then the layout for region "uk" is saved with only "beta" in section "News"
		And a success message is shown

	Scenario: Removing a newsletter and cancelling leaves stored data unchanged
		Given the editor is editing the layout for region "uk" with newsletters "Alpha" and "Beta" in section "News"
		When the editor removes "Alpha" from the layout
		And the editor cancels editing the layout
		Then "Alpha" is still listed in the layout
		And no layout has been saved
