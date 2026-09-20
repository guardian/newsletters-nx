Feature: Create a newsletter in the redesigned wizard

	As an editor
	I want ot create a new newsletter by working through a guided series of steps
	So that the newsletter is set-up correctly

Background:
	Given the redesign switch is turned on


# Step navigation

Scenario Outline: An editor can skip to certain steps in the wizard
	Given the editor is creating a new newsletter
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

Scenario: An editor in the Review step cannot skip to any other step
	Given the editor is creating a new newsletter
	And the editor has completed up until the 'Review' step
	Then the wizard navigation is disabled

Scenario: An editor in the Finish step cannot skip to any other step
	Given the editor is creating a new newsletter
	And the editor has completed up until the 'Finish' step
	Then the wizard navigation is disabled


# Completing steps
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

Scenario: An editor can complete the 'Launch/Promotion Dates' step
	Given the editor is creating a new newsletter
	And the editor selects the 'Launch/Promotion Dates' step from the navigation
	When the editor sets the launch and sign up dates
	And the editor chooses to continue
	Then the editor will see the 'Targeting' step

Scenario: An editor can complete the 'Targeting' step
	Given the editor is creating a new newsletter
	And the editor selects the 'Targeting' step from the navigation
	When the editor sets the region focus, pillar and MMA group
	And the editor chooses to continue
	Then the editor will see the 'Tag Setting' step


Scenario: An editor can complete the 'Tag Setting' step
	Given the editor is creating a new newsletter
	And the editor selects the 'Tag Setting' step from the navigation
	When the editor sets the series tag & description, campaign tag & description fields
	And the editor chooses to continue
	Then the editor will see the 'Promotion copy and images' step

Scenario: An editor can complete the 'Promotion copy and images' step
	Given the editor is creating a new newsletter
	And the editor selects the 'Promotion copy and images' step from the navigation
	When the editor sets the headline, description, embed description, success message, highlight card message and image url fields
	And the editor chooses to continue
	Then the editor will see the 'Review' step

Scenario: An editor can complete the 'Review' step
	Given the editor is creating a new newsletter
	And the editor has completed up until the 'Review' step
	When the editor chooses to continue
	Then the editor will see the 'Finish' step


Scenario Outline: The 'review' step has links to all preview steps
	Given the editor is creating a new newsletter
	And the editor has completed up until the 'Review' step
	When the editor follows the edit link for the '<step>' step
	Then the editor will see the '<step>' step
  # title-format: Link to <step>
	Examples:
	| step |
	| Name & frequency |
	| Production Details |
	| Launch/Promotion Dates |
	| Targeting |
	| Tag Setting |
	| Promotion copy and images |



Scenario: The 'finish' step shows a link to edit the details of the newsletter
	Given the editor is creating a new newsletter
	And the editor has completed up until the 'Finish' step
	When the editor selects the details page link
	Then the editor can see the details page

Scenario: The 'finish' step shows a link to the launch wizard for the newsletter
	Given the editor is creating a new newsletter
	And the editor has completed up until the 'Finish' step
	When the editor selects the launch wizard link
	Then the editor can see the launch wizard


Scenario: Creating an article-based newsletter offers to set up rendering options next
	Given the editor is creating a new newsletter
	And all form fields will be filled in
	| field | value |
	| type | article-based |
	And the editor has completed up until the 'Finish' step
	When the editor selects the rendering options link
	Then the editor can see the rendering options page for the newly created newsletter


Scenario: Creating an fronts-based newsletter does not offer to set up rendering options
	Given the editor is creating a new newsletter
	And all form fields will be filled in
	| field | value |
	| type | fronts-based |
	And the editor has completed up until the 'Finish' step
	Then the editor should not see a rendering options link



Scenario: The name and frequency fields are mandatory
	Given the editor is creating a new newsletter
	And the editor selects the 'Name & frequency' step from the navigation
	When the editor chooses to continue
	Then the ui will indicate the following fields are mandatory
	| name | id |
	| Name the newsletter | name |
	| Set the frequency | frequency |







