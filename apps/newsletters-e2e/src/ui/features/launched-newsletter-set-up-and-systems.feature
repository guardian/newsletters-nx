Feature: Launched newsletter: set-up and other systems
  As Central Production
  I want to record the set-up work I've done
  So that editors know the newsletter is ready

  As Central Production or a newsletter editor
  I want to get and correct the values other systems need
  So that tags, Braze and Ophan are wired up without retyping anything

  Background:
    Given an editor's workspace uses the Stand design

  Rule: Tags and campaigns shows the newsletter's tags

    Scenario: The panel lists the tags
      Given a launched newsletter "Afternoon update" with these details:
        | field      | value                                                     |
        | series tag | australia-news/series/guardian-australia-afternoon-update |
      When the editor opens the detail page for "Afternoon update"
      Then the "Tags and campaigns" panel shows:
        | label                | value                                                     |
        | Series tag           | australia-news/series/guardian-australia-afternoon-update |
        | Tag description      | Not set                                                   |
        | Campaign tag         | Not set                                                   |
        | Campaign description | Not set                                                   |

  @edit
  Rule: Editors can change the tags

    Scenario: The editor changes the campaign tag
      Given a launched newsletter "Afternoon update" with no campaign tag
      And the editor can edit newsletters
      When the editor changes "Campaign tag" to "campaign/email/afternoon-update" in the "Tags and campaigns" panel
      Then the "Tags and campaigns" panel shows "Campaign tag" as "campaign/email/afternoon-update"

    Scenario: A series tag must be a tag path
      Given a launched newsletter "Afternoon update"
      And the editor can edit newsletters
      When the editor tries to save "https://www.theguardian.com/world/series/first-edition" as the "Series tag"
      Then the "Tags and campaigns" panel stays in edit mode
      And "Series tag" shows an error

    # Open question: Tag description (seriesTagDescription) is in the Figma
    # form but not in getUserEditSchema. Add it, or show it read-only?

  Rule: While pending, set-up progress shows as badges

    Scenario Outline: Creation statuses show as badges
      Given a pending launched newsletter "Afternoon update" with <thing> creation status "<status>"
      When the editor opens the detail page for "Afternoon update"
      Then the "<panel>" panel shows a "<badge>" badge for "<label>"

      # title-format: <label> <status> shows a <badge> badge
      Examples:
        | thing          | status    | panel              | label                          | badge     |
        | tag            | REQUESTED | Tags and campaigns | Tag creation status            | Requested |
        | tag            | COMPLETED | Tags and campaigns | Tag creation status            | Completed |
        | sign-up page   | REQUESTED | Tags and campaigns | Sign-up page creation status   | Requested |
        | Braze campaign | REQUESTED | Integrations       | Braze campaign creation status | Requested |

    Scenario: Creation statuses are hidden once the newsletter has gone live
      Given a launched newsletter "Afternoon update" with status "live"
      When the editor opens the detail page for "Afternoon update"
      Then the "Tags and campaigns" panel doesn't show "Tag creation status" or "Sign-up page creation status"
      And the "Integrations" panel doesn't show "Braze campaign creation status"

    # Open question: how should NOT_REQUESTED look?

  @edit
  Rule: Editors can mark set-up work as done

    Scenario Outline: Set-up work is marked as done
      Given a pending launched newsletter "Afternoon update" with <thing> creation status "REQUESTED"
      And the editor can edit newsletters
      When the editor changes "<label>" to "Completed" in the "<panel>" panel
      Then the "<panel>" panel shows a "Completed" badge for "<label>"

      # title-format: The <thing> is marked as created
      Examples:
        | thing          | panel              | label                          |
        | tag            | Tags and campaigns | Tag creation status            |
        | sign-up page   | Tags and campaigns | Sign-up page creation status   |
        | Braze campaign | Integrations       | Braze campaign creation status |

  Rule: Integrations shows the Braze and Ophan values

    Scenario: Braze values are grouped under "Braze values"
      Given a launched newsletter "Afternoon update" with these details:
        | field                          | value                              |
        | braze newsletter name          | Editorial_AfternoonUpdateAUS       |
        | braze subscribe attribute name | AfternoonUpdateAus_Subscribe_Email |
      When the editor opens the detail page for "Afternoon update"
      Then the "Integrations" panel shows under "Braze values":
        | label                       | value                              |
        | brazeNewsletterName         | Editorial_AfternoonUpdateAUS       |
        | brazeSubscribeAttributeName | AfternoonUpdateAus_Subscribe_Email |

    Scenario: Ophan values are grouped under "Ophan values"
      Given a launched newsletter "Afternoon update" with campaign name "AfternoonUpdateAUS" and campaign code "afternoonupdateau_email"
      When the editor opens the detail page for "Afternoon update"
      Then the "Integrations" panel shows under "Ophan values":
        | label        | value                   |
        | campaignName | AfternoonUpdateAUS      |
        | campaignCode | afternoonupdateau_email |

  @edit
  Rule: Editors can update the Braze values

    Scenario: The editor changes the Braze newsletter name
      Given a launched newsletter "Afternoon update"
      And the editor can edit newsletters
      When the editor changes "brazeNewsletterName" to "Editorial_AfternoonUpdate" in the "Integrations" panel
      Then the "Integrations" panel shows "brazeNewsletterName" as "Editorial_AfternoonUpdate"

    Scenario: Ophan values can't be changed here
      Given a launched newsletter "Afternoon update"
      And the editor can edit newsletters
      When the editor starts editing the "Integrations" panel
      Then "campaignName" and "campaignCode" are shown but can't be changed

    # Open questions:
    # - Figma has no editing design for Integrations.
    # - Changing Braze values today can send a "Braze update" email to Central
    #   Production. Should saving this panel do the same?

  Rule: Technical output shows the newsletter's identifiers

    Scenario: The panel lists the identifiers
      Given a launched newsletter "Afternoon update" with id 6023 and identity name "afternoon-update"
      When the editor opens the detail page for "Afternoon update"
      Then the "Technical output" panel shows:
        | label         | value            |
        | id Number     | 6023             |
        | Identity name | afternoon-update |
        | Restricted    | false            |

  Rule: The editor can copy the sign-up embed code

    Scenario: Copying the embed code
      Given a launched newsletter "Afternoon update" with identity name "afternoon-update"
      When the editor copies the "Sign up embed code" from the "Technical output" panel
      Then the clipboard holds the sign-up embed code for "afternoon-update"

    Scenario: Help explains what the embed code is for
      Given a launched newsletter "Afternoon update"
      When the editor asks for help with the "Sign up embed code"
      Then the editor sees what the sign-up embed code is for

  Rule: The editor can copy a Braze template for a DRR slot set

    Scenario Outline: The default slot set follows the region focus
      Given a launched newsletter "Afternoon update" with region focus "<region>"
      When the editor opens the detail page for "Afternoon update"
      Then the "Default" DRR slot set is selected
      And the Braze template uses the "<slot set>" content blocks

      # title-format: A <region> newsletter defaults to the <slot set> slot set
      Examples:
        | region | slot set    |
        | AU     | AUS         |
        | US     | US          |
        | UK     | Newsletters |

    Scenario: Choosing a slot set changes the template
      Given a launched newsletter "Afternoon update" with region focus "UK"
      When the editor chooses the "US" DRR slot set
      Then the Braze template uses the "US" content blocks

    Scenario: Copying the template copies the slot set shown
      Given a launched newsletter "Afternoon update" with region focus "UK"
      When the editor chooses the "Australia" DRR slot set
      And the editor copies the "Braze campaign template code" from the "Technical output" panel
      Then the clipboard holds a Braze template that uses the "AUS" content blocks

    # Open question: what does "Global" map to?

  Rule: The editor can see the newsletter's raw data

    Scenario: Raw data shows the whole record
      Given a launched newsletter "Afternoon update"
      When the editor opens the raw data for "Afternoon update"
      Then the editor sees the newsletter's full record as JSON

  Rule: Technical output can be collapsed, and can't be edited

    # Open question: does it start open or collapsed?

    Scenario: Collapsing the panel hides its contents
      Given a launched newsletter "Afternoon update"
      When the editor collapses the "Technical output" panel
      Then the "Technical output" panel's contents are hidden

    Scenario: Technical output has no Edit action
      Given a launched newsletter "Afternoon update"
      And the editor can edit newsletters
      When the editor opens the detail page for "Afternoon update"
      Then the "Technical output" panel has no "Edit" action
