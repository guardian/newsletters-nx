Feature: Launched newsletter: what it is
  As a newsletter editor
  I want to see what a newsletter is, whether it is live and when it launches
  So that I can check it is set up correctly and correct it if not

  Background:
    Given an editor's workspace uses the Stand design

  Rule: Attributes shows what the newsletter is

    Scenario: The panel lists the newsletter's attributes
      Given a launched newsletter "Afternoon update" with these details:
        | field        | value         |
        | pillar       | News          |
        | region focus | AU            |
        | frequency    | Weekly        |
        | category     | article-based |
        | group        | News in depth |
      When the editor opens the detail page for "Afternoon update"
      Then the "Attributes" panel shows:
        | label              | value            |
        | Name               | Afternoon update |
        | Pillar             | News             |
        | Region focus       | AU               |
        | Frequency          | Weekly           |
        | Type of newsletter | Article based    |
        | MMA group          | News in depth    |

    Scenario: An attribute that isn't set shows "Not set"
      Given a launched newsletter "Afternoon update" with no region focus
      When the editor opens the detail page for "Afternoon update"
      Then the "Attributes" panel shows "Region focus" as "Not set"

  Rule: Attributes shows the newsletter's status

    Scenario Outline: The newsletter status shows as a badge
      Given a launched newsletter "Afternoon update" with status "<status>"
      When the editor opens the detail page for "Afternoon update"
      Then the "Attributes" panel shows a "<badge>" badge for "Newsletter status"

      # title-format: A <status> newsletter shows a <badge> badge
      Examples:
        | status    | badge     |
        | pending   | Pending   |
        | live      | Live      |
        | paused    | Paused    |
        | cancelled | Cancelled |

  @edit
  Rule: Editors can correct the attributes

    # Editable today (getUserEditSchema): name, pillar, region focus,
    # frequency and status. Not editable: type of newsletter, MMA group.

    Scenario: The editor changes the frequency
      Given a launched newsletter "Afternoon update" with frequency "Weekly"
      And the editor can edit newsletters
      When the editor changes "Frequency" to "Every weekday" in the "Attributes" panel
      Then the "Attributes" panel shows "Frequency" as "Every weekday"

    Scenario: Changing the status updates the badge in the header
      Given a launched newsletter "Afternoon update" with status "live"
      And the editor can edit newsletters
      When the editor changes "Newsletter status" to "Paused" in the "Attributes" panel
      Then the header shows a "Paused" status badge

    Scenario: Type of newsletter and MMA group can't be changed here
      Given a launched newsletter "Afternoon update"
      And the editor can edit newsletters
      When the editor starts editing the "Attributes" panel
      Then "Type of newsletter" and "MMA group" are shown but can't be changed

    # Open questions:
    # - Figma has no editing design for Attributes. A hidden "Newsletter
    #   status" panel has Live status, Braze campaign creation status and
    #   Sign-up page creation status radios. Is status edited here or there?

  Rule: Launch shows the launch details

    Scenario: The panel lists the launch details
      Given a launched newsletter "Afternoon update" with these details:
        | field                | value      |
        | launch date          | 2026-06-01 |
        | sign up page date    | 2026-06-01 |
        | private until launch | false      |
      When the editor opens the detail page for "Afternoon update"
      Then the "Launch" panel shows:
        | label                | value      |
        | Launch date          | 01 June 26 |
        | Promotion date       | 01 June 26 |
        | Private until launch | No         |

    Scenario: A newsletter that is private until launch shows "Yes"
      Given a launched newsletter "Afternoon update" that is private until launch
      When the editor opens the detail page for "Afternoon update"
      Then the "Launch" panel shows "Private until launch" as "Yes"

  # Open questions:
  # - Figma shows Edit on the Launch panel, but none of these fields are in
  #   getUserEditSchema. Do we make them editable after launch, or is the
  #   panel read-only?
  # - Is "Promotion date" the sign up page date (signUpPageDate)?
