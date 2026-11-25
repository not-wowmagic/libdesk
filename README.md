# LibDesk — browser version

A browser-only build of the LibDesk library management demo. It is the same
product as the original Python/Flask + SQLite app, rebuilt as a static site:
no server, no database, no installs, no network calls. Everything runs in the
tab and the demo data is rebuilt from a snapshot on every reload.

Live demo: *(added after the Vercel deployment)*

## Sign in

| Role | Username | Password |
|---|---|---|
| Librarian | `librarian` | `library123` |
| Student | `student` | `student123` |

The student account is linked to member **M01 · Alicia Ramos**. Click either
demo account on the login screen to fill the form.

## Run it locally

Any static file server works:

```powershell
python -m http.server 8000
```

Then open <http://127.0.0.1:8000>. Or just open `index.html` directly —
there is no build step and no backend.

Reloading the page restores the original demo data: 40 books, 90 copies,
25 members, 40 loans (28 active, 12 overdue). Dates in the snapshot are
shifted to the current day on load, so the overdue set stays meaningful.

## What it does

### Librarian

- **Dashboard** — collection size, copies available, members, open loans,
  overdue items, category breakdown, recent activity, popular titles.
- **Catalog** — search by title, author, ISBN; filter by category and
  availability; add, edit, remove titles; add copies; title detail with each
  physical copy, its borrower, and loan history.
- **Members** — search/filter by course, year, loan status; add, edit, remove
  members; member profile with open loans, history, eligible titles, and
  reader-based recommendations.
- **Circulation** — issue a loan by copy or accession number, 7/14/21-day
  lengths, returns, and overdue/due-soon filters.
- **Insights** — the borrowing relation matrix, reader-connection properties
  with a live counterexample, demand vs free copies, the copy × loan-length
  state space, functions, and the author transitive closure.
- **Reports** — five reports with the exact SQL shown behind each one, CSV
  download, and print view.
- **Settings** — library name, default loan length, fine, term, student
  notice, password change, and system counts.

### Student

- **Dashboard** — current loans, due dates, overdue warning, reading stats,
  library notice, and recommendations.
- **Catalog** — browse and search the collection; title detail with
  availability and copy status.
- **My loans** — open loans and full return history.
- **My profile** — member details, account details, password change.

## Where the discrete math lives

The math is computed from the live in-memory tables, not hardcoded.

| Concept | Where it appears |
|---|---|
| Sets and set difference | `owned − on loan = available` on the book page; `math.availableCopies` |
| Cartesian product + policy filter | "Ready to borrow" on a member profile; `math.candidatePairs` |
| Relations and zero-one matrix | Insights → Borrowing relation grid |
| Reflexive / symmetric / transitive | Insights → Reader connections, with a live counterexample |
| Functions, domain, range, injectivity | `math.copyToBook`, `math.memberToActiveLoans` |
| Product rule | Insights → Loan state space: 90 copies × 3 lengths = 270 |
| Demand vs supply | Insights → Demand vs free copies; Report 01 |
| Warshall transitive closure | Insights → Author network |
| SQL reports | Reports; each card shows its exact query |

`lib.js` holds the math and query layer; `reports.js` holds the SQL strings
and their live equivalents; `views.js` renders each screen; `app.js` handles
routing, sign-in, and transactions.

## Files

```text
index.html     entry point
styles.css     design system (from the original Flask app)
data.js        generated snapshot of the seeded demo database
lib.js         utilities, state, queries, discrete-math functions
reports.js     report definitions, SQL, and result computation
views.js       view renderers for all screens
app.js         router, auth, events, transactions, CSV export
vercel.json    static-site deployment settings
favicon.svg    tab icon
```

All changes made during a session — adds, edits, borrows, returns, settings —
live in memory and disappear on reload. Nothing is stored on a server or in
browser storage.

## Original project

The Flask + SQLite source, documentation PDF, and screenshots remain in the
original `DMATH FINAL PROJECT` folder. This repository is its browser port.
