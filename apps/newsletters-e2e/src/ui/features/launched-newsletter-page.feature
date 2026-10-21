Feature: Launched newsletter: open it and find my way around
  As a newsletter editor
  I want to open a launched newsletter, see which one I'm on and get to the part I need
  So that I don't change the wrong one or scroll through a long page

  # Drafts get their own feature files later, because their data comes from a
  # different source.

  Background:
    Given an editor's workspace uses the Stand design

  Rule: A launched newsletter opens on its own page

    Scenario: A newsletter's page can be opened from its address
      Given a launched newsletter "Afternoon update" with identity name "afternoon-update"
      When the editor goes to "/newsletters/afternoon-update"
      Then the detail page for "Afternoon update" is shown

    Scenario: An address for a newsletter that doesn't exist shows an error
      When the editor goes to "/newsletters/no-such-newsletter"
      Then the editor sees the not found page

