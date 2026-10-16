Feature: Launched newsletter: what readers see
  As a newsletter editor
  I want to check and correct the words, images and links readers see when they sign up
  So that the sign-up page and sign-up embeds are right

  Background:
    Given an editor's workspace uses the Stand design

  Rule: Sign-up copy and images shows the sign-up copy

    Scenario: The panel lists the sign-up copy
      Given a launched newsletter "Afternoon update" with this sign-up copy:
        | field                     | value                                                       |
        | sign up description       | Finish your day with our three-minute snapshot              |
        | sign up embed description | Our Australian afternoon update breaks down the key stories |
        | mail success description  | We'll send you Afternoon Update every weekday               |
      When the editor opens the detail page for "Afternoon update"
      Then the "Sign-up copy and images" panel shows:
        | label               | value                                                       |
        | Sign-up description | Finish your day with our three-minute snapshot              |
        | Embed description   | Our Australian afternoon update breaks down the key stories |
        | Success message     | We'll send you Afternoon Update every weekday               |

    Scenario: Copy that isn't set shows "Not set"
      Given a launched newsletter "Afternoon update" with no highlight card message
      When the editor opens the detail page for "Afternoon update"
      Then the "Sign-up copy and images" panel shows "Highlight card message" as "Not set"

  Rule: Sign-up copy and images shows the newsletter's images

    Scenario: An image shows a thumbnail and its address
      Given a launched newsletter "Afternoon update" with a newsletter graphic
      When the editor opens the detail page for "Afternoon update"
      Then the "Sign-up copy and images" panel shows a thumbnail and address for "Newsletter graphic (5:3)"

    Scenario: A missing image shows "Not set"
      Given a launched newsletter "Afternoon update" with no newsletter square
      When the editor opens the detail page for "Afternoon update"
      Then the "Sign-up copy and images" panel shows "Newsletter square (1:1)" as "Not set"

  @edit
  Rule: Editors can change the sign-up copy

    Scenario: The editor changes the sign-up description
      Given a launched newsletter "Afternoon update"
      And the editor can edit newsletters
      When the editor changes "Sign-up description" to "Your evening news, in three minutes" in the "Sign-up copy and images" panel
      Then the "Sign-up copy and images" panel shows "Sign-up description" as "Your evening news, in three minutes"

  @edit
  Rule: Editors see a preview of an image before saving it

    Scenario: A valid image address shows a preview
      Given a launched newsletter "Afternoon update" with no newsletter square
      And the editor can edit newsletters
      When the editor enters a valid image address for "Newsletter square (1:1)"
      Then a preview of the image is shown beside "Newsletter square (1:1)"

    Scenario: The preview waits for a valid address
      Given a launched newsletter "Afternoon update" with no newsletter square
      And the editor can edit newsletters
      When the editor starts editing the "Sign-up copy and images" panel
      Then "Newsletter square (1:1)" shows "No image"
      And the editor is told "Preview appears once a valid URL is added"

    Scenario: An image address that isn't a URL can't be saved
      Given a launched newsletter "Afternoon update"
      And the editor can edit newsletters
      When the editor tries to save "not a url" as the "Newsletter graphic (5:3)"
      Then the "Sign-up copy and images" panel stays in edit mode
      And "Newsletter graphic (5:3)" shows an error

    Scenario: Editors are reminded about image size limits
      Given a launched newsletter "Afternoon update"
      And the editor can edit newsletters
      When the editor starts editing the "Sign-up copy and images" panel
      Then the editor sees guidance about the image service's size limits

    # Open question: Figma shows Headline as editable, but signUpHeadline
    # isn't in getUserEditSchema. Add it, or show it read-only?

  Rule: Links go to the newsletter on theguardian.com

    Scenario: The sign-up page path links to the page
      Given a launched newsletter "Afternoon update" with sign-up page "/australia-news/2022/oct/13/afternoon-update-sign-up"
      When the editor opens the detail page for "Afternoon update"
      Then "Path to sign-up page" in the "Links" panel links to "https://www.theguardian.com/australia-news/2022/oct/13/afternoon-update-sign-up"

    Scenario: The example URL links to the example
      Given a launched newsletter "Afternoon update" with example URL "/australia-news/2022/oct/13/afternoon-update"
      When the editor opens the detail page for "Afternoon update"
      Then "Example URL" in the "Links" panel links to "https://www.theguardian.com/australia-news/2022/oct/13/afternoon-update"

    Scenario: A link that isn't set shows "Not set"
      Given a launched newsletter "Afternoon update" with no example URL
      When the editor opens the detail page for "Afternoon update"
      Then the "Links" panel shows "Example URL" as "Not set"

  @edit
  Rule: Editors can change the sign-up page path

    Scenario: The editor changes the sign-up page path
      Given a launched newsletter "Afternoon update"
      And the editor can edit newsletters
      When the editor changes "Path to sign-up page" to "/australia-news/afternoon-update-sign-up" in the "Links" panel
      Then the "Links" panel shows "Path to sign-up page" as "/australia-news/afternoon-update-sign-up"

    Scenario: A sign-up page path must be a path, not a full address
      Given a launched newsletter "Afternoon update"
      And the editor can edit newsletters
      When the editor tries to save "https://www.theguardian.com/afternoon-update" as the "Path to sign-up page"
      Then the "Links" panel stays in edit mode
      And "Path to sign-up page" shows an error

  # Open questions:
  # - Do links open in a new tab?
  # - Example URL isn't in getUserEditSchema. Should it be editable?
