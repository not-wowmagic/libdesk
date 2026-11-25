/* LibDesk web — view renderers. Markup mirrors the original Jinja templates. */
(function () {
  "use strict";
  const LD = (window.LD = window.LD || {});
  const { util, data, math, query } = LD;
  const e = util.esc;
  const icon = util.icon;
  const avatar = util.avatar;
  const loanBadge = util.loanBadge;
  const views = {};

  const link = (path) => `#${path}`;
  const selected = (value, current) => (String(value) === String(current) ? " selected" : "");
  const emptyState = (name, title, text, action) => `
    <div class="empty-state">${icon(name)}<h3>${e(title)}</h3><p>${e(text)}</p>${action || ""}</div>`;

  /* ------------------------------------------------------------- shell */
  views.shell = function (opts) {
    const user = data.user;
    const settings = data.settings();
    const isLib = user.role === "librarian";
    const active = opts.active;
    const navLink = (key, path, name, glyph, current) => `
      <a class="nav-link ${active === key ? "active" : ""}" href="${link(path)}"
         ${active === key ? 'aria-current="page"' : ""}>
        ${icon(glyph)}<span>${name}</span>
      </a>`;
    const overdue = isLib ? query.loanRows({ status: "overdue" }).length : 0;

    const nav = isLib
      ? `${navLink("dashboard", "/dashboard", "Dashboard", "dashboard", active)}
         ${navLink("catalog", "/catalog", "Catalog", "book", active)}
         ${navLink("members", "/members", "Members", "users", active)}
         ${navLink("circulation", "/circulation", "Circulation", "circulation", active)}
         <p class="nav-section">Analytics</p>
         ${navLink("insights", "/insights", "Insights", "chart", active)}
         ${navLink("reports", "/reports", "Reports", "report", active)}
         <p class="nav-section">System</p>
         ${navLink("settings", "/settings", "Settings", "settings", active)}`
      : `${navLink("dashboard", "/dashboard", "Dashboard", "dashboard", active)}
         ${navLink("catalog", "/catalog", "Catalog", "book", active)}
         ${navLink("my_loans", "/my-loans", "My loans", "bookmark", active)}
         <p class="nav-section">Account</p>
         ${navLink("settings", "/settings", "My profile", "user", active)}`;

    const todayText = util.datefmt(util.todayISO());
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(opts.title)} · ${e(settings.library_name)}</title>
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
<div class="app-shell">
  <aside class="sidebar" id="sidebar">
    <a class="brand" href="${link("/dashboard")}">
      <span class="brand-mark">${icon("library")}</span>
      <span class="brand-text"><strong>LibDesk</strong><small>Library management</small></span>
    </a>
    <nav class="sidebar-nav" aria-label="Main navigation">${nav}</nav>
    <div class="sidebar-foot">
      <div class="sidebar-user">
        ${avatar(user.display_name)}
        <div class="sidebar-user-text">
          <strong>${e(user.display_name)}</strong>
          <span>${isLib ? "Librarian" : "Student"}</span>
        </div>
        <a class="icon-btn on-dark" href="${link("/login")}" data-action="logout" title="Sign out">${icon("logout")}</a>
      </div>
      <p class="sidebar-note">Browser demo · resets on reload</p>
    </div>
  </aside>
  <div class="sidebar-backdrop" data-action="close-sidebar"></div>
  <div class="app-main">
    <header class="topbar">
      <button class="icon-btn menu-btn" type="button" data-action="toggle-sidebar" aria-label="Open navigation">${icon("menu")}</button>
      <div class="topbar-crumb">
        <span>${e(settings.library_name)}</span><span class="crumb-sep">/</span><strong>${e(opts.breadcrumb)}</strong>
      </div>
      <form class="topbar-search" data-form="topbar-search" role="search">
        ${icon("search")}
        <input type="search" name="q" placeholder="Search the catalog…" aria-label="Search the catalog" autocomplete="off">
      </form>
      <div class="topbar-actions">
        ${isLib && overdue ? `<a class="alert-chip" href="${link("/circulation?status=overdue")}" title="Overdue loans">${icon("alert")}<span>${overdue} overdue</span></a>` : ""}
        <span class="date-chip">${icon("calendar")}${todayText}</span>
        <a class="icon-btn" href="${link("/settings")}" title="Account settings">${icon("user")}</a>
      </div>
    </header>
    <main class="content">
      <div class="toasts" id="toasts" aria-live="polite" aria-atomic="false"></div>
      ${opts.content}
      <footer class="app-footer">
        <span>${e(settings.library_name)} · ${e(settings.academic_year)} · ${e(settings.semester)}</span>
        <span>LibDesk 2.0, browser version, discrete mathematics final project</span>
      </footer>
    </main>
  </div>
</div>
</body>
</html>`;
  };

  /* ------------------------------------------------------------- login */
  views.login = function (opts = {}) {
    const error = opts.error;
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign in · LibDesk</title>
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="styles.css">
</head>
<body class="auth-body">
<main class="auth-shell">
  <section class="auth-visual">
    <div class="auth-visual-inner">
      <div class="auth-brand">
        <span class="auth-logo">${icon("library")}</span>
        <span class="auth-brand-text"><strong>LibDesk</strong><small>Library management system</small></span>
      </div>
      <div class="auth-copy">
        <p class="auth-kicker">Everything in one desk</p>
        <h1>Run the library<br>without the paperwork.</h1>
        <p class="auth-tagline">Catalog, members, circulation, and reports all use the same live records.</p>
      </div>
      <ul class="auth-points">
        <li>${icon("book")}<span>Search the catalog and see available copies instantly</span></li>
        <li>${icon("circulation")}<span>Issue and return books without leaving the desk</span></li>
        <li>${icon("chart")}<span>Spot overdue loans and reader demand as they happen</span></li>
      </ul>
      <p class="auth-visual-foot">Browser demo · no server or database · Discrete Mathematics final project</p>
    </div>
    <div class="auth-orb auth-orb-one"></div><div class="auth-orb auth-orb-two"></div>
  </section>
  <section class="auth-panel">
    <div class="auth-form-wrap">
      <p class="auth-eyebrow">Welcome!</p>
      <h2>Login to your workspace</h2>
      <p class="auth-sub">Use your library account to continue.</p>
      ${error ? `<div class="form-error" role="alert">${icon("alert")}<span>${e(error)}</span></div>` : ""}
      <form class="auth-form" data-form="login">
        <div class="field">
          <label for="username">Username</label>
          <input id="username" name="username" type="text" value="${e(opts.username || "")}" placeholder="e.g. librarian" autocomplete="username" autofocus required>
        </div>
        <div class="field">
          <label for="password">Password</label>
          <div class="password-wrap">
            <input id="password" name="password" type="password" placeholder="Enter your password" autocomplete="current-password" required>
            <button class="password-toggle" type="button" data-action="toggle-password" aria-label="Show password">${icon("eye")}</button>
          </div>
        </div>
        <button class="btn primary block" type="submit">Sign in</button>
      </form>
      <div class="demo-box">
        <p class="demo-title">Demo accounts</p>
        <button class="demo-account" type="button" data-action="fill-login" data-username="librarian" data-password="library123">
          <span class="demo-role">${icon("user")} Librarian</span><code>librarian / library123</code>
        </button>
        <button class="demo-account" type="button" data-action="fill-login" data-username="student" data-password="student123">
          <span class="demo-role">${icon("book")} Student</span><code>student / student123</code>
        </button>
      </div>
      <p class="auth-foot">Demo data is rebuilt in your browser on every reload.</p>
    </div>
  </section>
</main>
</body>
</html>`;
  };

  /* --------------------------------------------------------- dashboard */
  views.dashboard = function () {
    const stats = query.dashboardStats();
    const activeLoans = query.loanRows({ limit: 7 });
    const overdueLoans = query.loanRows({ status: "overdue", limit: 4 });
    const categoryLoad = [];
    const groups = new Map();
    for (const copy of data.state.copies) {
      const book = data.book(copy.book_id);
      if (!groups.has(book.category)) groups.set(book.category, { copies: 0, available: 0 });
      const group = groups.get(book.category);
      group.copies++;
      if (copy.status === "available") group.available++;
    }
    for (const [category, group] of groups) {
      categoryLoad.push({ category, copies: group.copies, available: group.available, pct: stats.copies ? Math.round(group.copies / stats.copies * 100) : 0 });
    }
    categoryLoad.sort((a, b) => b.copies - a.copies || a.category.localeCompare(b.category));
    const recent = [...data.state.loans]
      .sort((a, b) => (b.returned_on || b.borrowed_on).localeCompare(a.returned_on || a.borrowed_on) || b.id - a.id)
      .slice(0, 6)
      .map((l) => {
        const copy = data.copy(l.copy_id);
        return {
          id: l.id, borrowed_on: l.borrowed_on, returned_on: l.returned_on,
          member_name: data.member(l.member_id).name,
          title: data.book(copy.book_id).title, accession_no: copy.accession_no,
        };
      });
    const popular = query.popularBooks(5);

    const content = `<div class="page-head">
  <div>
    <p class="eyebrow">Library overview</p>
    <h1>Good day, ${e(data.user.display_name.split(" ")[0])}</h1>
    <p class="page-sub">Here is what is happening at ${e(data.settings().library_name)} today.</p>
  </div>
  <div class="page-actions">
    <a class="btn secondary" href="${link("/circulation")}">${icon("circulation")} Issue a loan</a>
    <a class="btn primary" href="${link("/catalog")}">${icon("plus")} Add book</a>
  </div>
</div>

<div class="stat-grid">
  <article class="stat-card">
    <div class="stat-top"><span class="stat-icon navy">${icon("book")}</span><span class="stat-badge">COLLECTION</span></div>
    <p class="stat-label">Titles catalogued</p><p class="stat-value">${util.comma(stats.titles)}</p>
    <p class="stat-foot">${stats.copies} physical copies in the library</p>
  </article>
  <article class="stat-card">
    <div class="stat-top"><span class="stat-icon green">${icon("check")}</span><span class="stat-badge">${stats.availability_pct}% READY</span></div>
    <p class="stat-label">Copies available</p><p class="stat-value">${util.comma(stats.available)}</p>
    <p class="stat-foot">${stats.on_loan} currently on loan</p>
  </article>
  <article class="stat-card">
    <div class="stat-top"><span class="stat-icon blue">${icon("users")}</span><span class="stat-badge">${stats.active_members} ACTIVE</span></div>
    <p class="stat-label">Registered members</p><p class="stat-value">${util.comma(stats.members)}</p>
    <p class="stat-foot">${stats.active_loans} loans open right now</p>
  </article>
  <article class="stat-card">
    <div class="stat-top"><span class="stat-icon red">${icon("alert")}</span><span class="stat-badge ${stats.overdue ? "danger" : ""}">NEEDS ATTENTION</span></div>
    <p class="stat-label">Overdue loans</p><p class="stat-value">${util.comma(stats.overdue)}</p>
    <p class="stat-foot">${stats.due_today ? stats.due_today + " more due today" : "No items due today"}</p>
  </article>
</div>

<div class="dashboard-grid">
  <section class="table-card">
    <header class="table-card-head">
      <div><h2>Active loans</h2><p>Items currently out and their return dates.</p></div>
      <a class="link-light" href="${link("/circulation")}">View all ${icon("arrow-right")}</a>
    </header>
    ${activeLoans.length ? `<div class="table-wrap"><table class="data-table">
      <thead><tr><th>Member</th><th>Book</th><th>Due</th><th>Status</th><th class="actions-col"></th></tr></thead>
      <tbody>${activeLoans.map((loan) => `<tr>
        <td><a class="cell-person" href="${link("/members/" + loan.member_id)}">${avatar(loan.member_name)}<span><strong>${e(loan.member_name)}</strong><small>${util.mid(loan.member_id)} · ${e(loan.course)}</small></span></a></td>
        <td><div class="cell-title"><a href="${link("/catalog/" + loan.book_id)}">${e(loan.title)}</a><span>${e(loan.accession_no)} · ${e(loan.author)}</span></div></td>
        <td class="nowrap">${util.datefmt(loan.due_on)}</td>
        <td>${loanBadge(loan.days_late)}</td>
        <td><button class="icon-btn" type="button" data-action="return" data-loan="${loan.id}" title="Return ${e(loan.title)}">${icon("arrow-left")}</button></td>
      </tr>`).join("")}</tbody>
    </table></div>` : emptyState("check", "No active loans", "Every copy is on the shelf. Issue a loan when a member is ready.")}
  </section>

  <aside class="stack">
    <section class="card">
      <div class="card-head"><div><h2>Collection health</h2><p>How much of the collection is on the shelf.</p></div><span class="badge navy">${stats.availability_pct}%</span></div>
      <div class="progress big" role="img" aria-label="${stats.available} of ${stats.copies} copies available"><span style="width: ${stats.availability_pct}%"></span></div>
      <div class="legend-row"><span><i class="dot green"></i>${stats.available} available</span><span><i class="dot amber"></i>${stats.on_loan} on loan</span></div>
      <div class="divider"></div><h3 class="minor-title">Copies by category</h3>
      ${categoryLoad.slice(0, 6).map((row) => `<div class="bar-row"><div class="bar-label"><span>${e(row.category)}</span><span>${row.copies}</span></div><div class="progress"><span style="width: ${row.pct}%"></span></div></div>`).join("")}
    </section>
    <section class="card">
      <div class="card-head"><div><h2>Needs attention</h2><p>Loans past their return date.</p></div><span class="badge ${overdueLoans.length ? "red" : "green"}">${overdueLoans.length}</span></div>
      ${overdueLoans.length ? overdueLoans.map((loan) => `<a class="attention-row" href="${link("/members/" + loan.member_id)}">${avatar(loan.member_name, "red")}<span class="attention-text"><strong>${e(loan.member_name)}</strong><small>${e(loan.title)}</small></span><span class="badge red">${loan.days_late}d late</span></a>`).join("") : `<div class="mini-empty">${icon("check")}<p>Nothing overdue. The desk is clear.</p></div>`}
      ${overdueLoans.length ? `<a class="btn secondary block" href="${link("/circulation?status=overdue")}">Review overdue loans</a>` : ""}
    </section>
  </aside>
</div>

<div class="dashboard-grid two">
  <section class="card">
    <div class="card-head"><div><h2>Popular titles</h2><p>Most borrowed titles across all loan history.</p></div><a class="link-muted" href="${link("/reports")}">Reports</a></div>
    <ol class="rank-list">${popular.map((book, index) => `<li><span class="rank">${index + 1}</span><a class="rank-title" href="${link("/catalog/" + book.id)}"><strong>${e(book.title)}</strong><small>${e(book.author)} · ${e(book.category)}</small></a><span class="rank-meta"><strong>${book.loans}</strong><small>loans</small></span></li>`).join("")}</ol>
  </section>
  <section class="card">
    <div class="card-head"><div><h2>Recent activity</h2><p>The latest borrow and return records.</p></div></div>
    <ul class="timeline">${recent.map((row) => `<li><span class="timeline-dot ${row.returned_on ? "green" : "navy"}"></span><div><p><strong>${e(row.member_name)}</strong> ${row.returned_on ? "returned" : "borrowed"} <em>${e(row.title)}</em></p><small>${util.datefmt(row.returned_on || row.borrowed_on)} · ${e(row.accession_no)}</small></div></li>`).join("")}</ul>
  </section>
</div>`;
    return views.shell({ title: "Dashboard", breadcrumb: "Dashboard", active: "dashboard", content });
  };

  /* -------------------------------------------------- student dashboard */
  views.studentDashboard = function () {
    const member = data.currentMember();
    const activeLoans = query.loanRows({ memberId: member.id });
    const history = query.historyRows(member.id, 6);
    const recommendations = query.recommendationsForMember(member.id, 4);
    const allLoans = data.state.loans.filter((l) => l.member_id === member.id);
    const stats = {
      active: activeLoans.length,
      overdue: activeLoans.filter((l) => l.days_late > 0).length,
      due_soon: activeLoans.filter((l) => l.days_late >= -3 && l.days_late <= 0).length,
      total_loans: allLoans.length,
      books_read: new Set(allLoans.filter((l) => l.returned_on != null).map((l) => data.copy(l.copy_id).book_id)).size,
    };
    const settings = data.settings();
    const heroText = stats.overdue
      ? `You have ${util.plural(stats.overdue, "overdue item")}. Please return ${stats.overdue === 1 ? "it" : "them"} at the circulation desk.`
      : stats.due_soon
        ? `${util.plural(stats.due_soon, "item")} due soon. Plan your next visit.`
        : "Everything is on track. Your next due date is below.";

    const content = `<div class="page-head">
  <div><p class="eyebrow">Student portal</p><h1>Good day, ${e(member.name.split(" ")[0])}</h1><p class="page-sub">${e(member.course)} · Year ${member.year_level} · ${util.mid(member.id)}</p></div>
  <div class="page-actions"><a class="btn primary" href="${link("/catalog")}">${icon("search")} Browse the catalog</a></div>
</div>

<section class="student-hero">
  <div class="student-hero-copy">
    <p class="eyebrow light">Your reading desk</p>
    <h2>${util.plural(stats.active, "book")} in your hands</h2>
    <p>${e(heroText)}</p>
    <div class="student-hero-actions"><a class="btn light" href="${link("/my-loans")}">View my loans</a><a class="btn ghost-light" href="${link("/catalog")}">Find a book</a></div>
  </div>
  <div class="student-hero-stats"><div><strong>${stats.active}</strong><span>On loan</span></div><div><strong>${stats.books_read}</strong><span>Books read</span></div><div><strong>${stats.overdue}</strong><span>Overdue</span></div></div>
</section>

<div class="stat-grid three">
  <article class="stat-card"><div class="stat-top"><span class="stat-icon navy">${icon("clock")}</span><span class="stat-badge">THIS WEEK</span></div><p class="stat-label">Due soon</p><p class="stat-value">${stats.due_soon}</p><p class="stat-foot">Return within the next three days</p></article>
  <article class="stat-card"><div class="stat-top"><span class="stat-icon red">${icon("alert")}</span><span class="stat-badge ${stats.overdue ? "danger" : ""}">CHECK</span></div><p class="stat-label">Overdue</p><p class="stat-value">${stats.overdue}</p><p class="stat-foot">Items already past their due date</p></article>
  <article class="stat-card"><div class="stat-top"><span class="stat-icon green">${icon("book")}</span><span class="stat-badge">LIFETIME</span></div><p class="stat-label">Books borrowed</p><p class="stat-value">${stats.total_loans}</p><p class="stat-foot">${util.plural(stats.books_read, "different title")} read</p></article>
</div>

<div class="dashboard-grid">
  <section class="table-card">
    <header class="table-card-head"><div><h2>Currently borrowed</h2><p>Your open loans and return dates.</p></div><a class="link-light" href="${link("/my-loans")}">All my loans ${icon("arrow-right")}</a></header>
    ${activeLoans.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Book</th><th>Copy</th><th>Borrowed</th><th>Due</th><th>Status</th></tr></thead><tbody>${activeLoans.map((loan) => `<tr><td><div class="cell-title"><a href="${link("/catalog/" + loan.book_id)}">${e(loan.title)}</a><span>${e(loan.author)} · ${e(loan.category)}</span></div></td><td class="mono">${e(loan.accession_no)}</td><td class="nowrap">${util.datefmt(loan.borrowed_on)}</td><td class="nowrap">${util.datefmt(loan.due_on)}</td><td>${loanBadge(loan.days_late)}</td></tr>`).join("")}</tbody></table></div>` : emptyState("book", "No books out right now", "Browse the catalog and visit the desk to borrow your next read.", `<a class="btn primary" href="${link("/catalog")}">Browse the catalog</a>`)}
  </section>
  <aside class="stack">
    <section class="card announcement-card">
      <div class="card-head"><div><h2>Library notice</h2><p>${e(settings.academic_year)} · ${e(settings.semester)}</p></div>${icon("info")}</div>
      <p class="announcement-text">${e(settings.announcement)}</p>
      <div class="notice-meta"><span>${icon("clock")} Loan period: ${e(settings.default_loan_days)} days</span><span>${icon("book")} Fine: ${util.money(settings.fine_per_day)} per day</span></div>
    </section>
    <section class="card">
      <div class="card-head"><div><h2>Your reader profile</h2><p>Account details on file.</p></div></div>
      <dl class="detail-list"><div><dt>Member ID</dt><dd>${util.mid(member.id)}</dd></div><div><dt>Course</dt><dd>${e(member.course)}</dd></div><div><dt>Year level</dt><dd>Year ${member.year_level}</dd></div><div><dt>Username</dt><dd>${e(data.user.username)}</dd></div></dl>
      <a class="btn secondary block" href="${link("/settings")}">Open my profile</a>
    </section>
  </aside>
</div>

<section class="section-block">
  <div class="section-head"><div><h2>Recommended for you</h2><p>Based on the titles you currently share with other readers.</p></div><span class="badge navy">${icon("spark")} Live suggestion</span></div>
  ${recommendations.length ? `<div class="book-grid">${recommendations.map((book) => `<article class="book-card"><div class="book-card-top"><span class="tag">${e(book.category)}</span><span class="badge ${book.available ? "green" : "red"}">${book.available} available</span></div><h3><a href="${link("/catalog/" + book.id)}">${e(book.title)}</a></h3><p class="book-author">${e(book.author)}</p><p class="book-reason">${icon("spark")} ${e(book.reason)}</p><a class="btn small secondary" href="${link("/catalog/" + book.id)}">View book</a></article>`).join("")}</div>` : emptyState("book", "No suggestions yet", "Borrow a title and recommendations will appear here.")}
</section>

${history.length ? `<section class="card"><div class="card-head"><div><h2>Recently returned</h2><p>Your latest reading history.</p></div><a class="link-muted" href="${link("/my-loans")}">See all</a></div><div class="table-wrap"><table class="data-table compact"><thead><tr><th>Book</th><th>Copy</th><th>Borrowed</th><th>Returned</th></tr></thead><tbody>${history.map((row) => `<tr><td><div class="cell-title"><strong>${e(row.title)}</strong><span>${e(row.author)}</span></div></td><td class="mono">${e(row.accession_no)}</td><td class="nowrap">${util.datefmt(row.borrowed_on)}</td><td class="nowrap">${util.datefmt(row.returned_on)}</td></tr>`).join("")}</tbody></table></div></section>` : ""}`;
    return views.shell({ title: "Dashboard", breadcrumb: "Dashboard", active: "dashboard", content });
  };

  /* ------------------------------------------------------------ catalog */
  views.catalog = function (params = {}) {
    const search = params.q || "";
    const category = params.category || "";
    const availability = params.availability || "";
    const sort = params.sort || "title";
    const books = query.catalogRows({ search, category, availability, sort });
    const categories = [...new Set(data.state.books.map((b) => b.category))].sort();
    const isLib = data.user.role === "librarian";
    const options = (values) => values.map(([value, label, current]) => `<option value="${e(value)}"${selected(value, current)}>${e(label)}</option>`).join("");

    const content = `<div class="page-head">
  <div><p class="eyebrow">Collection</p><h1>Catalog</h1><p class="page-sub">Search every title, check availability, and manage copies.</p></div>
  ${isLib ? `<div class="page-actions"><button class="btn primary" type="button" data-action="open-dialog" data-dialog="add-book-dialog">${icon("plus")} Add book</button></div>` : ""}
</div>

<form class="toolbar" data-form="catalog-filter" role="search">
  <div class="search-field">${icon("search")}<input type="search" name="q" value="${e(search)}" placeholder="Search title, author, or ISBN…" autocomplete="off"></div>
  <select name="category" aria-label="Filter by category">${options([["", "All categories", category], ...categories.map((c) => [c, c, category])])}</select>
  <select name="availability" aria-label="Filter by availability">${options([["", "Any availability", availability], ["available", "Available now", availability], ["low", "Low stock", availability], ["unavailable", "All copies out", availability]])}</select>
  <select name="sort" aria-label="Sort results">${options([["title", "Title A–Z", sort], ["author", "Author A–Z", sort], ["newest", "Newest first", sort], ["available", "Most available", sort]])}</select>
  <button class="btn secondary" type="submit">${icon("filter")} Apply</button>
  ${search || category || availability || sort !== "title" ? `<a class="btn ghost" href="${link("/catalog")}">Clear</a>` : ""}
</form>

<div class="result-line"><span>${books.length} of ${data.state.books.length} titles</span>${search ? `<span class="muted">matching “${e(search)}”</span>` : ""}</div>

<section class="table-card">
  <header class="table-card-head"><div><h2>Collection</h2><p>Availability is calculated from the physical copies on record.</p></div><span class="count-pill">${books.length}</span></header>
  ${books.length ? `<div class="table-wrap"><table class="data-table">
    <thead><tr><th>Title</th><th>Category</th><th>ISBN</th><th>Copies</th><th>Status</th><th class="actions-col"></th></tr></thead>
    <tbody>${books.map((book) => `<tr>
      <td><div class="cell-title"><a href="${link("/catalog/" + book.id)}">${e(book.title)}</a><span>${e(book.author)}</span></div></td>
      <td><span class="tag">${e(book.category)}</span></td>
      <td class="mono small">${e(book.isbn)}</td>
      <td><div class="copies-cell"><span><strong>${book.available}</strong> of ${book.owned} available</span><div class="progress tiny"><span style="width: ${book.owned ? Math.round(book.available / book.owned * 100) : 0}%"></span></div></div></td>
      <td>${book.available === 0 ? `<span class="badge red">All out</span>` : book.available === 1 ? `<span class="badge amber">Low stock</span>` : `<span class="badge green">Available</span>`}</td>
      <td><div class="row-actions">
        <a class="icon-btn" href="${link("/catalog/" + book.id)}" title="View ${e(book.title)}">${icon("eye")}</a>
        ${isLib ? `<button class="icon-btn" type="button" title="Edit ${e(book.title)}" data-action="edit-book" data-id="${book.id}" data-title="${util.attr(book.title)}" data-author="${util.attr(book.author)}" data-isbn="${util.attr(book.isbn)}" data-category="${util.attr(book.category)}">${icon("edit")}</button>
        <button class="icon-btn danger" type="button" title="Remove ${e(book.title)}" data-action="delete-book" data-id="${book.id}" data-name="${util.attr(book.title)}">${icon("trash")}</button>` : ""}
      </div></td>
    </tr>`).join("")}</tbody>
  </table></div>` : emptyState("search", "No titles match those filters", "Try a different search term or clear the filters.", `<a class="btn secondary" href="${link("/catalog")}">Clear filters</a>`)}
</section>

${isLib ? `<dialog class="dialog" id="add-book-dialog" aria-labelledby="add-book-title">
  <form data-form="add-book">
    <header class="dialog-head"><div><p class="eyebrow">Catalog</p><h2 id="add-book-title">Add a new title</h2></div><button class="icon-btn" type="button" data-action="close-dialog" aria-label="Close">${icon("x")}</button></header>
    <div class="dialog-body">
      <div class="field"><label for="add-title">Title</label><input id="add-title" name="title" type="text" required placeholder="Book title"></div>
      <div class="field-row"><div class="field"><label for="add-author">Author</label><input id="add-author" name="author" type="text" required placeholder="Author name"></div><div class="field"><label for="add-isbn">ISBN</label><input id="add-isbn" name="isbn" type="text" required placeholder="9780000000000"></div></div>
      <div class="field-row"><div class="field"><label for="add-category">Category</label><input id="add-category" name="category" type="text" list="category-options" required placeholder="e.g. Databases"><datalist id="category-options">${categories.map((c) => `<option value="${e(c)}">`).join("")}</datalist></div><div class="field"><label for="add-copies">Copies</label><input id="add-copies" name="copies" type="number" min="1" max="20" value="2" required></div></div>
      <p class="form-note">Accession numbers are generated automatically for each new copy.</p>
    </div>
    <footer class="dialog-foot"><button class="btn secondary" type="button" data-action="close-dialog">Cancel</button><button class="btn primary" type="submit">${icon("plus")} Add book</button></footer>
  </form>
</dialog>
<dialog class="dialog" id="edit-book-dialog" aria-labelledby="edit-book-title">
  <form data-form="edit-book">
    <header class="dialog-head"><div><p class="eyebrow">Catalog</p><h2 id="edit-book-title">Edit title</h2></div><button class="icon-btn" type="button" data-action="close-dialog" aria-label="Close">${icon("x")}</button></header>
    <div class="dialog-body">
      <div class="field"><label for="edit-title">Title</label><input id="edit-title" name="title" type="text" required></div>
      <div class="field-row"><div class="field"><label for="edit-author">Author</label><input id="edit-author" name="author" type="text" required></div><div class="field"><label for="edit-isbn">ISBN</label><input id="edit-isbn" name="isbn" type="text" required></div></div>
      <div class="field"><label for="edit-category">Category</label><input id="edit-category" name="category" type="text" list="category-options" required></div>
    </div>
    <footer class="dialog-foot"><button class="btn secondary" type="button" data-action="close-dialog">Cancel</button><button class="btn primary" type="submit">${icon("check")} Save changes</button></footer>
  </form>
</dialog>` : ""}`;
    return views.shell({ title: "Catalog", breadcrumb: "Catalog", active: "catalog", content });
  };

  /* --------------------------------------------------------- book detail */
  views.bookDetail = function (bookId) {
    const detail = query.bookDetail(bookId);
    if (!detail) return views.notFound();
    const { book, copies, history, related } = detail;
    const isLib = data.user.role === "librarian";
    const badge = book.available === 0 ? `<span class="badge red">All copies out</span>` : book.available === 1 ? `<span class="badge amber">Low stock</span>` : `<span class="badge green">Available</span>`;

    const content = `<div class="page-head">
  <div><a class="back-link" href="${link("/catalog")}">${icon("arrow-left")} Back to catalog</a><h1>${e(book.title)}</h1><p class="page-sub">${e(book.author)} · ${e(book.category)} · ISBN ${e(book.isbn)}</p></div>
  ${isLib ? `<div class="page-actions">${detail.available_copy_id ? `<a class="btn primary" href="${link("/circulation?copy=" + detail.available_copy_id)}">${icon("circulation")} Issue a copy</a>` : ""}<a class="btn secondary" href="${link("/catalog?edit=" + book.id)}">${icon("edit")} Edit in catalog</a></div>` : ""}
</div>

<div class="detail-grid">
  <section class="card book-summary-card">
    <div class="book-cover" aria-hidden="true"><span>${e(book.title.slice(0, 1))}</span>${icon("book")}</div>
    <div class="book-summary-copy">
      <div class="book-summary-head"><span class="tag">${e(book.category)}</span>${badge}</div>
      <h2>${e(book.title)}</h2><p class="book-author">${e(book.author)}</p>
      <dl class="detail-list"><div><dt>ISBN</dt><dd class="mono">${e(book.isbn)}</dd></div><div><dt>Catalog ID</dt><dd class="mono">${util.bid(book.id)}</dd></div><div><dt>Total copies</dt><dd>${book.owned}</dd></div><div><dt>Available now</dt><dd>${book.available}</dd></div></dl>
    </div>
  </section>
  <aside class="stack">
    <section class="card">
      <div class="card-head"><div><h2>Availability</h2><p>Shows which copies are free right now.</p></div><span class="badge navy">${book.available}/${book.owned}</span></div>
      <div class="set-line" aria-label="Availability calculation"><span>${detail.owned_labels.length} owned</span><span class="set-op">−</span><span>${detail.on_loan_labels.length} on loan</span><span class="set-op">=</span><strong>${detail.available_labels.length} available</strong></div>
      <div class="copy-groups">
        <div><h3 class="minor-title">On the shelf</h3><div class="chip-row">${detail.available_labels.length ? detail.available_labels.map((label) => `<span class="chip green mono">${e(label)}</span>`).join("") : `<span class="muted small">No copies free</span>`}</div></div>
        <div><h3 class="minor-title">On loan</h3><div class="chip-row">${detail.on_loan_labels.length ? detail.on_loan_labels.map((label) => `<span class="chip amber mono">${e(label)}</span>`).join("") : `<span class="muted small">All copies are on the shelf</span>`}</div></div>
      </div>
    </section>
    ${isLib ? `<section class="card"><div class="card-head"><div><h2>Add copies</h2><p>Grow this title's stock.</p></div></div><form class="inline-form" data-form="add-copies" data-id="${book.id}"><div class="field grow"><label for="add-copies-count">Number of copies</label><input id="add-copies-count" name="copies" type="number" min="1" max="20" value="1" required></div><button class="btn secondary" type="submit">${icon("plus")} Add</button></form></section>` : ""}
  </aside>
</div>

<section class="table-card">
  <header class="table-card-head"><div><h2>Copies</h2><p>Every physical copy and its current borrower.</p></div><span class="count-pill">${copies.length}</span></header>
  <div class="table-wrap"><table class="data-table"><thead><tr><th>Accession</th><th>Status</th><th>Borrower</th><th>Due</th><th class="actions-col"></th></tr></thead><tbody>${copies.map((copy) => `<tr><td class="mono">${e(copy.accession_no)}</td><td>${copy.status === "available" ? `<span class="badge green">Available</span>` : `<span class="badge amber">On loan</span>`}</td><td>${e(copy.borrower || "None")}</td><td class="nowrap">${copy.due_on ? `${util.datefmt(copy.due_on)} ${loanBadge(copy.days_late)}` : "None"}</td><td>${isLib && copy.status === "available" ? `<a class="btn small secondary" href="${link("/circulation?copy=" + copy.id)}">Issue</a>` : ""}</td></tr>`).join("")}</tbody></table></div>
</section>

<div class="dashboard-grid two">
  <section class="card">
    <div class="card-head"><div><h2>Readers also borrowed</h2><p>Titles connected through shared borrowers.</p></div>${icon("spark")}</div>
    ${related.length ? `<div class="related-list">${related.map((item) => `<a class="related-row" href="${link("/catalog/" + item.id)}"><span class="related-mark">${e(item.title.slice(0, 1))}</span><span class="related-text"><strong>${e(item.title)}</strong><small>${e(item.author)} · ${e(item.category)}</small></span><span class="badge ${item.available ? "green" : "red"}">${item.available} free</span></a>`).join("")}</div>` : `<div class="mini-empty">${icon("book")}<p>No connected titles yet.</p></div>`}
  </section>
  <section class="table-card">
    <header class="table-card-head"><div><h2>Loan history</h2><p>The latest ten records for this title.</p></div></header>
    ${history.length ? `<div class="table-wrap"><table class="data-table compact"><thead><tr><th>Member</th><th>Copy</th><th>Borrowed</th><th>Returned</th></tr></thead><tbody>${history.map((row) => `<tr><td>${e(row.member_name)}</td><td class="mono">${e(row.accession_no)}</td><td class="nowrap">${util.datefmt(row.borrowed_on)}</td><td class="nowrap">${row.returned_on ? util.datefmt(row.returned_on) : "Not returned"}</td></tr>`).join("")}</tbody></table></div>` : `<div class="mini-empty">${icon("clock")}<p>No loan records yet.</p></div>`}
  </section>
</div>`;
    return views.shell({ title: book.title, breadcrumb: "Catalog / " + book.title, active: "catalog", content });
  };

  /* ------------------------------------------------------------ members */
  views.members = function (params = {}) {
    const search = params.q || "";
    const course = params.course || "";
    const yearLevel = params.year || 0;
    const status = params.status || "all";
    const rows = query.memberRows({ search, course, yearLevel, status });
    const courses = [...new Set(data.state.members.map((m) => m.course))].sort();
    const options = (values) => values.map(([value, label, current]) => `<option value="${e(value)}"${selected(value, current)}>${e(label)}</option>`).join("");
    const withLoans = rows.filter((m) => m.active_loans > 0).length;
    const withOverdue = rows.filter((m) => m.overdue > 0).length;

    const content = `<div class="page-head">
  <div><p class="eyebrow">People</p><h1>Members</h1><p class="page-sub">Students and staff who can borrow from the library.</p></div>
  <div class="page-actions"><button class="btn primary" type="button" data-action="open-dialog" data-dialog="add-member-dialog">${icon("plus")} Add member</button></div>
</div>

<div class="stat-grid three">
  <article class="mini-stat"><span class="stat-icon navy">${icon("users")}</span><div><strong>${data.state.members.length}</strong><span>Total members</span></div></article>
  <article class="mini-stat"><span class="stat-icon green">${icon("bookmark")}</span><div><strong>${withLoans}</strong><span>With open loans in this view</span></div></article>
  <article class="mini-stat"><span class="stat-icon red">${icon("alert")}</span><div><strong>${withOverdue}</strong><span>With overdue items in this view</span></div></article>
</div>

<form class="toolbar" data-form="member-filter" role="search">
  <div class="search-field">${icon("search")}<input type="search" name="q" value="${e(search)}" placeholder="Search name or course…" autocomplete="off"></div>
  <select name="course" aria-label="Filter by course">${options([["", "All courses", course], ...courses.map((c) => [c, c, course])])}</select>
  <select name="year" aria-label="Filter by year level">${options([["", "All years", yearLevel], [1, "Year 1", yearLevel], [2, "Year 2", yearLevel], [3, "Year 3", yearLevel], [4, "Year 4", yearLevel]])}</select>
  <select name="status" aria-label="Filter by loan status">${options([["all", "Any status", status], ["active", "Has open loans", status], ["overdue", "Overdue", status], ["none", "No open loans", status]])}</select>
  <button class="btn secondary" type="submit">${icon("filter")} Apply</button>
  ${search || course || yearLevel || status !== "all" ? `<a class="btn ghost" href="${link("/members")}">Clear</a>` : ""}
</form>

<section class="table-card">
  <header class="table-card-head"><div><h2>Member directory</h2><p>Open a member to see their loans and reading profile.</p></div><span class="count-pill">${rows.length}</span></header>
  ${rows.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Member</th><th>Course</th><th>Year</th><th>Open loans</th><th>Status</th><th class="actions-col"></th></tr></thead><tbody>${rows.map((m) => `<tr>
    <td><a class="cell-person" href="${link("/members/" + m.id)}">${avatar(m.name)}<span><strong>${e(m.name)}</strong><small>${util.mid(m.id)} · ${util.plural(m.total_loans, "lifetime loan")}</small></span></a></td>
    <td>${e(m.course)}</td><td>Year ${m.year_level}</td>
    <td><span class="badge ${m.active_loans ? "amber" : "grey"}">${m.active_loans} open</span>${m.overdue ? `<span class="badge red">${m.overdue} overdue</span>` : ""}</td>
    <td>${m.overdue ? `<span class="badge red">Needs attention</span>` : m.active_loans ? `<span class="badge green">Borrowing</span>` : `<span class="badge grey">Clear</span>`}</td>
    <td><div class="row-actions"><a class="icon-btn" href="${link("/members/" + m.id)}" title="View ${e(m.name)}">${icon("eye")}</a><button class="icon-btn" type="button" title="Edit ${e(m.name)}" data-action="edit-member" data-id="${m.id}" data-name="${util.attr(m.name)}" data-course="${util.attr(m.course)}" data-year="${m.year_level}">${icon("edit")}</button><button class="icon-btn danger" type="button" title="Remove ${e(m.name)}" data-action="delete-member" data-id="${m.id}" data-name="${util.attr(m.name)}">${icon("trash")}</button></div></td>
  </tr>`).join("")}</tbody></table></div>` : emptyState("users", "No members match those filters", "Try another search or clear the filters.", `<a class="btn secondary" href="${link("/members")}">Clear filters</a>`)}
</section>

<dialog class="dialog" id="add-member-dialog" aria-labelledby="add-member-title">
  <form data-form="add-member">
    <header class="dialog-head"><div><p class="eyebrow">Members</p><h2 id="add-member-title">Add a member</h2></div><button class="icon-btn" type="button" data-action="close-dialog" aria-label="Close">${icon("x")}</button></header>
    <div class="dialog-body">
      <div class="field"><label for="add-name">Full name</label><input id="add-name" name="name" type="text" required placeholder="e.g. Maria Santos"></div>
      <div class="field-row"><div class="field"><label for="add-course">Course</label><input id="add-course" name="course" type="text" list="course-options" required placeholder="e.g. BS Computer Science"><datalist id="course-options">${courses.map((c) => `<option value="${e(c)}">`).join("")}</datalist></div><div class="field"><label for="add-year">Year level</label><select id="add-year" name="year_level" required>${[1, 2, 3, 4].map((y) => `<option value="${y}">Year ${y}</option>`).join("")}</select></div></div>
    </div>
    <footer class="dialog-foot"><button class="btn secondary" type="button" data-action="close-dialog">Cancel</button><button class="btn primary" type="submit">${icon("plus")} Add member</button></footer>
  </form>
</dialog>
<dialog class="dialog" id="edit-member-dialog" aria-labelledby="edit-member-title">
  <form data-form="edit-member">
    <header class="dialog-head"><div><p class="eyebrow">Members</p><h2 id="edit-member-title">Edit member</h2></div><button class="icon-btn" type="button" data-action="close-dialog" aria-label="Close">${icon("x")}</button></header>
    <div class="dialog-body">
      <div class="field"><label for="edit-name">Full name</label><input id="edit-name" name="name" type="text" required></div>
      <div class="field-row"><div class="field"><label for="edit-course">Course</label><input id="edit-course" name="course" type="text" list="course-options" required></div><div class="field"><label for="edit-year">Year level</label><select id="edit-year" name="year_level" required>${[1, 2, 3, 4].map((y) => `<option value="${y}">Year ${y}</option>`).join("")}</select></div></div>
    </div>
    <footer class="dialog-foot"><button class="btn secondary" type="button" data-action="close-dialog">Cancel</button><button class="btn primary" type="submit">${icon("check")} Save changes</button></footer>
  </form>
</dialog>`;
    return views.shell({ title: "Members", breadcrumb: "Members", active: "members", content });
  };

  /* ------------------------------------------------------ member detail */
  views.memberDetail = function (memberId) {
    const detail = query.memberDetail(memberId);
    if (!detail) return views.notFound();
    const { member, active_loans, history, recommendations, totals, eligible, eligible_count, product_count, account } = detail;
    const content = `<div class="page-head">
  <div><a class="back-link" href="${link("/members")}">${icon("arrow-left")} Back to members</a><h1>${e(member.name)}</h1><p class="page-sub">${e(member.course)} · Year ${member.year_level} · ${util.mid(member.id)}</p></div>
  <div class="page-actions"><a class="btn primary" href="${link("/circulation?member=" + member.id)}">${icon("circulation")} Issue a loan</a></div>
</div>

<div class="profile-grid">
  <section class="card profile-card">
    <div class="profile-head">${avatar(member.name, "large")}<div><h2>${e(member.name)}</h2><p>${e(member.course)}</p><div class="profile-badges"><span class="badge navy">Year ${member.year_level}</span>${account ? `<span class="badge green">Portal account</span>` : ""}${detail.overdue ? `<span class="badge red">${detail.overdue} overdue</span>` : ""}</div></div></div>
    <dl class="detail-list"><div><dt>Member ID</dt><dd>${util.mid(member.id)}</dd></div><div><dt>Course</dt><dd>${e(member.course)}</dd></div><div><dt>Year level</dt><dd>Year ${member.year_level}</dd></div><div><dt>Open loans</dt><dd>${active_loans.length}</dd></div><div><dt>Lifetime loans</dt><dd>${totals.total_loans}</dd></div><div><dt>Titles read</dt><dd>${totals.books_read}</dd></div></dl>
  </section>
  <section class="table-card">
    <header class="table-card-head"><div><h2>Open loans</h2><p>Items currently with this member.</p></div><span class="count-pill">${active_loans.length}</span></header>
    ${active_loans.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Book</th><th>Copy</th><th>Borrowed</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>${active_loans.map((loan) => `<tr><td><div class="cell-title"><a href="${link("/catalog/" + loan.book_id)}">${e(loan.title)}</a><span>${e(loan.author)}</span></div></td><td class="mono">${e(loan.accession_no)}</td><td class="nowrap">${util.datefmt(loan.borrowed_on)}</td><td class="nowrap">${util.datefmt(loan.due_on)}</td><td>${loanBadge(loan.days_late)}</td><td><button class="btn small secondary" type="button" data-action="return" data-loan="${loan.id}">Return</button></td></tr>`).join("")}</tbody></table></div>` : emptyState("check", "No open loans", "This member has returned everything.")}
  </section>
</div>

<section class="section-block">
  <div class="section-head"><div><h2>Ready to borrow</h2><p>${eligible_count} titles can be issued to this member right now. The full member × title list is filtered by titles already held and copies currently free.</p></div><span class="badge navy">${eligible_count} of ${product_count} pairs</span></div>
  ${eligible.length ? `<div class="book-grid compact-grid">${eligible.map((pair) => `<article class="book-card"><span class="tag">Eligible</span><h3><a href="${link("/catalog/" + pair[2])}">${e(pair[3])}</a></h3><p class="book-reason">${icon("check")} Not currently held by ${e(member.name.split(" ")[0])}</p><a class="btn small secondary" href="${link("/circulation?member=" + member.id + "&book=" + pair[2])}">Issue this title</a></article>`).join("")}</div>` : emptyState("book", "No titles available to this member", "Either every title is already held or no copy is free.")}
</section>

<div class="dashboard-grid two">
  <section class="card">
    <div class="card-head"><div><h2>Recommendations</h2><p>Books held by readers who share this member's titles.</p></div>${icon("spark")}</div>
    ${recommendations.length ? `<div class="related-list">${recommendations.map((book) => `<a class="related-row" href="${link("/catalog/" + book.id)}"><span class="related-mark">${e(book.title.slice(0, 1))}</span><span class="related-text"><strong>${e(book.title)}</strong><small>${e(book.author)} · ${e(book.category)}</small></span><span class="badge ${book.available ? "green" : "red"}">${book.available} free</span></a>`).join("")}</div>` : `<div class="mini-empty">${icon("book")}<p>No recommendations yet.</p></div>`}
  </section>
  <section class="table-card">
    <header class="table-card-head"><div><h2>Return history</h2><p>The last ten completed loans.</p></div></header>
    ${history.length ? `<div class="table-wrap"><table class="data-table compact"><thead><tr><th>Book</th><th>Copy</th><th>Borrowed</th><th>Returned</th></tr></thead><tbody>${history.map((row) => `<tr><td>${e(row.title)}</td><td class="mono">${e(row.accession_no)}</td><td class="nowrap">${util.datefmt(row.borrowed_on)}</td><td class="nowrap">${util.datefmt(row.returned_on)}</td></tr>`).join("")}</tbody></table></div>` : `<div class="mini-empty">${icon("clock")}<p>No returned loans yet.</p></div>`}
  </section>
</div>`;
    return views.shell({ title: member.name, breadcrumb: "Members / " + member.name, active: "members", content });
  };

  /* --------------------------------------------------------- circulation */
  views.circulation = function (params = {}) {
    const search = params.q || "";
    const status = params.status || "all";
    const selectedMember = params.member ? Number(params.member) : null;
    const selectedCopy = params.copy ? Number(params.copy) : null;
    const requestedBook = params.book ? Number(params.book) : null;
    const members = [...data.state.members].sort((a, b) => a.name.localeCompare(b.name));
    const availableCopies = data.state.copies.filter((c) => c.status === "available")
      .sort((a, b) => data.book(a.book_id).title.localeCompare(data.book(b.book_id).title) || a.accession_no.localeCompare(b.accession_no));
    const byTitle = new Map();
    for (const copy of availableCopies) {
      const title = data.book(copy.book_id).title;
      if (!byTitle.has(title)) byTitle.set(title, []);
      byTitle.get(title).push(copy);
    }
    let chosenCopy = selectedCopy && availableCopies.some((c) => c.id === selectedCopy) ? selectedCopy : null;
    if (!chosenCopy && requestedBook != null) {
      const found = availableCopies.find((c) => c.book_id === requestedBook);
      if (found) chosenCopy = found.id;
    }
    const loans = query.loanRows({ search, status });
    const stats = {
      active: data.state.loans.filter((l) => l.returned_on == null).length,
      overdue: query.loanRows({ status: "overdue" }).length,
      due_today: query.loanRows().filter((l) => l.days_late === 0).length,
      available: availableCopies.length,
    };
    const settings = data.settings();

    const content = `<div class="page-head">
  <div><p class="eyebrow">Front desk</p><h1>Circulation</h1><p class="page-sub">Issue a copy, take a return, and keep an eye on due dates.</p></div>
  <div class="page-actions"><a class="btn secondary" href="${link("/members")}">${icon("users")} Members</a></div>
</div>

<div class="mini-stat-grid">
  <article class="mini-stat"><span class="stat-icon navy">${icon("bookmark")}</span><div><strong>${stats.active}</strong><span>Open loans</span></div></article>
  <article class="mini-stat"><span class="stat-icon red">${icon("alert")}</span><div><strong>${stats.overdue}</strong><span>Overdue</span></div></article>
  <article class="mini-stat"><span class="stat-icon amber">${icon("clock")}</span><div><strong>${stats.due_today}</strong><span>Due today</span></div></article>
  <article class="mini-stat"><span class="stat-icon green">${icon("check")}</span><div><strong>${stats.available}</strong><span>Copies on the shelf</span></div></article>
</div>

<div class="circulation-grid">
  <section class="card issue-card">
    <div class="card-head"><div><h2>Issue a loan</h2><p>Pick a member and an available copy.</p></div><span class="badge navy">${byTitle.size} titles free</span></div>
    <form class="stack-form" data-form="borrow">
      <div class="field"><label for="member_id">Member</label><select id="member_id" name="member_id" required><option value="">Choose a member…</option>${members.map((m) => `<option value="${m.id}"${selectedMember === m.id ? " selected" : ""}>${util.mid(m.id)} · ${e(m.name)} · ${e(m.course)}</option>`).join("")}</select></div>
      <div class="field"><label for="copy_id">Available copy</label><select id="copy_id" name="copy_id"><option value="">Choose a copy…</option>${[...byTitle].map(([title, list]) => `<optgroup label="${e(title)}">${list.map((copy) => `<option value="${copy.id}"${chosenCopy === copy.id ? " selected" : ""}>${e(copy.accession_no)} · ${e(data.book(copy.book_id).category)}</option>`).join("")}</optgroup>`).join("")}</select></div>
      <div class="field-row"><div class="field"><label for="days">Loan length</label><select id="days" name="days">${math.LOAN_LENGTH_DAYS.map((length) => `<option value="${length}"${length === Number(settings.default_loan_days) ? " selected" : ""}>${length} days</option>`).join("")}</select></div><div class="field grow"><label for="accession_no">Or scan accession</label><input id="accession_no" name="accession_no" type="text" placeholder="A0001" autocomplete="off" spellcheck="false"></div></div>
      <button class="btn primary block" type="submit">${icon("circulation")} Issue loan</button>
      <p class="form-note">A member cannot hold two copies of the same title. The desk checks availability and the duplicate-title rule before writing the loan.</p>
    </form>
  </section>
  <section class="table-card circulation-table">
    <header class="table-card-head"><div><h2>Open loans</h2><p>Everything currently checked out.</p></div><span class="count-pill">${loans.length}</span></header>
    <form class="table-toolbar" data-form="circulation-filter" role="search">
      <div class="search-field">${icon("search")}<input type="search" name="q" value="${e(search)}" placeholder="Member, book, or accession…" autocomplete="off"></div>
      <select name="status" aria-label="Filter loan status">${[["all", "All open loans"], ["overdue", "Overdue"], ["due_soon", "Due within 3 days"], ["current", "Not overdue"]].map(([value, label]) => `<option value="${value}"${selected(value, status)}>${label}</option>`).join("")}</select>
      <button class="btn small secondary" type="submit">Filter</button>
    </form>
    ${loans.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Member</th><th>Book</th><th>Due</th><th class="actions-col"></th></tr></thead><tbody>${loans.map((loan) => `<tr><td><a class="cell-person" href="${link("/members/" + loan.member_id)}">${avatar(loan.member_name)}<span><strong>${e(loan.member_name)}</strong><small>${util.mid(loan.member_id)}</small></span></a></td><td><div class="cell-title"><a href="${link("/catalog/" + loan.book_id)}">${e(loan.title)}</a><span>${e(loan.accession_no)} · ${e(loan.author)}</span></div></td><td><div class="due-cell"><strong>${util.datefmt(loan.due_on)}</strong><span>Borrowed ${util.datefmt(loan.borrowed_on)}</span>${loanBadge(loan.days_late)}</div></td><td><button class="btn small secondary" type="button" data-action="return" data-loan="${loan.id}">Return</button></td></tr>`).join("")}</tbody></table></div>` : emptyState("check", "No loans match this view", "Try clearing the search or status filter.", `<a class="btn secondary" href="${link("/circulation")}">Show all loans</a>`)}
  </section>
</div>`;
    return views.shell({ title: "Circulation", breadcrumb: "Circulation", active: "circulation", content });
  };

  /* ------------------------------------------------------------ insights */
  views.insights = function () {
    const relation = math.borrowRelation();
    const co = math.coBorrowRelation(relation);
    const properties = math.relationProperties(co.matrix, co.member_ids);
    const product = math.productRule();
    const shortage = math.shortageCases();
    const closure = math.authorTransitiveClosure();
    const copyFunction = math.copyToBook();
    const memberFunction = math.memberToActiveLoans();
    const names = new Map(relation.members.map((m) => [m.id, m.name]));
    const titles = new Map(relation.books.map((b) => [b.id, b.title]));
    const titlesByMember = new Map();
    for (const [memberId, bookId] of relation.pairs) {
      if (!titlesByMember.has(memberId)) titlesByMember.set(memberId, new Set());
      titlesByMember.get(memberId).add(bookId);
    }
    const commonTitles = (a, b) => [...(titlesByMember.get(a) || new Set())]
      .filter((id) => (titlesByMember.get(b) || new Set()).has(id))
      .sort((x, y) => x - y).map((id) => titles.get(id));
    let witness = null;
    if (properties.transitive_witness) {
      const [a, b, c] = properties.transitive_witness;
      witness = { a, b, c, ab: commonTitles(a, b), bc: commonTitles(b, c), ac: commonTitles(a, c) };
    }
    const topReaders = relation.members.map((m, index) => ({
      id: m.id, name: m.name,
      connections: co.matrix[index].reduce((sum, value, other) => sum + (other !== index && value ? 1 : 0), 0),
    })).sort((a, b) => b.connections - a.connections || a.name.localeCompare(b.name));
    const popular = query.popularBooks(5);
    const prop = (name, label, description, pass, extra) => `<div class="property"><span class="prop-icon ${pass ? "pass" : "fail"}">${icon(pass ? "check" : "x")}</span><div><strong>${label}</strong><span>${description}</span>${extra || ""}</div><span class="badge ${pass ? "green" : "red"}">${pass ? "Pass" : "Fail"}</span></div>`;

    const content = `<div class="page-head">
  <div><p class="eyebrow">Live analytics</p><h1>Insights</h1><p class="page-sub">Borrowing records from the desk, shown as collection signals.</p></div>
  <div class="page-actions"><a class="btn secondary" href="${link("/reports")}">${icon("report")} Open reports</a></div>
</div>

<div class="mini-stat-grid">
  <article class="mini-stat"><span class="stat-icon navy">${icon("chart")}</span><div><strong>${relation.ones}</strong><span>Active member–title pairs</span></div></article>
  <article class="mini-stat"><span class="stat-icon red">${icon("alert")}</span><div><strong>${shortage.total_cases}</strong><span>Titles with more demand than free copies</span></div></article>
  <article class="mini-stat"><span class="stat-icon green">${icon("spark")}</span><div><strong>${co.off_diagonal_ones}</strong><span>Reader connections through shared titles</span></div></article>
  <article class="mini-stat"><span class="stat-icon amber">${icon("circulation")}</span><div><strong>${product.count}</strong><span>Copy + loan-length combinations</span></div></article>
</div>

<div class="insight-grid">
  <section class="card matrix-card">
    <div class="card-head"><div><h2>Borrowing relation</h2><p>One dot per member and title. A filled dot is an active loan.</p></div><span class="badge navy">${relation.ones} of ${relation.members.length * relation.books.length}</span></div>
    <div class="matrix-legend"><span class="matrix-key"><i class="dot navy"></i> Active loan</span><span>Rows: ${relation.members.length} members</span><span>Columns: ${relation.books.length} titles</span></div>
    <div class="matrix-wrap"><div class="matrix" style="--cols: ${relation.books.length}">${relation.matrix.map((row, i) => `<span class="matrix-row-label" title="${e(relation.members[i].name)}">${util.mid(relation.members[i].id)}</span>${row.map((value, j) => `<span class="matrix-cell ${value ? "on" : ""}" title="${e(relation.members[i].name)} · ${e(relation.books[j].title)}"></span>`).join("")}`).join("")}</div></div>
    <div class="matrix-foot"><span>${relation.domain.length} members currently borrowing</span><span>${relation.range.length} titles currently out</span></div>
  </section>

  <section class="card">
    <div class="card-head"><div><h2>Reader connections</h2><p>Two readers are linked when they hold a copy of the same title.</p></div></div>
    <div class="property-list">
      ${prop("reflexive", "Reflexive", "Every reader shares at least one title with themselves.", properties.reflexive)}
      ${prop("symmetric", "Symmetric", "If A shares a title with B, B shares one with A.", properties.symmetric)}
      ${prop("transitive", "Transitive", "Shared titles do not always chain to a third reader.", properties.transitive, witness ? `<small class="property-witness">${e(names.get(witness.a))} → ${e(names.get(witness.b))} → ${e(names.get(witness.c))}, but ${e(names.get(witness.a))} and ${e(names.get(witness.c))} share no active title.</small>` : "")}
    </div>
    <p class="form-note">${co.ones} ordered pairs in the reader relation, ${co.off_diagonal_ones} between different readers.</p>
    <div class="divider"></div><h3 class="minor-title">Most connected readers</h3>
    <div class="reader-list">${topReaders.slice(0, 5).map((reader) => `<a class="reader-row" href="${link("/members/" + reader.id)}">${avatar(reader.name)}<span class="reader-text"><strong>${e(reader.name)}</strong><small>${util.plural(reader.connections, "shared reader")}</small></span><span class="badge navy">${reader.connections}</span></a>`).join("")}</div>
  </section>

  <section class="card">
    <div class="card-head"><div><h2>Demand vs free copies</h2><p>Titles with more past borrowers than available copies today.</p></div><span class="badge red">${shortage.total_shortfall} short</span></div>
    ${shortage.cases.length ? `<div class="table-wrap"><table class="data-table compact"><thead><tr><th>Title</th><th>Demand</th><th>Free</th><th>Gap</th></tr></thead><tbody>${shortage.cases.slice(0, 7).map((c) => `<tr><td><div class="cell-title"><a href="${link("/catalog/" + c.book_id)}">${e(c.title)}</a><span>${e(c.expression)}</span></div></td><td>${c.demand}</td><td>${c.available}</td><td><span class="badge red">−${c.shortfall}</span></td></tr>`).join("")}</tbody></table></div>` : `<div class="mini-empty">${icon("check")}<p>No title is short of copies.</p></div>`}
  </section>

  <section class="card">
    <div class="card-head"><div><h2>Loan state space</h2><p>Each loan combines one copy with one allowed loan length.</p></div></div>
    <div class="formula-card"><span>${product.copy_count}</span><em>×</em><span>${product.length_count}</span><em>=</em><strong>${product.count}</strong></div>
    <p class="formula-caption">${product.copy_count} copies × ${product.length_count} loan lengths (${product.loan_lengths.join(", ")} days).</p>
    <div class="divider"></div><h3 class="minor-title">Most borrowed</h3>
    <ol class="rank-list compact-rank">${popular.map((book, index) => `<li><span class="rank">${index + 1}</span><a class="rank-title" href="${link("/catalog/" + book.id)}"><strong>${e(book.title)}</strong><small>${e(book.author)}</small></a><span class="rank-meta"><strong>${book.loans}</strong><small>loans</small></span></li>`).join("")}</ol>
  </section>

  <section class="card insight-wide">
    <div class="card-head"><div><h2>Data model checks</h2><p>Two mappings the catalog and circulation rely on, recomputed live.</p></div><span class="badge navy">Live</span></div>
    <div class="model-grid">
      <div class="model-card"><span>Copies → titles</span><strong>${copyFunction.domain_size} → ${copyFunction.range_size}</strong><small>${copyFunction.classification[0].toUpperCase() + copyFunction.classification.slice(1)}. Every copy has exactly one title; several copies can share the same title.</small></div>
      <div class="model-card"><span>Members → active loans</span><strong>${memberFunction.domain_size} → ${memberFunction.range_size}</strong><small>${memberFunction.classification[0].toUpperCase() + memberFunction.classification.slice(1)}. Each member maps to a set of active loan ids on this data.</small></div>
    </div>
  </section>

  <section class="card insight-wide">
    <div class="card-head"><div><h2>Author network</h2><p>Authors connected through the reading history of individual members.</p></div><span class="badge navy">${closure.new_pair_count} new links</span></div>
    <div class="author-grid"><div>
      <p class="author-stat"><strong>${closure.author_count}</strong> authors in the catalog</p>
      <p class="author-stat"><strong>${closure.original_ones}</strong> direct co-borrow links</p>
      <p class="author-stat"><strong>${closure.closure_ones}</strong> links after transitive closure</p>
      <p class="form-note">Transitive closure adds pairs connected by a chain, including authors with no direct co-borrow link.</p>
    </div><div class="author-links">${closure.new_pairs.slice(0, 8).map((pair) => `<span class="chip navy">${e(pair.a)} ↔ ${e(pair.b)}</span>`).join("") || `<span class="muted small">No new author links.</span>`}</div></div>
  </section>
</div>`;
    return views.shell({ title: "Insights", breadcrumb: "Insights", active: "insights", content });
  };

  /* ------------------------------------------------------------ reports */
  views.reports = function () {
    const reports = LD.reports.renderAll();
    const fine = Number(data.settings().fine_per_day);
    const content = `<div class="page-head print-hide">
  <div><p class="eyebrow">Records</p><h1>Reports</h1><p class="page-sub">Five live views of circulation, demand, and overdue work.</p></div>
  <div class="page-actions"><button class="btn secondary" type="button" data-action="print">${icon("print")} Print</button></div>
</div>
<div class="report-stack">${reports.map((report) => `<section class="table-card report-card">
  <header class="table-card-head"><div><div class="report-title-row"><span class="report-number">${report.number}</span><h2>${e(report.title)}</h2><span class="badge navy">${report.row_count} ${report.row_count === 1 ? "row" : "rows"}</span></div><p>${e(report.note)}</p></div><div class="report-actions print-hide"><button class="btn small secondary" type="button" data-action="export-csv" data-report="${report.number}">${icon("download")} CSV</button></div></header>
  ${report.summary_rows.length ? `<div class="summary-strip">${report.summary_rows.map((row) => `${Object.entries(row).map(([key, value]) => `<span class="summary-pill"><small>${e(report.summary_labels && report.summary_labels[key] ? report.summary_labels[key] : key)}</small><strong>${value == null ? 0 : value}</strong></span>`).join("")}${report.number === "03" ? `<span class="summary-pill"><small>Estimated fines</small><strong>${util.money(row.total_days_late * fine)}</strong></span>` : ""}`).join("")}</div>` : ""}
  ${report.rows.length ? `<div class="table-wrap"><table class="data-table report-table"><thead><tr>${report.columns.map((col) => `<th>${e(col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))}</th>`).join("")}</tr></thead><tbody>${report.rows.map((row) => `<tr>${report.columns.map((col) => `<td class="${["book_id", "loan_id", "member_id"].includes(col) ? "mono" : ""}">${e(row[col] == null ? "None" : row[col])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : emptyState("check", "No rows for this report", "The current data does not trigger this view.")}
  <details class="sql-box print-hide"><summary>${icon("report")} View SQL query</summary><pre><code>${e(report.sql)}</code></pre></details>
</section>`).join("")}</div>`;
    return views.shell({ title: "Reports", breadcrumb: "Reports", active: "reports", content });
  };

  /* ------------------------------------------------------------ settings */
  views.settings = function () {
    const isLib = data.user.role === "librarian";
    const settings = data.settings();
    const member = data.currentMember();
    const account = data.user;
    const systemCounts = {
      books: data.state.books.length, copies: data.state.copies.length,
      members: data.state.members.length, loans: data.state.loans.length,
    };
    const memberStats = member ? {
      total_loans: data.state.loans.filter((l) => l.member_id === member.id).length,
      active_loans: data.state.loans.filter((l) => l.member_id === member.id && l.returned_on == null).length,
    } : null;

    const content = `<div class="page-head">
  <div><p class="eyebrow">${isLib ? "System" : "Account"}</p><h1>${isLib ? "Library settings" : "My profile"}</h1><p class="page-sub">${isLib ? "Defaults for the desk, the current term, and your account." : "Your library account and password."}</p></div>
</div>

<div class="settings-grid">
  <div class="stack">
    ${isLib ? `<section class="card">
      <div class="card-head"><div><h2>Library defaults</h2><p>Used by the circulation desk and shown across the app.</p></div><span class="badge navy">${e(settings.academic_year)}</span></div>
      <form class="stack-form" data-form="save-settings">
        <div class="field"><label for="library_name">Library name</label><input id="library_name" name="library_name" type="text" value="${e(settings.library_name)}" required></div>
        <div class="field-row"><div class="field"><label for="default_loan_days">Default loan length</label><select id="default_loan_days" name="default_loan_days">${math.LOAN_LENGTH_DAYS.map((length) => `<option value="${length}"${selected(length, settings.default_loan_days)}>${length} days</option>`).join("")}</select></div><div class="field"><label for="fine_per_day">Fine per day</label><input id="fine_per_day" name="fine_per_day" type="number" min="0" step="0.01" value="${e(settings.fine_per_day)}"></div></div>
        <div class="field-row"><div class="field"><label for="academic_year">Academic year</label><input id="academic_year" name="academic_year" type="text" value="${e(settings.academic_year)}" placeholder="2025-2026"></div><div class="field"><label for="semester">Semester</label><input id="semester" name="semester" type="text" value="${e(settings.semester)}" placeholder="Second Semester"></div></div>
        <div class="field"><label for="announcement">Notice for students</label><textarea id="announcement" name="announcement" rows="3">${e(settings.announcement)}</textarea></div>
        <div class="form-actions"><button class="btn primary" type="submit">${icon("check")} Save settings</button></div>
      </form>
    </section>` : `<section class="card profile-card">
      <div class="profile-head">${avatar(account.display_name, "large")}<div><h2>${e(account.display_name)}</h2><p>${e(account.username)} · Student account</p><div class="profile-badges">${member ? `<span class="badge navy">${util.mid(member.id)}</span><span class="badge grey">${e(member.course)}</span><span class="badge grey">Year ${member.year_level}</span>` : ""}</div></div></div>
      ${member ? `<dl class="detail-list"><div><dt>Member ID</dt><dd>${util.mid(member.id)}</dd></div><div><dt>Course</dt><dd>${e(member.course)}</dd></div><div><dt>Year level</dt><dd>Year ${member.year_level}</dd></div><div><dt>Open loans</dt><dd>${memberStats.active_loans}</dd></div><div><dt>Lifetime loans</dt><dd>${memberStats.total_loans}</dd></div></dl><a class="btn secondary block" href="${link("/my-loans")}">View my loans</a>` : `<p class="form-note">This account is not linked to a member record.</p>`}
    </section>`}

    <section class="card">
      <div class="card-head"><div><h2>Change password</h2><p>Use at least eight characters.</p></div></div>
      <form class="stack-form" data-form="change-password">
        <div class="field"><label for="current_password">Current password</label><input id="current_password" name="current_password" type="password" required autocomplete="current-password"></div>
        <div class="field-row"><div class="field"><label for="new_password">New password</label><input id="new_password" name="new_password" type="password" minlength="8" required autocomplete="new-password"></div><div class="field"><label for="confirm_password">Confirm new password</label><input id="confirm_password" name="confirm_password" type="password" minlength="8" required autocomplete="new-password"></div></div>
        <div class="form-actions"><button class="btn secondary" type="submit">${icon("settings")} Update password</button></div>
      </form>
    </section>
  </div>
  <aside class="stack">
    <section class="card">
      <div class="card-head"><div><h2>Account</h2><p>The signed-in portal account.</p></div></div>
      <dl class="detail-list"><div><dt>Username</dt><dd class="mono">${e(account.username)}</dd></div><div><dt>Display name</dt><dd>${e(account.display_name)}</dd></div><div><dt>Role</dt><dd>${isLib ? "Librarian" : "Student"}</dd></div>${member ? `<div><dt>Member record</dt><dd>${e(member.name)}</dd></div>` : ""}</dl>
      <a class="btn secondary block" href="${link("/login")}" data-action="logout">${icon("logout")} Sign out</a>
    </section>
    <section class="card">
      <div class="card-head"><div><h2>Library status</h2><p>${e(settings.academic_year)} · ${e(settings.semester)}</p></div></div>
      <dl class="detail-list"><div><dt>Titles</dt><dd>${systemCounts.books}</dd></div><div><dt>Physical copies</dt><dd>${systemCounts.copies}</dd></div><div><dt>Members</dt><dd>${systemCounts.members}</dd></div><div><dt>Loan records</dt><dd>${systemCounts.loans}</dd></div><div><dt>Database</dt><dd class="mono">browser memory</dd></div></dl>
      <p class="form-note">${e(settings.library_name)} · ${e(settings.default_loan_days)}-day default loan · ${util.money(settings.fine_per_day)} per day fine. Reloading the page restores the demo data.</p>
    </section>
  </aside>
</div>`;
    return views.shell({ title: isLib ? "Settings" : "My profile", breadcrumb: isLib ? "Settings" : "My profile", active: "settings", content });
  };

  /* ------------------------------------------------------------ my loans */
  views.myLoans = function () {
    const member = data.currentMember();
    const active = query.loanRows({ memberId: member.id });
    const history = query.historyRows(member.id, 40);
    const settings = data.settings();
    const content = `<div class="page-head">
  <div><p class="eyebrow">Reading record</p><h1>My loans</h1><p class="page-sub">${e(member.name)} · ${util.mid(member.id)} · ${e(member.course)}</p></div>
  <div class="page-actions"><a class="btn primary" href="${link("/catalog")}">${icon("search")} Find a book</a></div>
</div>

<div class="stat-grid three">
  <article class="stat-card"><div class="stat-top"><span class="stat-icon navy">${icon("bookmark")}</span><span class="stat-badge">OPEN</span></div><p class="stat-label">Currently borrowed</p><p class="stat-value">${active.length}</p><p class="stat-foot">Items still with you</p></article>
  <article class="stat-card"><div class="stat-top"><span class="stat-icon green">${icon("check")}</span><span class="stat-badge">HISTORY</span></div><p class="stat-label">Completed loans</p><p class="stat-value">${history.length}</p><p class="stat-foot">Books returned to the desk</p></article>
  <article class="stat-card"><div class="stat-top"><span class="stat-icon amber">${icon("clock")}</span><span class="stat-badge">POLICY</span></div><p class="stat-label">Loan period</p><p class="stat-value">${e(settings.default_loan_days)}d</p><p class="stat-foot">${util.money(settings.fine_per_day)} per day after the due date</p></article>
</div>

<section class="table-card">
  <header class="table-card-head"><div><h2>Open loans</h2><p>Return items at the circulation desk.</p></div><span class="count-pill">${active.length}</span></header>
  ${active.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Book</th><th>Copy</th><th>Borrowed</th><th>Due</th><th>Status</th></tr></thead><tbody>${active.map((loan) => `<tr><td><div class="cell-title"><a href="${link("/catalog/" + loan.book_id)}">${e(loan.title)}</a><span>${e(loan.author)} · ${e(loan.category)}</span></div></td><td class="mono">${e(loan.accession_no)}</td><td class="nowrap">${util.datefmt(loan.borrowed_on)}</td><td class="nowrap">${util.datefmt(loan.due_on)}</td><td>${loanBadge(loan.days_late)}</td></tr>`).join("")}</tbody></table></div>` : emptyState("check", "No open loans", "Everything has been returned.")}
</section>

<section class="table-card">
  <header class="table-card-head"><div><h2>Return history</h2><p>Every completed loan on your account.</p></div><span class="count-pill">${history.length}</span></header>
  ${history.length ? `<div class="table-wrap"><table class="data-table compact"><thead><tr><th>Book</th><th>Copy</th><th>Borrowed</th><th>Due</th><th>Returned</th></tr></thead><tbody>${history.map((row) => `<tr><td><div class="cell-title"><strong>${e(row.title)}</strong><span>${e(row.author)}</span></div></td><td class="mono">${e(row.accession_no)}</td><td class="nowrap">${util.datefmt(row.borrowed_on)}</td><td class="nowrap">${util.datefmt(row.due_on)}</td><td class="nowrap">${util.datefmt(row.returned_on)}</td></tr>`).join("")}</tbody></table></div>` : emptyState("clock", "No history yet", "Your returned books will appear here.")}
</section>`;
    return views.shell({ title: "My loans", breadcrumb: "My loans", active: "my_loans", content });
  };

  views.notFound = function () {
    return views.shell({
      title: "Not found", breadcrumb: "Not found", active: "",
      content: `<div class="page-head"><div><p class="eyebrow">404</p><h1>Page not found</h1><p class="page-sub">That view does not exist in this demo.</p></div></div><a class="btn primary" href="#/dashboard">Back to dashboard</a>`,
    });
  };

  LD.views = views;
})();
