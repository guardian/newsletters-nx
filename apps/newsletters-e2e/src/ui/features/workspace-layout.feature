Feature: Newsletter workspace layout preference
  Editors can choose to work in either the classic layout or the modern
  layout. Once chosen, the layout applies consistently to both the
  newsletter creation wizard and the rest of the workspace, until the
  editor switches it again.

  Background:
    Given a draft newsletter exists

  Scenario: Editor Erin's newsletter creation step reflects her chosen modern layout
    Given Editor Erin's workspace uses the classic layout
    When Editor Erin opens the newsletter creation step using the modern layout
    Then Editor Erin sees the newsletter creation step in the modern layout

  Scenario: Editor Erin's newsletter creation step uses the classic layout by default
    Given Editor Erin's workspace uses the classic layout
    When Editor Erin opens the newsletter creation step
    Then Editor Erin sees the newsletter creation step in the classic layout

  Scenario: Editor Erin's modern layout choice follows her to the drafts overview
    Given Editor Erin's workspace uses the modern layout
    When Editor Erin opens the drafts overview
    Then Editor Erin sees the drafts overview in the modern layout
