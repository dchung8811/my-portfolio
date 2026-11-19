## Git sync protocol

GitHub is the source of truth. Local checkouts can be stale.

At the start of each task, and again before the first edit:
1. `git fetch origin`, then `git status --porcelain --branch`.
2. If there are uncommitted changes you didn't make, stop and report them.
   Never stash, discard, or commit them without permission.
3. If the branch has diverged from its upstream, stop and report it.
   Never rebase, merge, or force-push without permission.
4. If behind, `git pull --ff-only`.
5. Start new work on a branch cut from freshly fetched `origin/main`.
   Never commit or push directly to `main`.
6. State in one line that you're up to date (branch + short SHA).
   A new branch with no upstream yet is fine.

Recheck after the user says they pushed from another machine, or after a
non-fast-forward push rejection.

When work is done: commit, push the branch (never force-push without
permission), open a PR, and give the branch name, commit SHA, PR link, and
the commands to pull it locally.

A cloud session can't see unpushed work on the user's laptop. If something
looks missing, say so and ask them to push. Don't recreate it.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

### The graph is local only

`graphify-out/` is gitignored and never committed, so it exists only on the machine
that built it. If it is missing, rebuild it with exactly these two commands:

    graphify extract . --code-only
    graphify cluster-only . --no-label

Never use the LLM modes: `extract` or `update` without `--code-only`, `label`, or
`cluster-only` without `--no-label`. Those send file contents to an outside AI
service, and the tracked files here carry named employers' internal figures and
screenshots of internal tooling: `Fighting Checkout Fraud.html` ($800K annual costs,
$43M in refunds and chargebacks), `Link Cards Retention.html` (>$300M annual demand
across the URBN brands), `Address Corrections.html` (>$2M saved, Loqate),
`International Growth.html` and `Introducing Payment Methods.html` ($500K ARR,
$1.5M recurring revenue, Dropbox), `Purchase Monitor.html` (URBN's Snowflake, Qlik
and Slack stack), the dashboard and digest captures in `images/purchase-monitor/`,
the owner-only views in `images/ask-dennies/` (`13-owner-visits-log.webp`,
`14-owner-unanswered-backlog.webp`, `16-conversion-sql-and-table.webp`), and the
owner's email address in `index.html`. The site publishes these by choice; that is
not a reason to hand them to a third-party model. No credentials, keys or customer
data are tracked.

### What the graph does not know about this project

Measured on this repo, not assumed: the graph holds 29 nodes and 47 edges across
the `js/` modules the home page loads, so `query`, `affected`, `path`, `explain`
and `god-nodes` give real answers about home-page behavior. Everything else on the
site is still invisible to it, because `--code-only` classifies all 13 tracked
`.html` files as documents. Read the source directly for any of the following.

- **Inline `<script>` is never indexed, and three pages are still all inline.**
  `Ask Dennies Knowledge Map.html` holds ~223KB — the entire knowledge-map viewer —
  and the calculators in `Dog Food Calculator.html` and
  `Dog Food Calculator Multiple Foods.html` are inline too. The home page is the
  exception: its script now lives in `js/` (`main.js` starts `hero.js`, `nav.js`,
  `scroll-chrome.js`, `reveal.js` → `count-up.js`, `personal-work-wash.js`,
  `more-projects.js`, `books-shelf.js`), which is why the graph has anything in it.
- **The graph still cannot see which page loads a module.** `index.html` reaches
  `js/main.js` through a `<script type="module" src>` tag, and the modules reach the
  page through `getElementById` / `querySelector` on ids and classes defined in
  `index.html` and its inline `<style>` (`#typedHero`, `#heroTemplate`,
  `#menuOverlay`, `#introStack`, `#sectionPill`, `#more-projects`, `[data-shelf]`,
  `.reveal`, `.bio`, `.top-controls`). Those are the edges that break a page, and
  none of them are in the graph.
- **`case-study.js` has no recorded reach.** Nine pages load it via `<script src>`,
  a tag the extractor never read, and it drives them through DOM contracts shared
  with `case-study.css`: `.progress`, `.cs-nav`, `.cs-hero`, `.toc a`, `.reveal`,
  `.shot img`. Renaming one of those classes breaks pages the graph cannot connect.
- **The CSS build input lives outside this repo.** `output.css` is generated by
  `npx tailwindcss -i ./src/styles.css -o ./public/output.css --watch`, driven by
  `package.json`, `tailwind.config.js` and `src/styles.css` in the parent folder
  (`my-portfolio/`), none of which this repo tracks. Nothing in the graph shows that
  adding a Tailwind class to `index.html` needs that rebuild.
- **Routing and analytics are config, duplicated by hand.** `_redirects`
  (`/index2.html` → `/` 301) is the only routing rule, and the GA4 snippet
  `G-VY689R4G2L` is pasted into 12 of the 13 pages — every page except
  `Ask Dennies Knowledge Map.html`. Change it in one and the graph will not point
  you at the other 11.
- **Page-to-page structure exists only in HTML hrefs.** The Selected Work tiles in
  `index.html` and the `.next` footer link on each case study fix the reading order,
  and each `images/<case-study>/` folder pairs with its page by naming convention
  alone.
