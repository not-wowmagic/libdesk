/* LibDesk web — utilities, in-memory data, queries, and the math layer. */
(function () {
  "use strict";
  const LD = (window.LD = window.LD || {});

  const ENTITIES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

  const util = {
    esc(value) {
      return String(value == null ? "" : value).replace(/[&<>"']/g, (c) => ENTITIES[c]);
    },
    attr(value) {
      return util.esc(value).replace(/\n/g, "&#10;");
    },
    pad(value, width) {
      return String(value).padStart(width, "0");
    },
    mid(value) {
      return "M" + util.pad(value, 2);
    },
    bid(value) {
      return "B" + util.pad(value, 2);
    },
    cid(value) {
      return "A" + util.pad(value, 4);
    },
    comma(value) {
      return Number(value || 0).toLocaleString("en-US");
    },
    money(value) {
      const number = Number(value);
      return Number.isFinite(number)
        ? number.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : String(value);
    },
    initials(value) {
      const parts = String(value || "").replace(",", " ").split(/\s+/).filter(Boolean);
      if (!parts.length) return "?";
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    },
    plural(count, word) {
      return `${count} ${word}${count === 1 ? "" : "s"}`;
    },
    todayISO() {
      const now = new Date();
      return `${now.getFullYear()}-${util.pad(now.getMonth() + 1, 2)}-${util.pad(now.getDate(), 2)}`;
    },
    parseISO(value) {
      return new Date(`${value}T00:00:00Z`);
    },
    addDays(value, days) {
      const date = util.parseISO(value);
      date.setUTCDate(date.getUTCDate() + days);
      return date.toISOString().slice(0, 10);
    },
    diffDays(from, to) {
      return Math.round((util.parseISO(to) - util.parseISO(from)) / 86400000);
    },
    datefmt(value) {
      if (!value) return "—";
      const date = util.parseISO(value);
      if (Number.isNaN(date.getTime())) return String(value);
      return date.toLocaleDateString("en-US", {
        month: "short", day: "2-digit", year: "numeric", timeZone: "UTC",
      });
    },
    daysLate(loan, today) {
      return util.diffDays(loan.due_on, today || util.todayISO());
    },
    loanBadge(days) {
      if (days > 0) return `<span class="badge red">Overdue ${days}d</span>`;
      if (days === 0) return `<span class="badge amber">Due today</span>`;
      if (days >= -3) return `<span class="badge amber">Due in ${-days}d</span>`;
      return `<span class="badge green">On time</span>`;
    },
    icon(name, cls) {
      const shapes = {
        dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
        book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
        users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        circulation: '<path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
        chart: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
        report: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
        settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
        logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
        search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
        plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
        download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
        print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
        clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
        alert: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
        check: '<path d="M20 6 9 17l-5-5"/>',
        x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
        "arrow-left": '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
        "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
        menu: '<path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/>',
        edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
        trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
        eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
        calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
        filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
        library: '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
        user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
        "chevron-down": '<path d="m6 9 6 6 6-6"/>',
        info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
        spark: '<path d="m12 3-1.9 5.8L4 12l6.1 3.2L12 21l1.9-5.8L20 12l-6.1-3.2L12 3z"/>',
        bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
      };
      return `<svg class="${cls || "icon"}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${shapes[name] || ""}</svg>`;
    },
    avatar(name, tone) {
      return `<span class="avatar ${tone || "navy"}">${util.esc(util.initials(name))}</span>`;
    },
    parseQuery(search) {
      const result = {};
      for (const part of String(search || "").replace(/^\?/, "").split("&")) {
        if (!part) continue;
        const [key, value] = part.split("=");
        result[decodeURIComponent(key)] = decodeURIComponent(value || "");
      }
      return result;
    },
    buildQuery(params) {
      return Object.entries(params)
        .filter(([, value]) => value !== "" && value != null)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join("&");
    },
  };
  LD.util = util;

  /* ---------------------------------------------------------------- data */
  const data = {
    seed: null,
    state: null,
    user: null,
    passwords: { librarian: "library123", student: "student123" },
    load() {
      this.seed = window.LIBDESK_SEED;
      const clone = JSON.parse(JSON.stringify(this.seed));
      const offset = util.diffDays(this.seed.seedDate, util.todayISO());
      for (const loan of clone.loans) {
        loan.borrowed_on = util.addDays(loan.borrowed_on, offset);
        loan.due_on = util.addDays(loan.due_on, offset);
        if (loan.returned_on) loan.returned_on = util.addDays(loan.returned_on, offset);
      }
      for (const user of clone.users) {
        user.password_hash = this.passwords[user.username];
      }
      this.state = clone;
      this.user = null;
      return this.state;
    },
    reset() {
      this.passwords = { librarian: "library123", student: "student123" };
      return this.load();
    },
    settings() {
      const values = {};
      for (const row of this.state.settings) values[row.key] = row.value;
      return values;
    },
    setSetting(key, value) {
      const row = this.state.settings.find((item) => item.key === key);
      if (row) row.value = String(value);
    },
    currentMember() {
      if (!this.user || this.user.member_id == null) return null;
      return this.state.members.find((m) => m.id === this.user.member_id) || null;
    },
    userFor(username) {
      return this.state.users.find((u) => u.username.toLowerCase() === String(username).toLowerCase()) || null;
    },
    book(id) { return this.state.books.find((b) => b.id === Number(id)) || null; },
    member(id) { return this.state.members.find((m) => m.id === Number(id)) || null; },
    copy(id) { return this.state.copies.find((c) => c.id === Number(id)) || null; },
    loan(id) { return this.state.loans.find((l) => l.id === Number(id)) || null; },
    nextId(rows) { return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1; },
  };
  LD.data = data;

  /* --------------------------------------------------------------- math */
  const math = {
    LOAN_LENGTH_DAYS: [7, 14, 21],
    availableCopies(bookId) {
      const owned = new Set(data.state.copies.filter((c) => c.book_id === bookId).map((c) => c.id));
      const onLoan = new Set(
        data.state.copies.filter((c) => c.book_id === bookId && c.status === "on_loan").map((c) => c.id)
      );
      const available = new Set([...owned].filter((id) => !onLoan.has(id)));
      return { owned, onLoan, available };
    },
    candidatePairs() {
      const members = [...data.state.members].sort((a, b) => a.id - b.id).map((m) => ({ id: m.id, name: m.name }));
      const titles = [...data.state.books].sort((a, b) => a.id - b.id).map((b) => ({ id: b.id, title: b.title }));
      const before = [];
      for (const m of members) for (const t of titles) before.push([m.id, m.name, t.id, t.title]);

      const active = new Set(
        data.state.loans.filter((l) => l.returned_on == null).map((l) => {
          const copy = data.copy(l.copy_id);
          return `${l.member_id}:${copy ? copy.book_id : -1}`;
        })
      );
      const availability = {};
      for (const t of titles) availability[t.id] = this.availableCopies(t.id).available.size;

      const after = [];
      let alreadyHolding = 0;
      let noCopyAvailable = 0;
      for (const [memberId, name, bookId, title] of before) {
        if (active.has(`${memberId}:${bookId}`)) alreadyHolding++;
        else if (availability[bookId] === 0) noCopyAvailable++;
        else after.push([memberId, name, bookId, title]);
      }
      return {
        members, titles, before, after,
        before_count: before.length, after_count: after.length,
        member_count: members.length, title_count: titles.length,
        product_count: members.length * titles.length,
        excluded_already_holding: alreadyHolding,
        excluded_no_copy: noCopyAvailable,
      };
    },
    borrowRelation() {
      const members = [...data.state.members].sort((a, b) => a.id - b.id).map((m) => ({ id: m.id, name: m.name }));
      const books = [...data.state.books].sort((a, b) => a.id - b.id).map((b) => ({ id: b.id, title: b.title, author: b.author }));
      const active = new Set();
      for (const l of data.state.loans) {
        if (l.returned_on != null) continue;
        const copy = data.copy(l.copy_id);
        if (copy) active.add(`${l.member_id}:${copy.book_id}`);
      }
      const matrix = members.map((m) => books.map((b) => (active.has(`${m.id}:${b.id}`) ? 1 : 0)));
      const domain = members.filter((_, i) => matrix[i].some(Boolean));
      const range = books.filter((_, j) => matrix.some((row) => row[j]));
      const pairs = [...active].map((key) => key.split(":").map(Number)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      return {
        members, books, matrix, domain, range, pairs,
        ones: matrix.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0),
      };
    },
    coBorrowRelation(borrowRel) {
      const rel = borrowRel || this.borrowRelation();
      const matrix = rel.matrix;
      const size = matrix.length;
      const co = [];
      for (let i = 0; i < size; i++) {
        co[i] = [];
        for (let j = 0; j < size; j++) {
          let linked = false;
          for (let k = 0; k < size && !linked; k++) linked = Boolean(matrix[i][k] && matrix[j][k]);
          co[i][j] = linked ? 1 : 0;
        }
      }
      const memberIds = rel.members.map((m) => m.id);
      const pairs = [];
      let offDiagonal = 0;
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (co[i][j]) pairs.push([memberIds[i], memberIds[j]]);
          if (i !== j && co[i][j]) offDiagonal++;
        }
      }
      return {
        members: rel.members, member_ids: memberIds, matrix: co, pairs,
        ones: co.reduce((s, row) => s + row.reduce((a, b) => a + b, 0), 0),
        off_diagonal_ones: offDiagonal,
      };
    },
    relationProperties(matrix, labels) {
      const size = matrix.length;
      let reflexive = true, reflexiveWitness = null;
      for (let i = 0; i < size; i++) {
        if (matrix[i][i] !== 1) { reflexive = false; reflexiveWitness = labels[i]; break; }
      }
      let symmetric = true, symmetricWitness = null;
      for (let i = 0; i < size && symmetric; i++) {
        for (let j = 0; j < size; j++) {
          if (matrix[i][j] !== matrix[j][i]) {
            symmetric = false; symmetricWitness = [labels[i], labels[j]]; break;
          }
        }
      }
      let transitive = true, transitiveWitness = null;
      for (let i = 0; i < size && transitive; i++) {
        for (let j = 0; j < size && transitive; j++) {
          if (!matrix[i][j]) continue;
          for (let k = 0; k < size; k++) {
            if (matrix[j][k] && !matrix[i][k]) {
              transitive = false; transitiveWitness = [labels[i], labels[j], labels[k]]; break;
            }
          }
        }
      }
      return {
        reflexive, reflexive_witness: reflexiveWitness,
        symmetric, symmetric_witness: symmetricWitness,
        transitive, transitive_witness: transitiveWitness,
        diagonal_ones: matrix.reduce((sum, row, i) => sum + (row[i] === 1 ? 1 : 0), 0),
        size,
      };
    },
    copyToBook() {
      const mapping = new Map(data.state.copies.map((c) => [c.id, c.book_id]));
      const domain = new Set(mapping.keys());
      const range = new Set(mapping.values());
      const byBook = new Map();
      for (const [copyId, bookId] of mapping) {
        if (!byBook.has(bookId)) byBook.set(bookId, []);
        byBook.get(bookId).push(copyId);
      }
      let collision = null;
      for (const bookId of [...byBook.keys()].sort((a, b) => a - b)) {
        const ids = byBook.get(bookId).sort((a, b) => a - b);
        if (ids.length > 1) {
          collision = { book_id: bookId, book_title: data.book(bookId).title, copy_ids: ids };
          break;
        }
      }
      return {
        domain, range, domain_size: domain.size, range_size: range.size,
        one_to_one: domain.size === range.size,
        classification: domain.size === range.size ? "one-to-one" : "many-to-one",
        example_collision: collision,
      };
    },
    memberToActiveLoans() {
      const members = data.state.members;
      const mapping = new Map(members.map((m) => [m.id, new Set()]));
      for (const l of data.state.loans) {
        if (l.returned_on == null && mapping.has(l.member_id)) mapping.get(l.member_id).add(l.id);
      }
      const frozen = new Map([...mapping].map(([id, set]) => [id, [...set].sort((a, b) => a - b).join(",")]));
      const domain = new Set(frozen.keys());
      const range = new Set(frozen.values());
      const bySet = new Map();
      for (const [memberId, key] of frozen) {
        if (!bySet.has(key)) bySet.set(key, []);
        bySet.get(key).push(memberId);
      }
      let collision = null;
      for (const [key, ids] of bySet) {
        if (ids.length > 1) {
          collision = {
            member_ids: ids.sort((a, b) => a - b),
            member_names: ids.map((id) => data.member(id).name),
            active_loan_ids: key ? key.split(",").map(Number) : [],
          };
          break;
        }
      }
      const oneToOne = [...bySet.values()].every((ids) => ids.length === 1);
      return {
        domain, range, domain_size: domain.size, range_size: range.size,
        one_to_one: oneToOne,
        classification: oneToOne ? "one-to-one" : "many-to-one",
        example_collision: collision,
      };
    },
    productRule() {
      const copyIds = data.state.copies.map((c) => c.id);
      const states = [];
      for (const id of copyIds) for (const length of this.LOAN_LENGTH_DAYS) states.push([id, length]);
      return {
        copy_ids: copyIds, copy_count: copyIds.length,
        loan_lengths: this.LOAN_LENGTH_DAYS, length_count: this.LOAN_LENGTH_DAYS.length,
        states, count: states.length,
      };
    },
    shortageCases() {
      const demand = new Map();
      for (const l of data.state.loans) {
        const copy = data.copy(l.copy_id);
        if (!copy) continue;
        if (!demand.has(copy.book_id)) demand.set(copy.book_id, new Set());
        demand.get(copy.book_id).add(l.member_id);
      }
      const cases = [];
      for (const book of data.state.books) {
        const requested = demand.has(book.id) ? demand.get(book.id).size : 0;
        const supplied = this.availableCopies(book.id).available.size;
        if (requested > supplied) {
          const shortfall = requested - supplied;
          cases.push({
            book_id: book.id, title: book.title, demand: requested, available: supplied, shortfall,
            expression: `${requested} - ${supplied} = ${shortfall}`,
          });
        }
      }
      cases.sort((a, b) => b.shortfall - a.shortfall || a.title.localeCompare(b.title));
      return {
        cases,
        total_cases: cases.length,
        total_shortfall: cases.reduce((sum, c) => sum + c.shortfall, 0),
        definition: "Demand is the number of distinct members with a loan record for the title; availability is the current count of free copies.",
      };
    },
    authorTransitiveClosure() {
      const authors = [...new Set(data.state.books.map((b) => b.author))].sort();
      const index = new Map(authors.map((a, i) => [a, i]));
      const memberAuthors = new Map();
      for (const l of data.state.loans) {
        const copy = data.copy(l.copy_id);
        const book = copy && data.book(copy.book_id);
        if (!book) continue;
        if (!memberAuthors.has(l.member_id)) memberAuthors.set(l.member_id, new Set());
        memberAuthors.get(l.member_id).add(book.author);
      }
      const matrix = authors.map(() => authors.map(() => 0));
      for (const set of memberAuthors.values()) {
        for (const first of set) for (const second of set) matrix[index.get(first)][index.get(second)] = 1;
      }
      const closure = matrix.map((row) => row.slice());
      const n = authors.length;
      for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
          if (!closure[i][k]) continue;
          for (let j = 0; j < n; j++) if (closure[k][j]) closure[i][j] = 1;
        }
      }
      const newPairs = [];
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (closure[i][j] && !matrix[i][j]) newPairs.push({ a: authors[i], b: authors[j] });
        }
      }
      const countOnes = (m) => m.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0);
      const originalOnes = countOnes(matrix);
      const closureOnes = countOnes(closure);
      return {
        authors, matrix, closure, author_count: n,
        members_with_loans: memberAuthors.size,
        original_ones: originalOnes, closure_ones: closureOnes,
        added_ones: closureOnes - originalOnes,
        new_pairs: newPairs, new_pair_count: newPairs.length,
        closure_is_transitive: this.relationProperties(closure, authors).transitive,
      };
    },
  };
  LD.math = math;

  /* ------------------------------------------------------------- queries */
  const query = {
    loanRows(opts = {}) {
      const { memberId = null, search = "", status = "all", limit = null } = opts;
      const today = util.todayISO();
      const needle = search.trim().toLowerCase();
      let rows = data.state.loans.filter((l) => l.returned_on == null);
      if (memberId != null) rows = rows.filter((l) => l.member_id === Number(memberId));
      if (needle) {
        rows = rows.filter((l) => {
          const copy = data.copy(l.copy_id);
          const book = copy && data.book(copy.book_id);
          const member = data.member(l.member_id);
          return [member && member.name, book && book.title, book && book.author, copy && copy.accession_no]
            .some((value) => value && String(value).toLowerCase().includes(needle));
        });
      }
      const late = (l) => util.diffDays(l.due_on, today);
      if (status === "overdue") rows = rows.filter((l) => late(l) > 0);
      else if (status === "due_soon") rows = rows.filter((l) => late(l) <= 0 && late(l) >= -3);
      else if (status === "current") rows = rows.filter((l) => late(l) <= 0);
      rows.sort((a, b) => a.due_on.localeCompare(b.due_on) || a.id - b.id);

      return rows.map((l) => {
        const copy = data.copy(l.copy_id);
        const book = copy && data.book(copy.book_id);
        const member = data.member(l.member_id);
        return {
          id: l.id, copy_id: l.copy_id, member_id: l.member_id,
          borrowed_on: l.borrowed_on, due_on: l.due_on,
          member_name: member ? member.name : "—",
          course: member ? member.course : "—",
          book_id: book ? book.id : null,
          title: book ? book.title : "—",
          author: book ? book.author : "—",
          category: book ? book.category : "—",
          accession_no: copy ? copy.accession_no : "—",
          days_late: late(l),
        };
      }).slice(0, limit == null ? undefined : limit);
    },
    historyRows(memberId, limit = 20) {
      return data.state.loans
        .filter((l) => l.member_id === Number(memberId) && l.returned_on != null)
        .sort((a, b) => b.returned_on.localeCompare(a.returned_on) || b.id - a.id)
        .slice(0, limit)
        .map((l) => {
          const copy = data.copy(l.copy_id);
          const book = copy && data.book(copy.book_id);
          return {
            id: l.id, borrowed_on: l.borrowed_on, due_on: l.due_on, returned_on: l.returned_on,
            title: book ? book.title : "—", author: book ? book.author : "—",
            accession_no: copy ? copy.accession_no : "—",
          };
        });
    },
    popularBooks(limit = 5) {
      return data.state.books.map((book) => {
        const copyIds = new Set(data.state.copies.filter((c) => c.book_id === book.id).map((c) => c.id));
        return {
          id: book.id, title: book.title, author: book.author, category: book.category,
          loans: data.state.loans.filter((l) => copyIds.has(l.copy_id)).length,
          owned: copyIds.size,
          available: math.availableCopies(book.id).available.size,
        };
      }).sort((a, b) => b.loans - a.loans || a.title.localeCompare(b.title)).slice(0, limit);
    },
    relatedBooks(bookId, limit = 4) {
      const anchorLoans = data.state.loans.filter((l) => {
        const copy = data.copy(l.copy_id);
        return copy && copy.book_id === Number(bookId);
      });
      const anchorMembers = new Set(anchorLoans.map((l) => l.member_id));
      const scores = new Map();
      for (const l of data.state.loans) {
        if (!anchorMembers.has(l.member_id)) continue;
        const copy = data.copy(l.copy_id);
        if (!copy || copy.book_id === Number(bookId)) continue;
        scores.set(copy.book_id, (scores.get(copy.book_id) || 0) + 1);
      }
      return [...scores].map(([id, score]) => {
        const book = data.book(id);
        return {
          id, title: book.title, author: book.author, category: book.category, score,
          available: math.availableCopies(id).available.size,
        };
      }).filter((book) => book.available > 0)
        .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit);
    },
    recommendationsForMember(memberId, limit = 4) {
      const memberIdNum = Number(memberId);
      const activeBooks = new Set();
      const readBooks = new Set();
      for (const l of data.state.loans) {
        if (l.member_id !== memberIdNum) continue;
        const copy = data.copy(l.copy_id);
        if (!copy) continue;
        readBooks.add(copy.book_id);
        if (l.returned_on == null) activeBooks.add(copy.book_id);
      }
      const results = [];
      if (activeBooks.size) {
        const peerIds = new Set();
        for (const l of data.state.loans) {
          if (l.returned_on != null || l.member_id === memberIdNum) continue;
          const copy = data.copy(l.copy_id);
          if (copy && activeBooks.has(copy.book_id)) peerIds.add(l.member_id);
        }
        const exclude = new Set([...readBooks, ...activeBooks]);
        const scores = new Map();
        for (const l of data.state.loans) {
          if (l.returned_on == null && peerIds.has(l.member_id)) {
            const copy = data.copy(l.copy_id);
            if (copy && !exclude.has(copy.book_id)) scores.set(copy.book_id, (scores.get(copy.book_id) || 0) + 1);
          }
        }
        for (const [id, score] of scores) {
          const book = data.book(id);
          const available = math.availableCopies(id).available.size;
          if (available > 0) {
            results.push({
              id, title: book.title, author: book.author, category: book.category,
              score, available, reason: "Readers who share your titles also borrowed this",
            });
          }
        }
        results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
      }
      if (!results.length) {
        for (const book of this.popularBooks(limit * 3)) {
          if (!readBooks.has(book.id) && book.available > 0) {
            results.push({ ...book, reason: "Popular across the library right now" });
          }
        }
      }
      return results.slice(0, limit);
    },
    catalogRows(opts = {}) {
      const { search = "", category = "", availability = "", sort = "title" } = opts;
      const needle = search.trim().toLowerCase();
      let rows = data.state.books.filter((book) => {
        if (needle && ![book.title, book.author, book.isbn].some((v) => v.toLowerCase().includes(needle))) return false;
        if (category && book.category !== category) return false;
        return true;
      }).map((book) => ({
        id: book.id, title: book.title, author: book.author, isbn: book.isbn, category: book.category,
        owned: data.state.copies.filter((c) => c.book_id === book.id).length,
        available: math.availableCopies(book.id).available.size,
      }));
      if (availability === "available") rows = rows.filter((b) => b.available > 0);
      else if (availability === "unavailable") rows = rows.filter((b) => b.available === 0);
      else if (availability === "low") rows = rows.filter((b) => b.available > 0 && b.available <= 1);
      const comparators = {
        title: (a, b) => a.title.localeCompare(b.title),
        author: (a, b) => a.author.localeCompare(b.author),
        newest: (a, b) => b.id - a.id,
        available: (a, b) => b.available - a.available || a.title.localeCompare(b.title),
      };
      return rows.sort(comparators[sort] || comparators.title);
    },
    memberRows(opts = {}) {
      const { search = "", course = "", yearLevel = 0, status = "all" } = opts;
      const needle = search.trim().toLowerCase();
      const today = util.todayISO();
      let rows = data.state.members.filter((m) => {
        if (needle && ![m.name, m.course].some((v) => v.toLowerCase().includes(needle))) return false;
        if (course && m.course !== course) return false;
        if (yearLevel && m.year_level !== Number(yearLevel)) return false;
        return true;
      }).map((m) => {
        const loans = data.state.loans.filter((l) => l.member_id === m.id);
        return {
          id: m.id, name: m.name, course: m.course, year_level: m.year_level,
          total_loans: loans.length,
          active_loans: loans.filter((l) => l.returned_on == null).length,
          overdue: loans.filter((l) => l.returned_on == null && l.due_on < today).length,
        };
      });
      if (status === "active") rows = rows.filter((m) => m.active_loans > 0);
      else if (status === "overdue") rows = rows.filter((m) => m.overdue > 0);
      else if (status === "none") rows = rows.filter((m) => m.active_loans === 0);
      return rows.sort((a, b) => a.name.localeCompare(b.name));
    },
    dashboardStats() {
      const s = data.state;
      const active = s.loans.filter((l) => l.returned_on == null);
      const today = util.todayISO();
      const copies = s.copies.length;
      const available = s.copies.filter((c) => c.status === "available").length;
      return {
        titles: s.books.length, copies, available,
        on_loan: s.copies.filter((c) => c.status === "on_loan").length,
        members: s.members.length,
        active_members: new Set(active.map((l) => l.member_id)).size,
        active_loans: active.length,
        overdue: active.filter((l) => l.due_on < today).length,
        due_today: active.filter((l) => l.due_on === today).length,
        total_loans: s.loans.length,
        availability_pct: copies ? Math.round((available / copies) * 100) : 0,
      };
    },
    bookDetail(bookId) {
      const book = data.book(bookId);
      if (!book) return null;
      const { owned, onLoan, available } = math.availableCopies(book.id);
      const labels = (ids) => [...ids].sort((a, b) => a - b).map((id) => data.copy(id).accession_no);
      const today = util.todayISO();
      const copies = data.state.copies.filter((c) => c.book_id === book.id)
        .sort((a, b) => a.accession_no.localeCompare(b.accession_no))
        .map((copy) => {
          const loan = data.state.loans.find((l) => l.copy_id === copy.id && l.returned_on == null);
          const member = loan && data.member(loan.member_id);
          return {
            id: copy.id, accession_no: copy.accession_no, status: copy.status,
            borrower: member ? member.name : null,
            due_on: loan ? loan.due_on : null,
            days_late: loan ? util.diffDays(loan.due_on, today) : 0,
          };
        });
      const history = data.state.loans.filter((l) => {
        const copy = data.copy(l.copy_id);
        return copy && copy.book_id === book.id;
      }).sort((a, b) => b.id - a.id).slice(0, 10).map((l) => ({
        id: l.id, borrowed_on: l.borrowed_on, due_on: l.due_on, returned_on: l.returned_on,
        member_name: data.member(l.member_id).name, accession_no: data.copy(l.copy_id).accession_no,
      }));
      return {
        book: {
          ...book,
          owned: owned.size,
          available: available.size,
        },
        copies, history, related: this.relatedBooks(book.id),
        owned_labels: labels(owned), on_loan_labels: labels(onLoan), available_labels: labels(available),
        available_copy_id: copies.find((c) => c.status === "available")?.id || null,
      };
    },
    memberDetail(memberId) {
      const member = data.member(memberId);
      if (!member) return null;
      const activeLoans = this.loanRows({ memberId: member.id });
      const readBooks = new Set(
        data.state.loans.filter((l) => l.member_id === member.id)
          .map((l) => { const c = data.copy(l.copy_id); return c && c.book_id; }).filter(Boolean)
      );
      const totals = {
        total_loans: data.state.loans.filter((l) => l.member_id === member.id).length,
        books_read: readBooks.size,
      };
      const pairs = math.candidatePairs();
      const eligible = pairs.after.filter((pair) => pair[0] === member.id);
      const account = data.state.users.find((u) => u.member_id === member.id) || null;
      return {
        member, active_loans: activeLoans, history: this.historyRows(member.id, 10),
        recommendations: this.recommendationsForMember(member.id, 4),
        totals, overdue: activeLoans.filter((l) => l.days_late > 0).length,
        eligible: eligible.slice(0, 4), eligible_count: eligible.length,
        product_count: pairs.product_count, account,
      };
    },
  };
  LD.query = query;
})();
