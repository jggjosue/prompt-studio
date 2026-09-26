# Project publishing journey

The E4 control-center contract follows seven persisted stages:

1. brief;
2. Brand Kit;
3. coordinated prompts;
4. generations;
5. evaluation;
6. approval;
7. publication.

Approval is not inferred from a completed generation. The project must reach `approved` or `published` through the authorized review-state transition. Publication requires persisted output evidence: a published project decision or a recorded export. A status label alone does not complete the journey.

The campaign control center links back to the exact project with `?project=<id>`, keeping context, review decisions, costs, and outputs in one workflow.

## Operational behavior

- Failed generations block the generation stage and expose retry.
- A project in `review` exposes approval as the next action.
- An approved project exposes publication as the next action.
- Published output completes the journey and feeds the existing project funnel.

## Rollback

Reverting the approval stage only changes journey presentation. It does not migrate or delete project, generation, decision, export, or publication records.
