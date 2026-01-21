(function () {
  function $(id) { return document.getElementById(id); }

  const form = $("regForm");
  const errBox = $("form_error");

  // если скрипт подключился не на той странице — тихо выходим
  if (!form || !errBox) return;

  const name = $("name");
  const tg = $("tg");
  const wa = $("wa");
  const consent = $("consent");

  function getReminderChoice() {
    const r = document.querySelector('input[name="reminder_channel"]:checked');
    return r ? r.value : "telegram";
  }

  function normalizeTg(v) {
    v = (v || "").trim();
    if (!v) return "";
    return v.startsWith("@") ? v : "@" + v;
  }

  function setInvalid(el, on) {
    if (!el) return;
    el.classList.toggle("is-invalid", !!on);
  }

  function showError(msg) {
    errBox.textContent = msg;
    errBox.style.display = "block";
    errBox.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearError() {
    errBox.textContent = "";
    errBox.style.display = "none";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    clearError();
    setInvalid(name, false);
    setInvalid(tg, false);
    setInvalid(wa, false);

    const choice = getReminderChoice();

    const nameVal = (name.value || "").trim();
    const tgVal = normalizeTg(tg.value);
    const waVal = (wa.value || "").trim();
    const consentVal = !!consent.checked;

    if (!nameVal) {
      setInvalid(name, true);
      showError("Укажите имя.");
      return;
    }

    if (!consentVal) {
      showError("Поставьте галочку согласия, чтобы получить доступ.");
      return;
    }

    if (choice === "telegram") {
      if (!tgVal) {
        setInvalid(tg, true);
        showError("Укажите ник в Telegram.");
        return;
      }
    } else if (choice === "whatsapp") {
      if (!waVal) {
        setInvalid(wa, true);
        showError("Укажите номер WhatsApp.");
        return;
      }
    } else { // both
      if (!tgVal || !waVal) {
        setInvalid(tg, !tgVal);
        setInvalid(wa, !waVal);
        showError("Для варианта «И там и там» нужны и Telegram, и WhatsApp.");
        return;
      }
    }

    // нормализуем ник обратно в поле
    tg.value = tgVal;

    // MVP: пока просто ведём на thankyou
    window.location.href = "/emma/thankyou/";
  });
})();
