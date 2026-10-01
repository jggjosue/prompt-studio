"""Modal deployment for Prompt Studio's pinned Qwen3-8B vLLM server.

Deploy:
    modal deploy infra/modal/qwen3_vllm.py -e staging
    modal deploy infra/modal/qwen3_vllm.py -e production

Required Modal secret:
    promptstudio-text-model
with:
    PROMPTSTUDIO_TEXT_MODEL_API_KEY=<strong random secret>

Optional Hugging Face access for gated/private artifacts can be added separately.
"""

import os
import subprocess

import modal

APP_NAME = "promptstudio-text-model"
MODEL_ID = "Qwen/Qwen3-8B"
MODEL_REVISION = "b968826d9c46dd6066d109eabc6255188de91218"
SERVED_MODEL_NAME = "promptstudio-fast"
VLLM_PORT = 8000
MINUTES = 60

image = (
    modal.Image.from_registry(
        "vllm/vllm-openai:v0.11.0",
        add_python="3.12",
    )
    .entrypoint([])
)

hf_cache = modal.Volume.from_name(
    "promptstudio-qwen3-hf-cache",
    create_if_missing=True,
)
vllm_cache = modal.Volume.from_name(
    "promptstudio-qwen3-vllm-cache",
    create_if_missing=True,
)

app = modal.App(APP_NAME)


@app.server(
    image=image,
    gpu="L4",
    memory=32768,
    cpu=4,
    min_containers=0,
    max_containers=10,
    target_concurrency=8,
    scaledown_window=5 * MINUTES,
    startup_timeout=30 * MINUTES,
    port=VLLM_PORT,
    routing_region="us-east",
    compute_region="us",
    volumes={
        "/root/.cache/huggingface": hf_cache,
        "/root/.cache/vllm": vllm_cache,
    },
    secrets=[modal.Secret.from_name("promptstudio-text-model")],
    unauthenticated=True,
    exit_grace_period=30,
)
class Qwen3Server:
    @modal.enter()
    def start(self):
        api_key = os.environ["PROMPTSTUDIO_TEXT_MODEL_API_KEY"]

        cmd = [
            "vllm",
            "serve",
            MODEL_ID,
            "--revision",
            MODEL_REVISION,
            "--tokenizer-revision",
            MODEL_REVISION,
            "--served-model-name",
            SERVED_MODEL_NAME,
            "--host",
            "0.0.0.0",
            "--port",
            str(VLLM_PORT),
            "--api-key",
            api_key,
            "--dtype",
            "auto",
            "--gpu-memory-utilization",
            "0.90",
            "--max-model-len",
            "32768",
            "--generation-config",
            "vllm",
            "--uvicorn-log-level",
            "info",
        ]

        self.process = subprocess.Popen(cmd)

    @modal.exit()
    def stop(self):
        process = getattr(self, "process", None)
        if process and process.poll() is None:
            process.terminate()
