# Anonymous → registered analytics identity

Issue #236 links the anonymous acquisition journey to a completed registration while minimizing identity data in analytics.

## Contract

Before authentication, events with `auth_state=anonymous` receive a random first-party `anonymous_id` generated with `crypto.randomUUID()` and stored locally in the browser.

When Clerk confirms a real signed-out → signed-in transition on the sign-up surface, Prompt Studio emits one `identity_linked` event containing that anonymous ID and categorical metadata only.

The Clerk user ID, email, display name and profile data are never included in this bridge.

Immediately after the link event, the local anonymous ID is deleted. A session guard prevents duplicate link events during the same signup completion flow. Subsequent authenticated analytics therefore do not carry the anonymous identifier.

## Analysis

The `anonymous_id` allows GA4/warehouse analysis to associate pre-signup anonymous events with the one-time `identity_linked` boundary. It is not a durable authenticated user identifier.

## Privacy and rollback

This bridge contains no direct PII and deliberately avoids Clerk identifiers. Removing the client helper rolls back the feature without affecting authentication or product behavior.

Production validation should verify:
- anonymous acquisition events share the same anonymous ID before signup;
- exactly one identity-link event is emitted after completed signup;
- login by an existing user does not emit an identity link;
- authenticated events after the bridge do not carry `anonymous_id`;
- email, Clerk user ID and profile fields are absent.
