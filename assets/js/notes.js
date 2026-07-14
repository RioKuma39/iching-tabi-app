(function (global) {
  "use strict";

  const STORAGE_KEY = "iching_notes";

  function readAll() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch (_) {
      return {};
    }
  }

  function writeAll(notes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return notes;
  }

  function get(cardNo) {
    return readAll()[String(Number(cardNo))] || null;
  }

  function save(cardNo, cardName, note) {
    const number = Number(cardNo);
    const text = String(note == null ? "" : note);
    if (!Number.isInteger(number) || number < 1 || number > 64) throw new Error("Invalid card number");
    const notes = readAll();
    notes[String(number)] = {
      cardNo: number,
      cardName: String(cardName || ""),
      note: text,
      updatedAt: new Date().toISOString()
    };
    writeAll(notes);
    return notes[String(number)];
  }

  function remove(cardNo) {
    const notes = readAll();
    delete notes[String(Number(cardNo))];
    writeAll(notes);
  }

  function list() {
    return Object.values(readAll())
      .filter(item => item && Number.isInteger(Number(item.cardNo)) && String(item.note || "").trim())
      .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
  }

  function has(cardNo) {
    const item = get(cardNo);
    return Boolean(item && String(item.note || "").trim());
  }

  function csvCell(value) {
    return `"${String(value == null ? "" : value).replace(/"/g, '""')}"`;
  }

  function formatCsvDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const parts = new Intl.DateTimeFormat("ja-JP", {
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(date).reduce((acc, part) => (acc[part.type] = part.value, acc), {});
    return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
  }

  function exportCsv(filename) {
    const rows = ["card_no,card_name,note,updated_at"];
    list().sort((a, b) => Number(a.cardNo) - Number(b.cardNo)).forEach(item => {
      rows.push([item.cardNo, item.cardName, item.note, formatCsvDate(item.updatedAt)].map(csvCell).join(","));
    });
    const blob = new Blob(["\uFEFF", rows.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "iching_notes.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  global.IchingNotes = { STORAGE_KEY, readAll, writeAll, get, save, remove, list, has, exportCsv, formatCsvDate };
})(window);
