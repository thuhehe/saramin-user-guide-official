---
name: saramin-docs
description: House style for the Saramin guide site (saramin-admin-guide.vercel.app) and the spec site (saramin-eta.vercel.app). Read this before writing or editing any page doc, module doc or spec block — before the first edit, not after a draft. Covers what a page must answer, the order to write it in, the fixed vocabulary, what to verify in the build repos first, and how to ship without clobbering another session.
---

# Writing Saramin docs

The reader is a BA, a QA or a dev who needs an answer in one pass. They will
not read twice. Everything below exists because that failed at least once.

## 1 · A page answers one question, and says so at the top

Start every page doc with `story` — one sentence, the reader's own words:

```ts
story: 'Là người đọc tài liệu này, tôi muốn thấy thẳng một mạch **X**, và **dựa trên Y**.'
```

If you cannot write that sentence, the page has no shape yet. Stop and find it
before writing a single block.

## 2 · Write in the order the thing actually runs

Not in the order it is convenient to explain. For a pipeline: filter → score →
arrange. For a flow: what the user does, then what the system does, then what
is stored.

**Introduce a concept at the point it is first used, never earlier.** The
Recommended jobs page used to open with "what the system knows about a
candidate" two sections before anything used it. Nobody could hold it in their
head that long. It now appears inside the scoring step, which is where the
candidate's data is first compared to anything.

Each section is a step. Number them `§1 · …`, `§2 · …` and have the overview
table point at them.

## 3 · Open with a summary table, then detail

`§1 · Tóm lại` is a table: **Bước | Hệ thống làm gì | Ra cái gì | Đọc chi tiết ở**.
A reader who stops after it still has a correct, usable picture. Say so in the
table's `note`.

## 4 · Never say the same thing twice on one page

The single most common defect here. A "read this first" box that repeats the
screenshot caption below it, a rule stated in `logic` and again in a block — all
of it gets cut on sight. Before adding a box, search the page for the fact.

If a fact belongs on another page, link to that page instead of restating it.

## 5 · Answer the obvious objection

A rule a reader can immediately contradict is worse than no rule. The experience
ladder said "many self-posted jobs only declare a level" — but the admin form
*requires* a years band, so the reader stops trusting the page. The fix was to
go to the code and find the real reason: only the **admin** form requires it,
`svn-web`'s employer form leaves it optional, and the onboarding count uses the
ladder unconditionally.

When you write a rule, ask what a sceptical reader would say back, and answer it
in the same block.

## 6 · Vocabulary — fixed, not negotiable

| Write | Never |
|---|---|
| `job` | `tin`, `tin tuyển dụng` (`thông tin` is fine) |
| `pool` | `rổ` |
| `tiêu chí` | `tín hiệu` |
| `v.1`, `version` | `bản` (for CV versions) |
| `ứng viên`, `nhà tuyển dụng` | `JS`, `NTD` on first use |

Plain Vietnamese, short sentences. Bold the thing that matters, not the whole
sentence. Explain every term the first time it appears. English is for chat
replies to Thu; deliverables follow whatever language she asked for.

## 7 · Verify before you write

The build is the source of truth; Notion and the spec both lag it.

- Repos: `~/Documents/SARAMIN_BUILD/{svn-be,svn-web,saramin-vn-admin}`
- **`svn-be`'s working tree is thousands of commits stale.** Always read it as
  `git show origin/dev:<path>`, never from disk.
- A number in a doc (weights, caps, pool size, thresholds) needs a file and a
  line behind it. If you cannot find one, write it as an open question with
  `kind: 'open'`, not as a fact.

## 8 · Mechanics

**Where things live**

- Page docs: `src/pagedocs/*.ts`, keyed by the `key` in `src/pages.json`
- Module docs (`/logic/<group>`): `MATCHING_MODULE_DOCS`-style exports in the same files
- Render order in `PageView`: `p.what` → `story` → `logic` → `how` → `watch` → `blocks`
- `DocBlock` kinds: `p` `h` `table` `list` `warn` `open` `example` `shot` `steps` `diagram`
- `table` and `list` take an optional `heading` — use it for sub-steps (`1a`, `2b`)
  instead of more `h` blocks, which would add index entries

**After editing a page doc**

1. Bump `src/updated.json` — and keep the format byte-exact:
   `json.dumps(d, ensure_ascii=False, indent=1) + '\n'`. `indent=2` reformats
   all 700+ lines and buries your change.
2. `npm run build` before pushing. A broken `.ts` takes the whole site down.
3. If you renumbered sections, grep the page for `§` and fix every pointer.
   Dangling refs like `§4a` survive for weeks.

**Shipping — several sessions share this checkout**

Local `main` is permanently divergent and `git pull --rebase` aborts. Never
push the shared working tree: its files are often *older* than `origin/main`,
and pushing them silently reverts other people's work.

```bash
git fetch origin
git worktree add --detach <scratch>/ship origin/main
# edit in <scratch>/ship, build, commit
git push origin HEAD:main
git worktree remove --force <scratch>/ship
git checkout origin/main -- <the files you touched>   # re-sync the shared tree
```

Before claiming a file has unpushed work, compare it to `origin/main`
(`git diff origin/main -- <file>`), not to local `HEAD`.

**Verify the deploy.** Vercel builds on push. Fetch the live bundle and grep for
a distinctive new string before telling anyone it is done:

```bash
B=$(curl -s https://saramin-admin-guide.vercel.app/ | grep -o '/assets/index-[A-Za-z0-9_-]*\.js' | head -1)
curl -s "https://saramin-admin-guide.vercel.app$B" -o /tmp/g.js && LC_ALL=C grep -c '<new string>' /tmp/g.js
```

## 9 · The guide site is for the client, and carries no requirement furniture

Thu settled this on 21/11/2026, after the Top search page had been written as a
requirement and had to be stripped back: **a guide-site page is a user guide for
the client. It describes the logic of one area and nothing else.**

Never put any of this on a guide page:

| Out | Where it belongs |
| --- | --- |
| "Bản yêu cầu", status lines, ✅ / 🔶 / ❓ markers | the spec site |
| Who decided, and when | the spec site |
| Ticket codes | the PM ticket |
| "hiện tại là 8", "đổi thành 20 nằm trong task", "khác hiện tại" | the PM ticket |
| Production measurements, pool sizes, named employers | the PM ticket |
| Config advice, internal to-do lists | the PM ticket |

A gap statement is the easiest one to write by accident. If a sentence only
makes sense to someone who is about to change the code, it is not guide text.

The close of a guide page is a plain date — `Cập nhật 21/11/2026.` — not a
provenance stamp with commit hashes. Those belong in the file's header comment,
where the next writer reads them and the client does not.

When the same decision has to be recorded for the dev, write it three times, in
three voices: the guide page says how it works, the spec site says what must be
built and why, the ticket says what to change and how it is tested.

## 10 · The spec site is a different job

`~/Documents/SARAMIN_REQUIREMENT`, data in `src/data/build/*.ts`, deploys to
saramin-eta.vercel.app on push to `main` (that checkout is *not* divergent —
commit and push normally).

It states what **should** be built and is written in English with a `VN —`
paragraph; the guide site states what **is** built and is written in Vietnamese.
Do not let one drift into the other's voice. Statuses and lifecycles go in a
table in the requirement, never as prose inside a mockup.
