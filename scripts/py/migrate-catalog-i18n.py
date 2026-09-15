#!/usr/bin/env python3
"""Convert catalog JSON string fields to { en, es } and fill Spanish via Google Translate."""

from __future__ import annotations

import argparse
import json
import re
import time
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]

try:
    from deep_translator import GoogleTranslator
except ImportError:
    GoogleTranslator = None  # type: ignore


def is_localized(val: Any) -> bool:
    return isinstance(val, dict) and "en" in val and isinstance(val["en"], str)


def to_localized(text: str | dict, translator: Any | None, cache: dict[str, str]) -> dict[str, str]:
    if isinstance(text, dict) and "en" in text:
        if text.get("es"):
            return text
        text = text["en"]
    en = text or ""
    if not en.strip():
        return {"en": en, "es": en}
    if en in cache:
        es = cache[en]
    elif translator is None:
        es = en
    else:
        # Google Translate limit ~5000 chars; chunk long prompts
        if len(en) <= 4500:
            es = translator.translate(en)
        else:
            chunks = []
            start = 0
            while start < len(en):
                end = min(start + 4500, len(en))
                if end < len(en):
                    split = en.rfind("\n", start, end)
                    if split <= start:
                        split = en.rfind(" ", start, end)
                    if split <= start:
                        split = end
                    end = split
                chunks.append(translator.translate(en[start:end]))
                start = end
                time.sleep(0.15)
            es = "".join(chunks)
        cache[en] = es
        time.sleep(0.08)
    return {"en": en, "es": es}


def localize_value(val: Any, translator: Any | None, cache: dict[str, str]) -> Any:
    if isinstance(val, str):
        return to_localized(val, translator, cache)
    if is_localized(val):
        if val.get("es"):
            return val
        return to_localized(val["en"], translator, cache)
    return val


def process_prompt_entry(entry: dict, translator: Any | None, cache: dict[str, str]) -> None:
    for key in ("title", "description", "how_to_use_prompt"):
        if key in entry:
            entry[key] = localize_value(entry[key], translator, cache)
    if "examples" in entry and isinstance(entry["examples"], list):
        for ex in entry["examples"]:
            if isinstance(ex, dict) and "action" in ex:
                ex["action"] = localize_value(ex["action"], translator, cache)


def process_media_entry(entry: dict, translator: Any | None, cache: dict[str, str]) -> None:
    for key in ("title", "description", "imageHint"):
        if key in entry:
            entry[key] = localize_value(entry[key], translator, cache)


def process_chrome_tool(tool: dict, translator: Any | None, cache: dict[str, str]) -> None:
    if "description" in tool:
        tool["description"] = localize_value(tool["description"], translator, cache)
    # Optional display title for UI (derived from name in app)
    name = tool.get("name", "")
    display_en = "Computer Use" if name == "computer" else name[:1].upper() + name[1:] if name else ""
    if display_en and "displayTitle" not in tool:
        tool["displayTitle"] = localize_value(display_en, translator, cache)


def migrate_amp(path: Path, translator: Any | None, cache: dict[str, str]) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    for entry in data.get("amp", []):
        process_prompt_entry(entry, translator, cache)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def migrate_anthropic(path: Path, translator: Any | None, cache: dict[str, str]) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    for entry in data.get("anthropic", []):
        process_prompt_entry(entry, translator, cache)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def migrate_chrome(path: Path, translator: Any | None, cache: dict[str, str]) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    for tool in data:
        process_chrome_tool(tool, translator, cache)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def migrate_placeholder_images(path: Path, translator: Any | None, cache: dict[str, str]) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    for entry in data.get("placeholderImages", []):
        process_media_entry(entry, translator, cache)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def migrate_placeholder_videos(path: Path, translator: Any | None, cache: dict[str, str]) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    for entry in data.get("placeholderVideos", []):
        process_media_entry(entry, translator, cache)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def migrate_web_pages(path: Path, translator: Any | None, cache: dict[str, str]) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    for entry in data.get("webPages", []):
        process_media_entry(entry, translator, cache)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-translate", action="store_true", help="Only wrap as {en, es=en}")
    parser.add_argument("--file", choices=["all", "amp", "anthropic", "chrome", "images", "videos", "web"], default="all")
    args = parser.parse_args()

    translator = None
    if not args.skip_translate:
        if GoogleTranslator is None:
            raise SystemExit("Install: pip install deep-translator")
        translator = GoogleTranslator(source="en", target="es")

    cache: dict[str, str] = {}
    jobs = {
        "amp": (migrate_amp, ROOT / "public/prompts/amp.json"),
        "anthropic": (migrate_anthropic, ROOT / "public/prompts/anthropic.json"),
        "chrome": (migrate_chrome, ROOT / "public/prompts/claude-chrome.json"),
        "images": (migrate_placeholder_images, ROOT / "public/prompts/placeholder-images.json"),
        "videos": (migrate_placeholder_videos, ROOT / "public/prompts/placeholder-videos.json"),
        "web": (migrate_web_pages, ROOT / "public/webpages/web-pages.json"),
    }

    targets = jobs.keys() if args.file == "all" else [args.file]
    for key in targets:
        fn, path = jobs[key]
        print(f"Migrating {path.name}...")
        fn(path, translator, cache)
        print(f"  done ({len(cache)} unique strings in cache)")


if __name__ == "__main__":
    main()
