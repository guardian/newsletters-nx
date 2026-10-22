@feature-new-edition-layout
@mode:serial
Feature: Create a new layout for an edition hub
	As an editor
	I want to be able to create a layout for an edition hub that does not have a
	layout yet
	So that I can organise newsletters for new editions

	Background:
		Given the editor is using the Stand workspace

	Rule: An edition with no layout page shows an empty layout on the view and edit pages

		Scenario: Viewing a layout for an edition with no existing layout
			Given there is no stored layout for edition 'uk'
			When the user navigates to the 'view layout' page for edition 'uk'
			Then the user will see a message indicating the layout is empty

		Scenario: Editing a layout for an edition with no existing layout
			Given there is no stored layout for edition 'uk'
			When the user navigates to the 'edit layout' page for edition 'uk'
			Then the user will only see the 'add section to the beginning' and the 'add section to the end' buttons

	Rule: Saving a layout for an edition with no layout set creates a new layout in the backing store

		Scenario: Save a new layout for an edition no existing layout
			Given there is no stored layout for edition 'uk'
			And the user is viewing the 'edit layout' page for edition 'uk'
			When the user adds a section named 'Example' and publishes
			Then there will be stored layout for edition 'uk' with a single section named 'Example'

	Rule: Navigating to an edition page with an invalid edition id displays a 'Not found' message

		Scenario: View the layout for an invalid edition
			When the user navigates to the 'view layout' page for edition 'does-not-exist'
			Then the user will see a 'Not Found' error message

		Scenario: Edit the layout for an invalid edition
			When the user navigates to the 'edit layout' page for edition 'does-not-exist'
			Then the user will see a 'Not Found' error message
