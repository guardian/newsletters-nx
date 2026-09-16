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








