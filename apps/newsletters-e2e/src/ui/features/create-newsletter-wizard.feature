Feature: Create a newsletter in the redesigned wizard

	As an editor
	I want ot create a new newsletter by working through a guided series of steps
	So that the newsletter is set-up correctly

Background:
	Given the redesign switch is turned on


Scenario Outline: An editor can skip to certain steps in the wizard
	Given the editor is viewing the 'Introduction' step
	When the editor selects the '<step>' step from the navigation
	Then the editor will see the '<step>' step

  # title-format: Skip to <step>
	Examples:
	| step |
	| Name & frequency |
	| Production Details |
	| Launch/Promotion Dates |
	| Targeting |
	| Tag Setting |
	| Promotion copy and images |


Scenario: An editor cannot skip to the 'Review' step
	Given the editor is creating a new newsletter
	Then the editor cannot select the 'Review' step from the navigation

Scenario: An editor cannot skip to the 'Finish' step
	Given the editor is creating a new newsletter
	Then the editor cannot select the 'Finish' step from the navigation


Scenario: An editor can complete the 'Introduction' step
	Given the editor is creating a new newsletter
	When the editor chooses to continue
	Then the editor will see the 'Name & frequency' step

Scenario: An editor can complete the 'Name & frequency' step
	Given the editor is creating a new newsletter
	And the editor selects the 'Name & frequency' step from the navigation
	When the editor fills out the name and frequency fields
	And the editor chooses to continue
	Then the editor will see the 'Production Details' step


Scenario: An editor can complete the 'Production Details' step
	Given the editor is creating a new newsletter
	And the editor selects the 'Production Details' step from the navigation
	When the editor fills out the newsletter type and location fields
	And the editor chooses to continue
	Then the editor will see the 'Launch/Promotion Dates' step




