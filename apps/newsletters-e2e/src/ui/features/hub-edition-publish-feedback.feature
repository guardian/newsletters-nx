@feature-hub-edition-publish-feedback
@mode:serial
Feature: Add a newsletter to an edition hub layout section
	As an editor
	I want to see feedback when I attempt to publish a layout
	So that I know if it succeeded or failed

	Background:
		Given the editor is using the Stand workspace
		And the editor is editing the layout for edition "uk" with empty sections "News" and "Sport", launched newsletters "Alpha" and "Beta" and a cancelled newsletter "Gamma"

	Scenario: A successful publish displays a success message
		When the editor opens the add newsletter area for section "News"
		And the editor adds "Alpha" to the layout
		And the editor presses the "Save and publish layout" button
		Then the layout for edition "uk" is saved with "alpha" in section "News"
		And the editor is returned to the read-only layout for edition "uk"
		And a success alert is shown

	Scenario: A successful publish displays an error message
		Given an ongoing network error prevents publishing
		When the editor presses the "Save and publish layout" button
		Then the stored layout is unchanged
		And the user remains on the edit layout for edition "uk"
		And an error alert is shown
