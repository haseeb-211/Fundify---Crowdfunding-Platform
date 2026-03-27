
(function () {
  const API_BASE_DEFAULT = "http://localhost:3000";
  window.API_BASE = window.API_BASE || API_BASE_DEFAULT;

  window.apiUrl = function apiUrl(relativePath) {
    const rel = relativePath.startsWith("/")
      ? relativePath
      : `/${relativePath}`;
    return `${window.API_BASE}${rel}`;
  };

  window.safeNumber = function safeNumber(value, fallback = 0) {
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? n : fallback;
  };


  window.escapeHtml = function escapeHtml(value) {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return String(value ?? "").replace(/[&<>"']/g, (ch) => map[ch]);
  };

  window.getCurrentUser = function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem("currentUser"));
    } catch {
      return null;
    }
  };

  window.saveCurrentUser = function saveCurrentUser(user) {
    const safe = Object.assign({}, user);
    delete safe.password;
    localStorage.setItem("currentUser", JSON.stringify(safe));
  };

 
  window.hashPassword = async function hashPassword(plaintext) {
    const encoded = new TextEncoder().encode(plaintext);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };


  window.getCampaignDescription = function getCampaignDescription(c, fallback) {
    const fb = fallback ?? "No description provided.";
    if (!c) return fb;
    const d = c.description ?? c.discription;
    if (typeof d === "string" && d.trim().length > 0) return d;
    return fb;
  };

  window.fetchJson = async function fetchJson(relativePath, options = {}) {
    const res = await fetch(window.apiUrl(relativePath), options);
    if (!res.ok) {
      let details = "";
      try {
        details = await res.text();
      } catch {
        details = "";
      }
      throw new Error(`API request failed (${res.status}): ${details}`);
    }
    return res.json();
  };

  window.fetchNoContent = async function fetchNoContent(
    relativePath,
    options = {},
  ) {
    const res = await fetch(window.apiUrl(relativePath), options);
    if (!res.ok) {
      let details = "";
      try {
        details = await res.text();
      } catch {
        details = "";
      }
      throw new Error(`API request failed (${res.status}): ${details}`);
    }
  };
})();

