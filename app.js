/* LibDesk web — router, authentication, actions, and form handling. */
(function () {
  "use strict";
  const LD = window.LD;
  const { util, data, views, math, query } = LD;

  let pendingToasts = [];
  let loginError = null;
  let loginUsername = "";

  const flash = (category, message) => pendingToasts.push({ category, message });

  function flushToasts() {
    const host = document.getElementById("toasts");
    if (!host) { pendingToasts = []; return; }
    host.innerHTML = pendingToasts.map((toast) => `
      <div class="toast ${toast.category}">
        <span class="toast-icon">${util.icon(toast.category === "success" ? "check" : "alert")}</span>
        <span>${util.esc(toast.message)}</span>
        <button class="toast-close" type="button" data-action="dismiss-toast" aria-label="Dismiss message">${util.icon("x")}</button>
      </div>`).join("");
    pendingToasts = [];
    for (const node of [...host.querySelectorAll(".toast")]) {
      setTimeout(() => node.remove(), 6000);
    }
  }

  function parseHash() {
    const raw = (location.hash || "").replace(/^#/, "") || "/dashboard";
    const [path, search = ""] = raw.split("?");
    return { path: path || "/dashboard", params: util.parseQuery(search) };
  }

  function navigate(path) {
    if (location.hash === `#${path}`) render();
    else location.hash = path;
    window.scrollTo(0, 0);
  }

  function expose(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    // Only swap the body. Replacing <html> also replaces the stylesheet link,
    // which makes the page flash unstyled (default purple links) on every tab
    // change while the browser re-applies CSS.
    document.body.innerHTML = doc.body.innerHTML;
    document.body.className = doc.body.className || "";
    document.title = doc.title;
    flushToasts();
  }

  function render() {
    const { path, params } = parseHash();
    if (!data.user) {
      if (path !== "/login") { location.hash = "/login"; return; }
      expose(views.login({ error: loginError, username: loginUsername }));
      loginError = null;
      loginUsername = "";
      return;
    }
    if (path === "/login") { navigate("/dashboard"); return; }

    const librarianOnly = new Set(["/members", "/circulation", "/insights", "/reports"]);
    if (librarianOnly.has(path) && data.user.role !== "librarian") {
      flash("error", "That area is for library staff.");
      navigate("/dashboard");
      return;
    }

    let html;
    if (path === "/" || path === "/dashboard") {
      html = data.user.role === "student" ? views.studentDashboard() : views.dashboard();
    } else if (path === "/catalog") {
      html = views.catalog(params);
    } else if (/^\/catalog\/\d+$/.test(path)) {
      html = views.bookDetail(Number(path.split("/")[2]));
    } else if (path === "/members") {
      html = views.members(params);
    } else if (/^\/members\/\d+$/.test(path)) {
      html = views.memberDetail(Number(path.split("/")[2]));
    } else if (path === "/circulation" || path === "/desk") {
      html = views.circulation(params);
    } else if (path === "/insights" || path === "/matrix") {
      html = views.insights();
    } else if (path === "/reports") {
      html = views.reports();
    } else if (path === "/settings") {
      html = views.settings();
    } else if (path === "/my-loans") {
      if (data.user.role !== "student") { navigate("/circulation"); return; }
      html = views.myLoans();
    } else {
      html = views.notFound();
    }
    expose(html);
    if (path === "/catalog" && params.edit && data.user.role === "librarian") {
      const book = data.book(params.edit);
      if (book) openEditBook(book);
    }
  }

  /* ------------------------------------------------------------ actions */
  function doReturn(loanId) {
    const loan = data.loan(loanId);
    if (!loan) { flash("error", "Return refused: that loan was not found."); return render(); }
    if (data.user.role === "student" && loan.member_id !== data.user.member_id) {
      flash("error", "Return refused: that loan belongs to another member."); return render();
    }
    if (loan.returned_on != null) { flash("error", "Return refused: that loan was already returned."); return render(); }
    const copy = data.copy(loan.copy_id);
    const book = data.book(copy.book_id);
    loan.returned_on = util.todayISO();
    copy.status = "available";
    const set = math.availableCopies(book.id);
    flash("success", `Returned '${book.title}' (${copy.accession_no}) from ${data.member(loan.member_id).name} · ${set.available.size} of ${set.owned.size} available.`);
    render();
  }

  function doBorrow(form) {
    const values = new FormData(form);
    const memberId = Number(values.get("member_id")) || null;
    let days = Number(values.get("days"));
    let copyId = Number(values.get("copy_id")) || null;
    const accession = String(values.get("accession_no") || "").trim().toUpperCase();
    const member = memberId && data.member(memberId);
    if (!member) { flash("error", "Borrow refused: choose a valid member first."); return render(); }
    if (!math.LOAN_LENGTH_DAYS.includes(days)) days = Number(data.settings().default_loan_days) || 14;
    if (!math.LOAN_LENGTH_DAYS.includes(days)) { flash("error", "Borrow refused: loan length must be 7, 14, or 21 days."); return render(); }
    if (!copyId && !accession) {
      flash("error", "Borrow refused: choose an available copy or enter an accession number."); return render();
    }
    let copy = copyId ? data.copy(copyId) : data.state.copies.find((c) => c.accession_no === accession);
    if (!copy) { flash("error", `Borrow refused: copy ${accession || copyId} was not found.`); return render(); }
    if (copy.status !== "available") {
      flash("error", `Borrow refused: copy ${copy.accession_no} is already on loan.`); return render();
    }
    const book = data.book(copy.book_id);
    const holds = data.state.loans.some((l) => l.member_id === member.id && l.returned_on == null && data.copy(l.copy_id).book_id === book.id);
    if (holds) {
      flash("error", `Borrow refused: ${member.name} already holds a copy of '${book.title}'.`); return render();
    }
    copy.status = "on_loan";
    const today = util.todayISO();
    data.state.loans.push({
      id: data.nextId(data.state.loans), copy_id: copy.id, member_id: member.id,
      borrowed_on: today, due_on: util.addDays(today, days), returned_on: null,
    });
    const set = math.availableCopies(book.id);
    flash("success", `Borrowed '${book.title}' (${copy.accession_no}) for ${member.name} · ${set.available.size} of ${set.owned.size} available.`);
    navigate(`/circulation?member=${member.id}`);
  }

  function openEditBook(book) {
    const dialog = document.getElementById("edit-book-dialog");
    if (!dialog) return;
    const form = dialog.querySelector("form");
    form.dataset.id = book.id;
    form.elements.title.value = book.title;
    form.elements.author.value = book.author;
    form.elements.isbn.value = book.isbn;
    form.elements.category.value = book.category;
    dialog.showModal();
  }

  function openEditMember(member) {
    const dialog = document.getElementById("edit-member-dialog");
    if (!dialog) return;
    const form = dialog.querySelector("form");
    form.dataset.id = member.id;
    form.elements.name.value = member.name;
    form.elements.course.value = member.course;
    form.elements.year_level.value = String(member.year_level);
    dialog.showModal();
  }

  function exportCsv(number) {
    const report = LD.reports.find((item) => item.number === number);
    if (!report) return;
    const result = report.compute();
    const cell = (value) => {
      const text = value == null ? "" : String(value);
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const lines = [result.columns.map(cell).join(",")];
    for (const row of result.rows) lines.push(result.columns.map((col) => cell(row[col])).join(","));
    const blob = new Blob(["\ufeff" + lines.join("\r\n") + "\r\n"], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `libdesk-report-${number}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function handleClick(event) {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;

    if (action === "dismiss-toast") { target.closest(".toast")?.remove(); return; }
    if (action === "toggle-sidebar") { document.body.classList.toggle("sidebar-open"); return; }
    if (action === "close-sidebar") { document.body.classList.remove("sidebar-open"); return; }
    if (action === "toggle-password") {
      const input = document.getElementById("password");
      if (input) {
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        target.setAttribute("aria-label", show ? "Hide password" : "Show password");
      }
      return;
    }
    if (action === "fill-login") {
      document.getElementById("username").value = target.dataset.username;
      document.getElementById("password").value = target.dataset.password;
      return;
    }
    if (action === "open-dialog") {
      const dialog = document.getElementById(target.dataset.dialog);
      if (dialog) dialog.showModal();
      return;
    }
    if (action === "close-dialog") {
      target.closest("dialog")?.close();
      return;
    }
    if (action === "logout") {
      event.preventDefault();
      data.user = null;
      flash("success", "You have been signed out.");
      navigate("/login");
      return;
    }
    if (action === "edit-book") {
      const book = data.book(target.dataset.id);
      if (book) openEditBook(book);
      return;
    }
    if (action === "edit-member") {
      const member = data.member(target.dataset.id);
      if (member) openEditMember(member);
      return;
    }
    if (action === "delete-book") {
      const book = data.book(target.dataset.id);
      if (!book) return;
      if (!window.confirm(`Remove '${book.title}' and its loan history from the catalog?`)) return;
      const copyIds = new Set(data.state.copies.filter((c) => c.book_id === book.id).map((c) => c.id));
      const active = data.state.loans.filter((l) => copyIds.has(l.copy_id) && l.returned_on == null).length;
      if (active) {
        flash("error", `Remove refused: '${book.title}' still has ${active} active loan(s).`); return render();
      }
      data.state.loans = data.state.loans.filter((l) => !copyIds.has(l.copy_id));
      data.state.copies = data.state.copies.filter((c) => c.book_id !== book.id);
      data.state.books = data.state.books.filter((b) => b.id !== book.id);
      flash("success", `Removed '${book.title}' from the catalog.`); return render();
    }
    if (action === "delete-member") {
      const member = data.member(target.dataset.id);
      if (!member) return;
      if (!window.confirm(`Remove ${member.name} and their loan history?`)) return;
      const account = data.state.users.find((u) => u.member_id === member.id);
      if (account) {
        flash("error", `Remove refused: ${member.name} has a portal account. Remove the account first.`); return render();
      }
      const active = data.state.loans.filter((l) => l.member_id === member.id && l.returned_on == null).length;
      if (active) {
        flash("error", `Remove refused: ${member.name} still has ${active} active loan(s).`); return render();
      }
      data.state.loans = data.state.loans.filter((l) => l.member_id !== member.id);
      data.state.members = data.state.members.filter((m) => m.id !== member.id);
      flash("success", `Removed member ${member.name}.`); return render();
    }
    if (action === "return") { doReturn(Number(target.dataset.loan)); return; }
    if (action === "print") { window.print(); return; }
    if (action === "export-csv") { exportCsv(target.dataset.report); return; }
  }

  /* -------------------------------------------------------------- forms */
  function handleSubmit(event) {
    const form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();
    const kind = form.dataset.form;
    const values = new FormData(form);
    const get = (key) => String(values.get(key) ?? "").trim();

    if (kind === "login") {
      const user = data.userFor(get("username"));
      if (!get("username") || !get("password")) loginError = "Enter both your username and password.";
      else if (!user || data.passwords[user.username] !== get("password")) loginError = "Invalid username or password.";
      else {
        loginError = null;
        data.user = { ...user };
        delete data.user.password_hash;
        flash("success", `Signed in as ${user.display_name}.`);
        return navigate("/dashboard");
      }
      loginUsername = get("username");
      return expose(views.login({ error: loginError, username: loginUsername }));
    }

    if (kind === "topbar-search") return navigate(`/catalog?q=${encodeURIComponent(get("q"))}`);
    if (kind === "catalog-filter") return navigate(`/catalog?${util.buildQuery({
      q: get("q"), category: get("category"), availability: get("availability"), sort: get("sort"),
    })}`);
    if (kind === "member-filter") return navigate(`/members?${util.buildQuery({
      q: get("q"), course: get("course"), year: get("year"), status: get("status"),
    })}`);
    if (kind === "circulation-filter") return navigate(`/circulation?${util.buildQuery({
      q: get("q"), status: get("status"), member: form.dataset.member || "",
    })}`);

    if (kind === "borrow") return doBorrow(form);

    if (kind === "add-book") {
      const title = get("title"), author = get("author"), isbn = get("isbn"), category = get("category");
      const count = Number(get("copies")) || 0;
      if (!title || !author || !isbn || !category) { flash("error", "Add book refused: title, author, ISBN, and category are required."); form.closest("dialog")?.close(); return render(); }
      if (!Number.isInteger(count) || count < 1 || count > 20) { flash("error", "Add book refused: copies must be between 1 and 20."); form.closest("dialog")?.close(); return render(); }
      if (data.state.books.some((b) => b.isbn.toLowerCase() === isbn.toLowerCase())) { flash("error", "Add book refused: that ISBN already exists."); form.closest("dialog")?.close(); return render(); }
      const bookId = data.nextId(data.state.books);
      data.state.books.push({ id: bookId, title, author, isbn, category });
      let nextCopyId = data.nextId(data.state.copies);
      for (let offset = 0; offset < count; offset++) {
        const copyId = nextCopyId + offset;
        data.state.copies.push({ id: copyId, book_id: bookId, accession_no: util.cid(copyId), status: "available" });
      }
      form.reset();
      form.closest("dialog")?.close();
      flash("success", `Added '${title}' with ${count} copies.`);
      return navigate(`/catalog/${bookId}`);
    }

    if (kind === "edit-book") {
      const book = data.book(form.dataset.id);
      if (!book) return render();
      const title = get("title"), author = get("author"), isbn = get("isbn"), category = get("category");
      if (!title || !author || !isbn || !category) { flash("error", "Update refused: all book fields are required."); form.closest("dialog")?.close(); return render(); }
      if (data.state.books.some((b) => b.id !== book.id && b.isbn.toLowerCase() === isbn.toLowerCase())) {
        flash("error", "Update refused: that ISBN already belongs to another title."); form.closest("dialog")?.close(); return render();
      }
      Object.assign(book, { title, author, isbn, category });
      form.closest("dialog")?.close();
      flash("success", `Updated '${title}'.`);
      return navigate(`/catalog/${book.id}`);
    }

    if (kind === "add-copies") {
      const book = data.book(form.dataset.id);
      if (!book) return render();
      const count = Number(get("copies")) || 0;
      if (count < 1 || count > 20) { flash("error", "Add copies refused: enter a number between 1 and 20."); return render(); }
      let nextCopyId = data.nextId(data.state.copies);
      for (let offset = 0; offset < count; offset++) {
        const copyId = nextCopyId + offset;
        data.state.copies.push({ id: copyId, book_id: book.id, accession_no: util.cid(copyId), status: "available" });
      }
      flash("success", `Added ${count} copies to '${book.title}'.`);
      return render();
    }

    if (kind === "add-member") {
      const name = get("name"), course = get("course"), year = Number(get("year_level"));
      if (!name || !course || ![1, 2, 3, 4].includes(year)) { flash("error", "Add member refused: name, course, and year are required."); form.closest("dialog")?.close(); return render(); }
      const id = data.nextId(data.state.members);
      data.state.members.push({ id, name, course, year_level: year });
      form.reset(); form.closest("dialog")?.close();
      flash("success", `Added member ${name}.`);
      return navigate("/members");
    }

    if (kind === "edit-member") {
      const member = data.member(form.dataset.id);
      if (!member) return render();
      const name = get("name"), course = get("course"), year = Number(get("year_level"));
      if (!name || !course || ![1, 2, 3, 4].includes(year)) { flash("error", "Update refused: name, course, and year are required."); form.closest("dialog")?.close(); return render(); }
      Object.assign(member, { name, course, year_level: year });
      form.closest("dialog")?.close();
      flash("success", `Updated member ${name}.`);
      return navigate(`/members/${member.id}`);
    }

    if (kind === "save-settings") {
      const name = get("library_name"), days = get("default_loan_days");
      const fine = Number(get("fine_per_day"));
      if (!name) { flash("error", "Settings not saved: library name is required."); return render(); }
      if (!["7", "14", "21"].includes(days)) { flash("error", "Settings not saved: default loan length must be 7, 14, or 21."); return render(); }
      if (!Number.isFinite(fine) || fine < 0) { flash("error", "Settings not saved: fine per day must be zero or more."); return render(); }
      data.setSetting("library_name", name);
      data.setSetting("default_loan_days", days);
      data.setSetting("fine_per_day", fine.toFixed(2));
      data.setSetting("academic_year", get("academic_year"));
      data.setSetting("semester", get("semester"));
      data.setSetting("announcement", get("announcement"));
      flash("success", "Library settings saved.");
      return render();
    }

    if (kind === "change-password") {
      const current = String(values.get("current_password") || "");
      const next = String(values.get("new_password") || "");
      const confirm = String(values.get("confirm_password") || "");
      if (!data.user || data.passwords[data.user.username] !== current) flash("error", "Password not changed: current password is incorrect.");
      else if (next.length < 8) flash("error", "Password not changed: use at least 8 characters.");
      else if (next !== confirm) flash("error", "Password not changed: the new passwords do not match.");
      else {
        data.passwords[data.user.username] = next;
        data.user.password_hash = next;
        flash("success", "Password changed.");
      }
      form.reset();
      return render();
    }
  }

  /* --------------------------------------------------------------- boot */
  document.addEventListener("click", handleClick);
  document.addEventListener("submit", handleSubmit);
  window.addEventListener("hashchange", render);

  data.load();
  render();
})();
