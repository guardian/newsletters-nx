@feature-hub-edition-permissions
@mode:serial
Feature: Permission checks for newsletter hub edition pages
	As an editor
	I should require permission to be able to access the 'edit edition layout'
	So that only permitted users may edit layouts

	Background:
		Given the editor is using the Stand workspace


	Scenario: Accessing the 'edit edition layout' page with sufficient permissions
		Given the editor has the 'editEverything' permission
		When the editor navigates to the 'edit layout' page for edition 'uk'
		Then the user will see the header and a list of editable sections


	Scenario: Accessing the 'edit edition layout' page with insufficient permissions
		Given the editor does not have the 'editEverything' permission
		When the editor navigates to the 'edit layout' page for edition 'uk'
		Then the user will see a 'Permission Denied' error message

