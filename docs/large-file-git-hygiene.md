# Large-file and Git-history hygiene audit

Issue: #702  
Audited tree: `main` at `3e6e3e36ef7e0c294ef85b2424ab3638017cdb8f`

This audit is intentionally limited to the current tracked tree. It does not rewrite shared Git history.

## Largest tracked files at audit time

| Bytes | Path | Assessment |
| ---: | --- | --- |
| 5,984,645 | `public/webpages/mega-estadio/videos/Futuristic_stadium_light_explosion_202606091422.mp4` | Product/demo media; candidate for object storage if retained long term |
| 5,351,693 | `public/webpages/mega-estadio/videos/Futuristic_stadium_light_explosion_202606091422 (1).mp4` | Likely replaceable duplicate/generated media; investigate/remove or externalize |
| 4,406,538 | `temp-screenshots/node_modules/chromium-bidi/lib/iife/mapperTab.js.map` | Generated dependency artifact; should not be tracked |
| 3,433,566 | `public/webpages/cristiano-ronaldo/cr7_portugal_2026_ad_5s_4k60.mp4` | Product/demo media; object-storage candidate |
| 3,430,075 | `public/webpages/cr7/videos/CR7_AURA_can_explosion_202606091341.mp4` | Product/demo media; object-storage candidate |
| 3,253,132 | `public/webpages/messi/messi_ad_4k_60fps.mp4` | Product/demo media; object-storage candidate |
| 3,087,030 | `public/webpages/cr7/videos/CR7_AURA_can_explosion_202606091342.mp4` | Product/demo media; object-storage candidate |
| 3,019,540 | `public/webpages/cr7/videos/CR7_AURA_can_explosion_202606091340.mp4` | Product/demo media; object-storage candidate |
| 2,955,230 | `public/webpages/cr7/videos/CR7_AURA_can_explosion_202606091343.mp4` | Product/demo media; object-storage candidate |
| 2,895,332 | `public/webpages/cr7/images/1-ronaldo.png` | Large static image; optimize/externalize if not essential |
| 2,438,340 | `public/webpages/eternal-glory/assets/eternal-glory-hero.png` | Large static image; optimize if retained |
| 2,390,790 | `.specstory/history/2026-09-09_15-40-30Z-agrega-el-historial-de.md` | Generated development transcript/history; should not grow in Git |
| 2,294,044 | `public/webpages/el-tri/assets/el-tri-action.png` | Large static image; optimize if retained |
| 2,275,418 | `.specstory/history/2026-06-29_20-13-55Z.md` | Generated development transcript/history; should not grow in Git |
| 2,271,192 | `temp-screenshots/node_modules/chromium-bidi/lib/cjs/protocol-parser/generated/webdriver-bidi.d.ts` | Generated dependency artifact; should not be tracked |
| 2,271,192 | `temp-screenshots/node_modules/chromium-bidi/lib/esm/protocol-parser/generated/webdriver-bidi.d.ts` | Generated dependency artifact; should not be tracked |
| 2,153,607 | `public/webpages/albiceleste/assets/albiceleste-hero.png` | Large static image; optimize if retained |
| 2,082,130 | `public/webpages/el-tri/assets/el-tri-poster.png` | Large static image; optimize if retained |
| 1,997,756 | `public/webpages/albiceleste/qa/albiceleste-concept.png` | QA/design artifact; candidate for external artifact storage |
| 1,992,048 | `public/webpages/cr7/design/cr7-hero-concept.png` | Design artifact; candidate for external artifact storage |

The current tree also contains additional multi-megabyte `.specstory/history` files, generated dependencies under `temp-screenshots/node_modules`, and large media/design assets.

## Policy

- New tracked files above **5 MiB** are rejected by `npm run audit:large-files` unless explicitly allowlisted.
- Existing tracked `temp-screenshots/node_modules` content is reported as cleanup debt; `.gitignore` prevents ordinary new additions. The size gate still rejects newly unallowlisted files above 5 MiB.
- New `temp-screenshots/` and `.specstory/` content is ignored.
- Existing large product/demo assets are not deleted automatically. Removing them without checking runtime references could break demos.
- Existing historical large files are recorded in the baseline so the guard prevents regression without forcing unrelated deletion in this task.

## Generated/replaceable content

`temp-screenshots/node_modules/**` is dependency output and should be removed from the current tree in a dedicated cleanup after confirming no runtime dependency on the temp directory. `.specstory/**` is development-tool history rather than application runtime data; new files are ignored.

The duplicate-looking `Futuristic_stadium_light_explosion_202606091422 (1).mp4` should be checked against webpage references. If unused, remove it in a normal commit. Do not rewrite history merely to reclaim its old blob.

## Object storage / LFS

Large user/generated media that changes independently from source code is a better fit for the repository's existing object-storage direction than Git. Git LFS is appropriate only when binary assets genuinely need source-like versioning and the deployment/tooling path supports LFS. Stable, small static product assets can remain in Git after optimization.

## History migration

No history rewrite is performed by #702. If repository-size reduction requires purging historical blobs, prepare a separate migration plan covering: exact paths/blobs, backup/tag, collaborator freeze window, `git filter-repo` procedure, force-push authorization, branch/tag handling, CI/deployment impact, and fresh-clone instructions.
