#!/usr/bin/env python3
"""Translate web-pages.json text fields to English."""
import json
import re
import sys
import time
from pathlib import Path

from deep_translator import GoogleTranslator

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "public/webpages/web-pages.json"
CHUNK_SIZE = 4500
DELAY_SEC = 0.15

translator = GoogleTranslator(source="auto", target="en")
cache: dict[str, str] = {}


def translate_text(text: str) -> str:
    if not text or not text.strip():
        return text
    if text in cache:
        return cache[text]

    stripped = text.strip()
    if len(stripped) < 4:
        cache[text] = text
        return text

    parts: list[str] = []
    remaining = stripped
    while remaining:
        if len(remaining) <= CHUNK_SIZE:
            parts.append(remaining)
            break
        split_at = remaining.rfind("\n\n", 0, CHUNK_SIZE)
        if split_at < CHUNK_SIZE // 2:
            split_at = remaining.rfind("\n", 0, CHUNK_SIZE)
        if split_at < CHUNK_SIZE // 2:
            split_at = remaining.rfind(" ", 0, CHUNK_SIZE)
        if split_at < 1:
            split_at = CHUNK_SIZE
        parts.append(remaining[:split_at])
        remaining = remaining[split_at:].lstrip()

    translated_parts: list[str] = []
    for part in parts:
        for attempt in range(4):
            try:
                translated_parts.append(translator.translate(part))
                time.sleep(DELAY_SEC)
                break
            except Exception as err:
                if attempt == 3:
                    raise
                time.sleep(1.5 * (attempt + 1))
                print(f"  retry {attempt + 1}: {err}", file=sys.stderr)

    result = "".join(translated_parts)
    cache[text] = result
    return result


def translate_entry(entry: dict, index: int, total: int) -> dict:
    eid = entry.get("id", "?")
    print(f"[{index + 1}/{total}] id={eid} {entry.get('title', '')[:50]}...", flush=True)

    out = dict(entry)
    out["title"] = translate_text(entry.get("title", ""))
    out["description"] = translate_text(entry.get("description", ""))
    if entry.get("imageHint"):
        out["imageHint"] = translate_text(entry["imageHint"])
    if entry.get("tags"):
        out["tags"] = [translate_text(tag) for tag in entry["tags"]]
    return out


def main() -> None:
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    pages = data["webPages"]
    total = len(pages)

    translated = []
    for i, page in enumerate(pages):
        translated.append(translate_entry(page, i, total))

    data["webPages"] = translated
    JSON_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Done. Wrote {JSON_PATH} ({total} entries).", flush=True)


if __name__ == "__main__":
    main()
