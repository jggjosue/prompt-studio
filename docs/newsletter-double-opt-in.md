# Newsletter double opt-in decision

Prompt Studio enables double opt-in for voluntary newsletter acquisition. Free downloads and account access remain independent: accepting the terms can grant the requested product action, while the optional marketing checkbox starts a separate `pending` subscription. Only the signed confirmation link changes that state to `confirmed`.

## Jurisdiction and use-case tradeoffs

| Market/use case | Baseline | Product decision |
| --- | --- | --- |
| EU/EEA and UK individuals | Prior, specific consent is generally required for electronic marketing unless a narrow existing-customer soft opt-in applies. | Double opt-in for voluntary newsletter signup; do not rely on the soft opt-in for free-download leads. |
| Canada | Commercial electronic messages require express or qualifying implied consent, sender identification, and unsubscribe; the sender must prove consent. | Double opt-in creates stronger evidence and list quality. |
| United States | CAN-SPAM permits commercial email without prior opt-in but requires accurate identity, postal address, and effective opt-out. | Double opt-in is a product-quality policy above the federal minimum. |
| Mexico | Personal-data processing is consent-based and the privacy notice must disclose marketing purposes and revocation mechanisms. | Use an optional, explicit checkbox plus confirmation and preserve timestamps. |
| Transactional messages | Receipts, security notices, and requested confirmations are not recurring marketing. | They remain independent of newsletter state and must not contain promotional content when consent is pending. |

This is an engineering policy summary, not jurisdiction-specific legal advice.

## State and evidence

- `not_requested`: no marketing choice was made.
- `pending`: consent was requested and a 48-hour confirmation token was issued.
- `confirmed`: the valid, single-use link was consumed; recurring marketing is allowed.
- `unsubscribed`: marketing must stop until a new explicit signup and confirmation.

The database stores request and confirmation timestamps separately. It stores only an HMAC digest of the random token, never the bearer token itself. The protected metrics endpoint reports signup requests, confirmations, pending subscriptions, unsubscribes, and confirmation conversion.

## Operational requirements

- Configure `NEWSLETTER_CONFIRMATION_SECRET` independently in Development, Preview, and Production.
- Configure an approved `RESEND_EMAIL` sender.
- Keep marketing campaigns limited to contacts selected with `marketingStatus: confirmed`.
- Creating or synchronizing a Clerk account never enrolls that address in Resend marketing contacts.
- Every recurring marketing email still needs sender identification and an unsubscribe mechanism.

## Sources reviewed

- European Union ePrivacy Directive, Article 13: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32002L0058
- UK ICO electronic-mail marketing guidance: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/electronic-and-telephone-marketing/electronic-mail-marketing/
- Canada CRTC CASL guidance: https://crtc.gc.ca/eng/com500/guide.htm
- US FTC CAN-SPAM compliance guide: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- Mexico LFPDPPP: https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf
