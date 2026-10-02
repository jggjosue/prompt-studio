# Training quality scoring

Issue #1082, parent #1072. Score version: `quality-v1`.

Quality is an explainable derived feature, never an irreversible mutation of raw data. The v1 score uses consented outcome events linked to the same record/request/output.

Positive signals: successful generation (+0.30), saved (+0.20), downloaded (+0.15), positive feedback (+0.25), edited (+0.05). Negative signals: negative feedback (-0.35), regenerate (-0.10). Contributions are stored with the score; the result is clamped to 0..1.

Default thresholds: prompt-enhancement 0.45, preference 0.35, image/video/web generation 0.50. Each can be overridden with `TRAINING_QUALITY_THRESHOLD_*` environment variables. Builders filter on `passes`; preprocessing still retains valid low-scoring examples so future threshold changes remain reproducible.

Absence of an event means absence of that signal, not a negative judgment. quality-v1 is heuristic and must not be interpreted as user quality, user value, or model truth. A weight/feature change requires a new quality version.
