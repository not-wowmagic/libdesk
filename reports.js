/* LibDesk web — report definitions (SQL shown verbatim) and live results. */
(function () {
  "use strict";
  const LD = (window.LD = window.LD || {});
  const { util, data, math } = LD;

  const ZERO_AVAILABLE_SQL = `SELECT c.book_id,
       (SELECT b.title FROM books b WHERE b.id = c.book_id) AS title,
       COUNT(*) AS owned,
       COUNT(CASE WHEN c.status = 'available' THEN 1 END) AS available
FROM copies c
GROUP BY c.book_id
HAVING COUNT(CASE WHEN c.status = 'available' THEN 1 END) = 0
ORDER BY title;`;

  const TOP_FIVE_SQL = `SELECT b.id AS book_id,
       b.title,
       (SELECT COUNT(*)
        FROM loans l
        WHERE l.copy_id IN (
            SELECT c.id FROM copies c WHERE c.book_id = b.id
        )) AS times_borrowed
FROM books b
ORDER BY times_borrowed DESC, b.title ASC
LIMIT 5;`;

  const OVERDUE_SQL = `SELECT l.id AS loan_id,
       (SELECT c.accession_no FROM copies c WHERE c.id = l.copy_id) AS accession_no,
       (SELECT b.title
        FROM books b
        WHERE b.id = (
            SELECT c.book_id FROM copies c WHERE c.id = l.copy_id
        )) AS title,
       (SELECT m.name FROM members m WHERE m.id = l.member_id) AS member,
       l.due_on,
       CAST(julianday(date('now', 'localtime')) - julianday(l.due_on) AS INTEGER) AS days_late
FROM loans l
WHERE l.returned_on IS NULL
  AND l.due_on < date('now', 'localtime')
ORDER BY days_late DESC, l.id;`;

  const OVERDUE_SUMMARY_SQL = `SELECT COUNT(*) AS overdue_loans,
       SUM(CAST(julianday(date('now', 'localtime')) - julianday(due_on) AS INTEGER)) AS total_days_late
FROM loans
WHERE returned_on IS NULL
  AND due_on < date('now', 'localtime');`;

  const LOANS_PER_MEMBER_SQL = `SELECT l.member_id,
       (SELECT m.name FROM members m WHERE m.id = l.member_id) AS member,
       COUNT(*) AS loan_count
FROM loans l
GROUP BY l.member_id
HAVING COUNT(*) > 1
ORDER BY loan_count DESC, l.member_id ASC;`;

  const BONUS_JOIN_SQL = `SELECT l.id AS loan_id,
       m.name AS member,
       b.title,
       c.accession_no,
       l.borrowed_on,
       l.due_on,
       COALESCE(l.returned_on, 'not returned') AS returned_on
FROM loans l
JOIN copies c ON c.id = l.copy_id
JOIN books b ON b.id = c.book_id
JOIN members m ON m.id = l.member_id
ORDER BY l.id
LIMIT 10;`;

  const zeroAvailable = () => {
    const groups = new Map();
    for (const copy of data.state.copies) {
      if (!groups.has(copy.book_id)) groups.set(copy.book_id, []);
      groups.get(copy.book_id).push(copy);
    }
    const rows = [];
    for (const [bookId, copies] of groups) {
      const available = copies.filter((c) => c.status === "available").length;
      if (available === 0) {
        rows.push({ book_id: bookId, title: data.book(bookId).title, owned: copies.length, available });
      }
    }
    rows.sort((a, b) => a.title.localeCompare(b.title));
    return { columns: ["book_id", "title", "owned", "available"], rows };
  };

  const topFive = () => {
    const rows = data.state.books.map((book) => {
      const copyIds = new Set(data.state.copies.filter((c) => c.book_id === book.id).map((c) => c.id));
      return {
        book_id: book.id, title: book.title,
        times_borrowed: data.state.loans.filter((l) => copyIds.has(l.copy_id)).length,
      };
    }).sort((a, b) => b.times_borrowed - a.times_borrowed || a.title.localeCompare(b.title)).slice(0, 5);
    return { columns: ["book_id", "title", "times_borrowed"], rows };
  };

  const overdue = () => {
    const today = util.todayISO();
    const rows = data.state.loans
      .filter((l) => l.returned_on == null && l.due_on < today)
      .map((l) => {
        const copy = data.copy(l.copy_id);
        const book = data.book(copy.book_id);
        return {
          loan_id: l.id,
          accession_no: copy.accession_no,
          title: book.title,
          member: data.member(l.member_id).name,
          due_on: l.due_on,
          days_late: util.diffDays(l.due_on, today),
        };
      })
      .sort((a, b) => b.days_late - a.days_late || a.loan_id - b.loan_id);
    const summaryRows = [{
      overdue_loans: rows.length,
      total_days_late: rows.reduce((sum, row) => sum + row.days_late, 0),
    }];
    return {
      columns: ["loan_id", "accession_no", "title", "member", "due_on", "days_late"],
      rows, summaryColumns: ["overdue_loans", "total_days_late"], summaryRows,
    };
  };

  const repeatBorrowers = () => {
    const groups = new Map();
    for (const l of data.state.loans) groups.set(l.member_id, (groups.get(l.member_id) || 0) + 1);
    const rows = [...groups]
      .filter(([, count]) => count > 1)
      .map(([memberId, count]) => ({ member_id: memberId, member: data.member(memberId).name, loan_count: count }))
      .sort((a, b) => b.loan_count - a.loan_count || a.member_id - b.member_id);
    return { columns: ["member_id", "member", "loan_count"], rows };
  };

  const ledger = () => {
    const rows = [...data.state.loans].sort((a, b) => a.id - b.id).slice(0, 10).map((l) => {
      const copy = data.copy(l.copy_id);
      return {
        loan_id: l.id,
        member: data.member(l.member_id).name,
        title: data.book(copy.book_id).title,
        accession_no: copy.accession_no,
        borrowed_on: l.borrowed_on,
        due_on: l.due_on,
        returned_on: l.returned_on || "not returned",
      };
    });
    return {
      columns: ["loan_id", "member", "title", "accession_no", "borrowed_on", "due_on", "returned_on"],
      rows,
    };
  };

  LD.reports = [
    {
      number: "01", title: "Titles with no free copy",
      requirement: "GROUP BY book_id · HAVING COUNT(available) = 0",
      note: "Every copy of these titles is currently checked out.",
      sql: ZERO_AVAILABLE_SQL, badge: null, summary_labels: null, compute: zeroAvailable,
    },
    {
      number: "02", title: "Top 5 most borrowed titles",
      requirement: "COUNT · ORDER BY · LIMIT 5",
      note: "Ranked by total loan records, including returned loans.",
      sql: TOP_FIVE_SQL, badge: null, summary_labels: null, compute: topFive,
    },
    {
      number: "03", title: "Overdue report",
      requirement: "WHERE returned_on IS NULL · days late · SUM",
      note: "Unreturned items past their due date, with a total for follow-up.",
      sql: OVERDUE_SQL,
      summary_sql: OVERDUE_SUMMARY_SQL,
      summary_labels: { overdue_loans: "Overdue loans", total_days_late: "Total days late" },
      compute: overdue,
    },
    {
      number: "04", title: "Members with repeat loans",
      requirement: "GROUP BY member_id · COUNT · HAVING COUNT > 1",
      note: "Readers who have borrowed more than once.",
      sql: LOANS_PER_MEMBER_SQL, badge: null, summary_labels: null, compute: repeatBorrowers,
    },
    {
      number: "05", title: "Full loan ledger",
      requirement: "Multi-table JOIN",
      note: "Loans joined across copies, titles, and members.",
      sql: BONUS_JOIN_SQL, badge: "Bonus — not yet covered in lecture", summary_labels: null, compute: ledger,
    },
  ];

  LD.reports.renderAll = function () {
    return LD.reports.map((report) => {
      const result = report.compute();
      return {
        ...report,
        columns: result.columns,
        rows: result.rows,
        row_count: result.rows.length,
        summary_columns: result.summaryColumns || [],
        summary_rows: result.summaryRows || [],
      };
    });
  };
})();
