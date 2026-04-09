@ui
Feature: MiniSociali web experience

  @smoke
  Scenario: Register and reach the dashboard
    Given the user opens the MiniSociali web app
    When the user registers through the UI
    Then the dashboard should be visible

  @smoke
  Scenario: Log in and create a post
    Given a user exists for the UI flow
    And the user opens the MiniSociali web app
    When the user logs in through the UI
    Then the dashboard should be visible
    When the user creates a post through the UI
    Then the new post should appear in the list

  @smoke
  Scenario: Logging out returns to the auth screen
    Given a user exists for the UI flow
    And the user opens the MiniSociali web app
    And the user logs in through the UI
    When the user logs out
    Then the auth card should be visible

  Scenario: Wrong-password login shows an inline error
    Given a user exists for the UI flow
    And the user opens the MiniSociali web app
    When the user logs in with the wrong password
    Then the auth error should contain "Invalid credentials"

  Scenario: Creating a post with an empty title shows an error
    Given a user exists for the UI flow
    And the user opens the MiniSociali web app
    And the user logs in through the UI
    When the user submits a post with an empty title
    Then the create error should contain "title is required"

  Scenario: Post content is rendered as escaped text
    Given a user exists for the UI flow
    And the user opens the MiniSociali web app
    And the user logs in through the UI
    When the user creates a script-like post through the UI
    Then the post should appear with escaped content

  @known-bug
  Scenario: Post form should reset after a successful creation
    Given a user exists for the UI flow
    And the user opens the MiniSociali web app
    And the user logs in through the UI
    When the user creates a post through the UI
    Then the create form should be cleared
