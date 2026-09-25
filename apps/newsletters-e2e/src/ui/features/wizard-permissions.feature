Feature: Wizard access control
	The newsletter creation wizard must be restricted to users with the 'edit everything' permission.

	Background:
		Given an editor's workspace uses the Stand design
		And the user does not have the 'edit everything' permission

	Scenario: User without edit permissions is blocked from the creation wizard
		When the user attempts to start the newsletter creation wizard
		Then the user sees the Central Production permission warning
		And the user can still access the main navigation

	Scenario: User without edit permissions is blocked from editing an existing draft
		Given an existing draft newsletter
		When the user attempts to edit the existing draft newsletter
		Then the user sees the Central Production permission warning
		And the user can still access the main navigation
