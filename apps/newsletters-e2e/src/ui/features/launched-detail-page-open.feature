Feature: Launched newsletter: open its page
  As a newsletter editor
  I want every launched newsletter to open at one address
  So that I can bookmark it, share it and always find it in the same place

  # The new page sits behind switch-stand, so no Background here: the last
  # rule needs a Legacy workspace.

  Rule: A launched newsletter opens on its own page

    Scenario: A newsletter's page can be opened from its address
      Given an editor's workspace uses the Stand design
      And a launched newsletter "Afternoon update" with identity name "afternoon-update"
      When the editor goes to "/newsletters/afternoon-update"
      Then the detail page for "Afternoon update" is shown
      And the "Details" tab is selected

    Scenario: An address for a newsletter that doesn't exist shows an error
      Given an editor's workspace uses the Stand design
      When the editor goes to "/newsletters/no-such-newsletter"
      Then the editor sees the not found page

  Rule: Links to a launched newsletter open the new page

    # Nothing links to the new page until switch-over, once the Details tab
    # is complete.

    Scenario: Selecting a newsletter in the list opens its page
      Given an editor's workspace uses the Stand design
      And a launched newsletter "Afternoon update"
      When the editor selects "Afternoon update" in the All Newsletters view
      Then the detail page for "Afternoon update" is shown

    Scenario: An old launched newsletter link opens the new page
      Given an editor's workspace uses the Stand design
      And a launched newsletter "Afternoon update" with identity name "afternoon-update"
      When the editor goes to "/launched/afternoon-update"
      Then the detail page for "Afternoon update" is shown

  Rule: Editors on the Legacy design keep the current page

    Scenario: A Legacy editor still sees the current page
      Given an editor's workspace uses the Legacy design
      And a launched newsletter "Afternoon update" with identity name "afternoon-update"
      When the editor goes to "/launched/afternoon-update"
      Then the current newsletter page for "Afternoon update" is shown
