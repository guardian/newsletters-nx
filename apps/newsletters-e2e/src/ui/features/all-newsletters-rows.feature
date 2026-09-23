Feature: All newsletters list
  Editors manage launched newsletters and drafts as one list. Each row
  carries enough to identify a newsletter at a glance, and the list leads
  with whatever was touched most recently.

  Background:
    Given an editor's workspace uses the Stand design

  Rule: A row identifies its newsletter at a glance

    # An unnamed draft falling back to "Untitled draft <id>" is covered by
    # all-newsletters-rows.spec.ts, not repeated here as an e2e scenario.

    Scenario: A row shows the newsletter's identifying details
      Given a newsletter "Politics Weekly" with pillar "News" and category "article-based"
      When the editor opens the All Newsletters view
      Then the "Politics Weekly" row shows the title "Politics Weekly"
      And the "Politics Weekly" row shows the label "News | Article based"
      And the "Politics Weekly" row shows a last updated date

    Scenario: Rows label their pillar and category
      Given these newsletters exist:
        | newsletter       | pillar  | category      |
        | Politics Weekly  | News    | article-based |
        | Morning Briefing | News    | fronts-based  |
        | Culture Manual   | Culture | manual-send   |
        | Editor Picks     | News    | other         |
      When the editor opens the All Newsletters view
      Then the rows show these labels:
        | newsletter       | label                  |
        | Politics Weekly  | News \| Article based  |
        | Morning Briefing | News \| Fronts based   |
        | Culture Manual   | Culture \| Manual send |
        | Editor Picks     | News \| Other          |

    Scenario: A newsletter with neither pillar nor category shows no label
      Given a newsletter "Bare Draft" with no pillar or category
      When the editor opens the All Newsletters view
      Then the "Bare Draft" row shows no pillar and category label

  Rule: A row reports where its newsletter has got to

    # The full set of badge labels (Live, Pending, Cancelled, Paused, and the
    # draft progress states) is covered by NewsletterStatusBadge.spec.tsx.
    # These scenarios check the badge reaches the row it belongs to, which
    # only a rendered list can show.

    Scenario: An unfinished newsletter shows how far along it is
      Given a newsletter "Half Done" with pillar "News" and category "other"
      When the editor opens the All Newsletters view
      Then the "Half Done" row shows a draft progress badge

    Scenario: Launched newsletters show their launch status
      Given these launched newsletters exist:
        | newsletter   | status    |
        | Fresh Launch | live      |
        | Queued Up    | pending   |
        | Called Off   | cancelled |
        | On Hold      | paused    |
      When the editor opens the All Newsletters view
      Then the rows show these status badges:
        | newsletter   | label     |
        | Fresh Launch | Live      |
        | Queued Up    | Pending   |
        | Called Off   | Cancelled |
        | On Hold      | Paused    |

  Rule: The most recently updated newsletters come first

    Scenario: Recently updated newsletters sort above older ones
      Given these newsletters were updated in this order:
        | newsletter    |
        | Edited First  |
        | Edited Second |
        | Edited Last   |
      When the editor opens the All Newsletters view
      Then the rows appear in this order:
        | newsletter    |
        | Edited Last   |
        | Edited Second |
        | Edited First  |

    Scenario: A recently updated newsletter sorts above a long-untouched one
      Given a launched newsletter "Old Timer" last updated a long time ago
      And a newsletter "Just Edited" with pillar "News" and category "other"
      When the editor opens the All Newsletters view
      Then the "Just Edited" row appears above the "Old Timer" row

  Rule: A row stays readable when information is missing

    Scenario: A newsletter with no thumbnail shows a fallback
      Given a newsletter "No Picture" with no thumbnail
      When the editor opens the All Newsletters view
      Then the "No Picture" row shows a no-thumbnail placeholder

    Scenario: A newsletter with a thumbnail shows it
      Given a launched newsletter "Picture Perfect" with a thumbnail
      When the editor opens the All Newsletters view
      Then the "Picture Perfect" row shows its thumbnail image

  Rule: A row stays legible on a mobile viewport

    Scenario: A row still shows identifying details on a narrow screen
      Given the editor is using a mobile viewport
      And a newsletter "Mobile Check" with pillar "News" and category "article-based"
      When the editor opens the All Newsletters view
      Then the "Mobile Check" row shows the title "Mobile Check"
      And the "Mobile Check" row shows the label "News | Article based"
      And the "Mobile Check" row shows a last updated date

    Scenario: A row keeps its status visible on a narrow screen, whether draft or launched
      Given the editor is using a mobile viewport
      And a newsletter "Mobile Draft" with pillar "News" and category "other"
      And a launched newsletter "Mobile Status" with status "pending"
      When the editor opens the All Newsletters view
      Then the "Mobile Draft" row shows a draft progress badge
      And the rows show these status badges:
        | newsletter    | label   |
        | Mobile Status | Pending |
