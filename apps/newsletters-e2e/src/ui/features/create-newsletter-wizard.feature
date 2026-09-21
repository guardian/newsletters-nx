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
	And the 'Name & frequency' step will be marked complete

Scenario: An editor can complete the 'Production Details' step
	Given the editor is creating a new newsletter
	And the editor selects the 'Production Details' step from the navigation
	When the editor fills out the newsletter type and location fields
	And the editor chooses to continue
	Then the editor will see the 'Launch/Promotion Dates' step
	And the 'Production details' step will be marked complete


Scenario: An editor can complete the 'Launch/Promotion Dates' step
	Given the editor is creating a new newsletter
	And the editor selects the 'Launch/Promotion Dates' step from the navigation
	When the editor sets the launch and sign up dates
	And the editor chooses to continue
	Then the editor will see the 'Targeting' step
	And the 'Launch/Promotion Dates' step will be marked complete

Scenario: An editor can complete the 'Targeting' step
	Given the editor is creating a new newsletter
	And the editor selects the 'Targeting' step from the navigation
	When the editor sets the region focus, pillar and MMA group
	And the editor chooses to continue
	Then the editor will see the 'Tag Setting' step
	And the 'Targeting' step will be marked complete

Scenario: An editor can complete the 'Tag Setting' step
	Given the editor is creating a new newsletter
	And the editor selects the 'Tag Setting' step from the navigation
	When the editor sets the series tag & description, campaign tag & description fields
	And the editor chooses to continue
	Then the editor will see the 'Promotion copy and images' step
	And the 'Tag Setting' step will be marked complete

Scenario: An editor can complete the 'Promotion copy and images' step
	Given the editor is creating a new newsletter
	And the editor selects the 'Promotion copy and images' step from the navigation
	When the editor sets the headline, description, embed description, success message, highlight card message and image url fields
	And the editor chooses to continue
	Then the editor will see the 'Review' step
	And the 'Promotion copy and images' step will be marked complete

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
	| name | id | message |
	| Name the newsletter | name | Must not be empty |
	| Set the frequency | frequency | Must not be empty |

Scenario: The type and location fields are mandatory
	Given the editor is creating a new newsletter
	And the editor selects the 'Production Details' step from the navigation
	When the editor chooses to continue
	Then the ui will indicate the following fields are mandatory
	| name | id | message |
	| Type of newsletter | category | Invalid option: expected one of |
	| Location of newsletter | onlineArticle | Invalid option: expected one of  |

Scenario: The launch date and sign-up date fields are mandatory
	Given the editor is creating a new newsletter
	And the editor selects the 'Launch/Promotion Dates' step from the navigation
	When the editor chooses to continue
	Then the ui will indicate the following fields are mandatory
	| name | id | message |
	| Enter launch date | launchDate | Invalid input: expected date |
	| Enter sign up page date | signUpPageDate | Invalid input: expected date |

Scenario: The region focus, pillar and MMA page group fields are mandatory
	Given the editor is creating a new newsletter
	And the editor selects the 'Targeting' step from the navigation
	When the editor chooses to continue
	Then the ui will indicate the following fields are mandatory
	| name | id | message |
	| Region focus | regionFocus | Invalid option: expected one of |
	| Pillar | theme | Invalid option: expected one of |
	| Group for MMA page | group | Invalid option: expected one of |

Scenario: If a series tag is set, then the tag description is mandatory
	Given the editor is creating a new newsletter
	And the editor selects the 'Tag Setting' step from the navigation
	And the editor fills out the series tag field
	When the editor chooses to continue
	Then the ui will indicate the series tag description is mandatory

Scenario: If a campaign tag is set, then the tag description is mandatory
	Given the editor is creating a new newsletter
	And the editor selects the 'Tag Setting' step from the navigation
	And the editor fills out the campaign tag field
	When the editor chooses to continue
	Then the ui will indicate the campagin tag description is mandatory

Scenario: The sign up page's headline, description and embed description are mandatory
	Given the editor is creating a new newsletter
	And the editor selects the 'Promotion copy and images' step from the navigation
	When the editor chooses to continue
	Then the ui will indicate the following fields are mandatory
	| name | id | message |
	| Headline | signUpHeadline | Must not be empty |
	| Description | signUpDescription | Must not be empty |
	| Embed description | signUpEmbedDescription | Must not be empty |

Scenario: Optional steps are marked optional in the navigation
	Given the editor is creating a new newsletter
	Then only the following navigation links are marked as optional
	| step |
	| Tag Setting |


Scenario: Non optional steps are initially marked incomplete
	Given the editor is creating a new newsletter
	Then the following navigation links are marked as incomplete
	| step |
	| Name & frequency |
	| Production Details |
	| Launch/Promotion Dates |
	| Targeting |
	| Promotion copy and images |







