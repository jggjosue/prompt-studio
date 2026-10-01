# Production email QA checklist

Use this checklist before a template or lifecycle message is enabled in production.

- [ ] Shared Prompt Studio branded layout is used.
- [ ] Mobile viewport renders without horizontal scrolling.
- [ ] A meaningful plain-text alternative is present.
- [ ] One descriptive H1 communicates the email purpose.
- [ ] Informative images have useful alt text; decorative images use empty alt text.
- [ ] Link labels describe their destination instead of “click here”.
- [ ] Preview/preheader text is set and does not merely repeat the subject.
- [ ] Every link uses HTTPS and an expected Prompt Studio domain.
- [ ] No TODO, placeholder, example.com or broken destinations remain.
- [ ] Preference/unsubscribe links are present when required by the stream.
- [ ] A test send has been reviewed on desktop and mobile before production release.
- [ ] Transactional messages disable open/click tracking when analytics are unnecessary or inappropriate.
- [ ] Lifecycle/marketing messages still pass consent, suppression, DNC and topic-preference checks.

## Release evidence

Record the template/campaign ID, reviewer, test-send timestamp and clients/devices
checked in the PR or release notes. A test send is a release gate, not a substitute
for automated template validation.
