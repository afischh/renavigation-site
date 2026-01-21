// emma/assets/js/countdown.js
// Таймер до начала вебинара.
// Режимы:
// - Если data-target-iso пустой/невалидный => показываем "TBD" (без ломания страницы).
// - Если дата в прошлом => показываем 0 и "вебинар начался".
// Требование: HTML должен содержать элементы с id:
// cd_days, cd_hours, cd_minutes, cd_seconds, cd_status

(function () {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }

  function setText(id, text) {
    const el = $(id);
    if (el) el.textContent = String(text);
  }

  function parseTargetISOFromDOM() {
    // Ищем контейнер таймера с атрибутом data-target-iso
    const box = document.querySelector("[data-target-iso]");
    if (!box) return { ok: false, reason: "no-box" };

    const raw = (box.getAttribute("data-target-iso") || "").trim();
    if (!raw) return { ok: false, reason: "empty" };

    // Ожидаем ISO-строку с таймзоной, например:
    // 2026-02-16T19:00:00-06:00
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return { ok: false, reason: "invalid" };

    return { ok: true, date: d, raw };
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function renderTBD() {
    setText("cd_days", "—");
    setText("cd_hours", "—");
    setText("cd_minutes", "—");
    setText("cd_seconds", "—");
    setText("cd_status", "Дата вебинара: TBD (будет объявлено в Telegram).");
  }

  function renderStarted() {
    setText("cd_days", "0");
    setText("cd_hours", "00");
    setText("cd_minutes", "00");
    setText("cd_seconds", "00");
    setText("cd_status", "Вебинар начался или уже прошёл. Ссылка будет в Telegram.");
  }

  function tick(targetDate) {
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      renderStarted();
      return;
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const rem1 = totalSeconds % (24 * 3600);
    const hours = Math.floor(rem1 / 3600);
    const rem2 = rem1 % 3600;
    const minutes = Math.floor(rem2 / 60);
    const seconds = rem2 % 60;

    setText("cd_days", String(days));
    setText("cd_hours", pad2(hours));
    setText("cd_minutes", pad2(minutes));
    setText("cd_seconds", pad2(seconds));
    setText("cd_status", "До начала вебинара осталось:");
  }

  function main() {
    // Если нет нужных элементов — тихо выходим, чтобы не ломать другие страницы.
    if (!document.querySelector("[data-target-iso]")) return;

    const parsed = parseTargetISOFromDOM();
    if (!parsed.ok) {
      renderTBD();
      return;
    }

    // Первый рендер сразу, дальше каждую секунду.
    tick(parsed.date);
    setInterval(function () {
      tick(parsed.date);
    }, 1000);
  }

  document.addEventListener("DOMContentLoaded", main);
})();
