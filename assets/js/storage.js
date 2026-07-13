(function (global) {
  "use strict";
  const KEYS = {
    favorites: "ichingFavorites",
    recent: "ichingRecentCards",
    viewed: "ichingViewedCards"
  };
  const learningKeys = [
    KEYS.recent, KEYS.viewed, "dailyCardHistory", "pictureThemeSeen",
    "pictureThemeCorrect", "themePictureSeen", "themePictureCorrect",
    "textHideRounds", "textHideCorrect", "journeyKarutaPlays",
    "journeyKarutaBestCombo", "journeyOrderRounds", "journeyOrderCorrect",
    "plainTextMemoryPlays", "plainTextMemoryBest", "baguaBestCombo",
    "baguaReverseBestCombo", "baguaMeaningBestCombo"
  ];

  function normalizeNo(value) {
    const number = Number(String(value == null ? "" : value).replace(/[０-９]/g, c => String(c.charCodeAt(0) - 65248)));
    return Number.isInteger(number) && number >= 1 && number <= 64 ? String(number).padStart(2, "0") : null;
  }
  function readArray(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(value)) return [];
      return [...new Set(value.map(normalizeNo).filter(Boolean))];
    } catch (_) { return []; }
  }
  function writeArray(key, value) {
    const safe = [...new Set((Array.isArray(value) ? value : []).map(normalizeNo).filter(Boolean))];
    try { localStorage.setItem(key, JSON.stringify(safe)); } catch (_) {}
    return safe;
  }
  function readNumber(key) {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }
  function readObject(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch (_) { return {}; }
  }
  function toggleFavorite(no) {
    const normalized = normalizeNo(no);
    if (!normalized) return readArray(KEYS.favorites);
    const values = readArray(KEYS.favorites);
    return writeArray(KEYS.favorites, values.includes(normalized) ? values.filter(v => v !== normalized) : [...values, normalized]);
  }
  function addRecent(no) {
    const normalized = normalizeNo(no);
    if (!normalized) return readArray(KEYS.recent);
    return writeArray(KEYS.recent, [normalized, ...readArray(KEYS.recent).filter(v => v !== normalized)].slice(0, 8));
  }
  function addViewed(no) {
    const normalized = normalizeNo(no);
    if (!normalized) return readArray(KEYS.viewed);
    return writeArray(KEYS.viewed, [...readArray(KEYS.viewed), normalized].slice(0, 64));
  }
  function reset(includeFavorites) {
    learningKeys.forEach(key => localStorage.removeItem(key));
    if (includeFavorites) localStorage.removeItem(KEYS.favorites);
  }
  global.IchingStorage = { KEYS, learningKeys, normalizeNo, readArray, writeArray, readNumber, readObject, toggleFavorite, addRecent, addViewed, reset };
})(window);
