// FILE: /home/alex/renavigation-site_work/emma/assets/js/register.js
(function () {
  const form = document.getElementById("regForm");
  if (!form) return;

  const $ = (id) => document.getElementById(id);

  const apiUrl = "https://dockanddata.logosworks.garden/emma/intake/submit";
  const serviceType = "individual_navigation_session";
  const formId = "renavigation_webinar_register_v2";

  function getReminderChoice() {
    const r = form.querySelector('input[name="reminder_channel"]:checked');
    return r ? r.value : "telegram";
  }

  function normalizeTg(v) {
    v = (v || "").trim();
    if (!v) return null;
    return v.startsWith("@") ? v : "@" + v;
  }

  function getTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch (_) {
      return "UTC";
    }
  }

  function setError(msg) {
    const box = $("form_error"); // matches emma/register/index.html
    if (!box) return;
    box.textContent = msg || "";
    box.style.display = msg ? "block" : "none";
  }

  function setBusy(isBusy) {
    const btn = $("submitBtn");
    if (btn) btn.disabled = !!isBusy;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    const name = ($("name")?.value || "").trim();
    const telegram = normalizeTg($("tg")?.value || "");
    const whatsapp = (($("wa")?.value || "").trim()) || null;
    const consent = !!$("consent")?.checked;

    if (!name) {
      setError("Пожалуйста, укажи имя.");
      setBusy(false);
      return;
    }
    if (!consent) {
      setError("Нужно согласие на обработку данных, чтобы завершить регистрацию.");
      setBusy(false);
      return;
    }
    if (!telegram && !whatsapp) {
      setError("Нужен Telegram или WhatsApp, чтобы отправить напоминание/материалы.");
      setBusy(false);
      return;
    }

    const payload = {
      name: name,
      contact: telegram || whatsapp,
      service_type: serviceType,
      timezone: getTimezone(),
      consent: true,
      form_id: formId,
      short_message: [
        "origin=" + window.location.origin,
        "telegram=" + (telegram || ""),
        "whatsapp=" + (whatsapp || ""),
        "reminder_channel=" + getReminderChoice(),
      ].join("; "),
    };

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error("HTTP " + res.status + (t ? (": " + t) : ""));
      }

      const data = await res.json();
      if (!data || data.ok !== true) {
        const reason = data && data.error ? String(data.error) : "bad_response";
        throw new Error(reason);
      }

      window.location.href = "/emma/thankyou/?t=" + Date.now();
    } catch (err) {
      console.error(err);
      setError("Не удалось отправить регистрацию. Попробуй ещё раз чуть позже.");
    } finally {
      setBusy(false);
    }
  });
})();
