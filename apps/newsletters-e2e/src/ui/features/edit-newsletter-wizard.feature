@feature-edit-newsletter-wizard
Feature: Edit an existing draft newsletter in the redesigned wizard

	Background:
		Given an editor's workspace uses the Stand design
		And an existing draft newsletter

	Scenario: An editor can edit every step of an existing draft newsletter in one pass
		When the editor edits the existing draft newsletter
		Then the 'Name & frequency' step is only shown once in the navigation
		And the name field is pre-filled with the existing draft's name
		When the editor updates every field of the draft newsletter
		Then the editor will see the 'Review' step
		And the stored newsletter reflects the editor's changes to the same draft
