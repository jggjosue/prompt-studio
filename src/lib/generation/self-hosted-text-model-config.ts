/**
 * Approved self-hosted text model for Prompt Studio.
 *
 * Compliance record:
 * docs/ai/SELF_HOSTED_TEXT_MODEL.md
 *
 * IMPORTANT: The revision must remain an immutable 40-character Hugging Face
 * commit SHA. Never replace it with "main", "master", "latest" or a floating tag.
 */
export const SELF_HOSTED_TEXT_MODEL = {
  logicalId: "promptstudio-fast",
  modelId: "Qwen/Qwen3-8B",
  revision: "b968826d9c46dd6066d109eabc6255188de91218",
  license: "Apache-2.0",
  sourceUrl:
    "https://huggingface.co/Qwen/Qwen3-8B/tree/b968826d9c46dd6066d109eabc6255188de91218",
  modelCardUrl:
    "https://huggingface.co/Qwen/Qwen3-8B/blob/b968826d9c46dd6066d109eabc6255188de91218/README.md",
  licenseUrl:
    "https://huggingface.co/Qwen/Qwen3-8B/blob/b968826d9c46dd6066d109eabc6255188de91218/LICENSE",
} as const;

export const SELF_HOSTED_TEXT_MODEL_REF =
  `${SELF_HOSTED_TEXT_MODEL.modelId}@${SELF_HOSTED_TEXT_MODEL.revision}`;
