@api
Feature: MiniSociali API contract

  @smoke
  Scenario: Health endpoint returns service status
    When the client requests the health endpoint
    Then the API response status should be 200
    And the health response should report service uptime

  @smoke
  Scenario: Register and login with valid credentials
    Given an API user payload
    When the client registers the user
    Then the API response status should be 201
    And the auth response should contain a token and user id
    When the client logs in with the same credentials
    Then the API response status should be 200
    And the auth response should contain a token and user id

  Scenario: Reject malformed registration data
    When the client registers with email "not-an-email" and password "supersecret"
    Then the API response status should be 400
    And the API error response should contain a message
    When the client registers with email "short@example.com" and password "short"
    Then the API response status should be 400
    And the API error response should contain a message

  Scenario: Reject duplicate registrations
    Given an API user payload
    And the user is registered through the API
    When the client registers the same user again
    Then the API response status should be 409

  Scenario: Reject wrong-password login
    Given an API user payload
    And the user is registered through the API
    When the client logs in with email and password "wrong-password"
    Then the API response status should be 401

  @known-bug
  Scenario: Login should reject missing password
    Given an API user payload
    And the user is registered through the API
    When the client logs in without a password
    Then the API response status should be 401

  @smoke
  Scenario: Protected endpoints reject missing bearer token
    When the client lists posts without authentication
    Then the API response status should be 401

  @smoke
  Scenario: Create and list posts for the authenticated user only
    Given a registered API user
    And another registered API user
    When the first user creates a valid post
    And the second user creates a valid post
    And the first user lists posts
    Then the API response status should be 200
    And only the first user's posts should be returned

  Scenario: Create rejects missing required fields
    Given a registered API user
    When the user creates a post without a title
    Then the API response status should be 400
    When the user creates a post without content
    Then the API response status should be 400

  @known-bug
  Scenario: Create should reject an overly long title
    Given a registered API user
    When the user creates a post with a title longer than 280 characters
    Then the API response status should be 400

  @known-bug
  Scenario: Create should reject an unsupported platform
    Given a registered API user
    When the user creates a post with unsupported platform "x"
    Then the API response status should be 400

  @known-bug
  Scenario: Listing should honor limit and offset
    Given a registered API user
    And the user has created 3 posts
    When the user lists posts with limit 1 and offset 1
    Then the API response status should be 200
    And exactly 1 post should be returned

  Scenario: Read and update the owner post
    Given a registered API user
    And the user has an existing post
    When the user fetches the created post
    Then the API response status should be 200
    And the post response should match the created user
    When the user updates the created post title to "Updated title"
    Then the API response status should be 200
    And the response post title should be "Updated title"

  @known-bug
  Scenario: Reading another user's post should not succeed
    Given a registered API user
    And another registered API user
    And the second user has an existing post
    When the first user fetches the second user's post
    Then the API response status should be 403

  Scenario: Updating another user's post is forbidden
    Given a registered API user
    And another registered API user
    And the second user has an existing post
    When the first user updates the second user's post title to "Not allowed"
    Then the API response status should be 403

  Scenario: Delete an existing post and verify it is gone
    Given a registered API user
    And the user has an existing post
    When the user deletes the created post
    Then the API response status should be 204
    When the user fetches the created post
    Then the API response status should be 404

  @known-bug
  Scenario: Delete should return 404 for a missing post
    Given a registered API user
    When the user deletes post id "missing-post-id"
    Then the API response status should be 404

  Scenario: Scheduling accepts a valid future timestamp
    Given a registered API user
    And the user has an existing post
    When the user schedules the created post 1 day in the future
    Then the API response status should be 200
    And the scheduledAt field should be populated

  Scenario: Scheduling rejects invalid dates
    Given a registered API user
    And the user has an existing post
    When the user schedules the created post with invalid date "not-a-date"
    Then the API response status should be 400

  @known-bug
  Scenario: Scheduling should reject past timestamps
    Given a registered API user
    And the user has an existing post
    When the user schedules the created post 1 day in the past
    Then the API response status should be 400

  Scenario: Scheduling another user's post is forbidden
    Given a registered API user
    And another registered API user
    And the second user has an existing post
    When the first user schedules the second user's post 1 day in the future
    Then the API response status should be 403
