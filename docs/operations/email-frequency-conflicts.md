# Email frequency caps and lifecycle conflicts

All non-transactional email automations share one global recipient-level policy.
The default cap is three non-transactional sends in a rolling seven-day window.

When multiple messages compete, priority is: checkout → onboarding →
reactivation → newsletter → sales. Lower-priority scheduled work yields while a
higher-priority lifecycle message is pending.

Purchase immediately suppresses pre-purchase checkout, onboarding, reactivation
and sales nudges. Newsletter eligibility remains governed by its own subscription
and topic rules. Unsubscribe, suppression and DNC state always win over campaign
priority.

A scheduled message is never authorized only at scheduling time. Immediately
before provider delivery, rebuild the eligibility snapshot from current
purchase, preference/suppression and send-ledger state, then run the send gate.
If blocked, record the reason and do not call the provider.

Transactional/service email is outside this marketing frequency cap, but its
own stream classification and provider policies still apply.
