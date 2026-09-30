@feature-request-launch-newsletter
Feature: Request the launch of a newsletter from the redesigned interface

	As an editor
	I want to review and confirm a newsletter's details before requesting its launch
	So that other teams only start work on newsletters that are genuinely ready

	Background:
		Given the redesign switch is turned on

	@slow
	Scenario: Requesting a launch for a newsletter with complete data succeeds
		Given a draft newsletter with all its data set exists
		When the editor requests its launch
		Then the editor is told the launch has been requested
		And is given a link to the newsletter's live-newsletter details page

	Scenario: The launch confirmation survives a reload
		Given a newsletter whose launch has been requested
		When the page is reloaded
		Then the editor is still told the launch has been requested

	Scenario: The editor corrects the identity name before requesting launch
		Given a draft newsletter with all its data set exists
		When the editor changes the identity name to "corrected-identity-name" during the launch journey and requests its launch
		Then the launch is requested using "corrected-identity-name" as the identity name

	Scenario Outline: The editor corrects a Braze value before requesting launch
		Given a draft newsletter with all its data set exists
		When the editor changes the "<field>" to "<value>" during the launch journey and requests its launch
		Then the launch is requested using "<value>" as the "<field>"

		# title-format: <field> corrected to <value> before launch
		Examples:
			| field                              | value                          |
			| Braze subscribe attribute name     | Corrected_Braze_Attribute      |
			| Braze subscribe event name prefix  | corrected_braze_event_prefix   |

	Scenario: The identity name must not clash with an existing newsletter
		Given a draft newsletter with all its data set exists
		And another newsletter already uses the identity name "existing-identity-name"
		When the editor tries to change the identity name to "existing-identity-name" during the launch journey
		Then the editor is told a newsletter already exists with that identity name

	Scenario: Requesting a launch is blocked while required data is missing
		Given a draft newsletter missing required data exists
		When the editor opens the launch journey
		Then the editor is told the draft is not ready to launch, and what is missing

	Scenario: The editor can cancel partway through requesting a launch
		Given a draft newsletter with all its data set exists
		When the editor cancels partway through the launch journey
		Then the newsletter remains a draft, not requested for launch
