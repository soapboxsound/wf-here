import {
  clearAdminSession,
  getAdminPassword,
  isAdminAuthenticated,
  verifyAdminPassword
} from "/js/admin-api.js";

function createGate() {
  const gate = document.createElement("div");
  gate.id = "adminGate";
  gate.className = "admin-gate";
  gate.innerHTML = `
    <div class="admin-gate-card">
      <h2 class="admin-gate-title">Admin access</h2>
      <p class="admin-gate-copy">Enter the admin password to manage listings and submissions.</p>
      <label class="form-label" for="adminPasswordInput">Password</label>
      <input class="form-input" id="adminPasswordInput" type="password" autocomplete="current-password">
      <p class="admin-gate-error" id="adminGateError" hidden></p>
      <button class="listing-btn listing-btn-publish" id="adminEnterBtn" type="button">Enter</button>
    </div>
  `;
  return gate;
}

export function mountAdminGate({ rootSelector = "main" } = {}) {
  const root = document.querySelector(rootSelector) || document.body;
  const gate = createGate();
  document.body.prepend(gate);

  const passwordInput = gate.querySelector("#adminPasswordInput");
  const enterBtn = gate.querySelector("#adminEnterBtn");
  const errorEl = gate.querySelector("#adminGateError");

  function showContent() {
    gate.hidden = true;
    root.style.visibility = "";
    root.removeAttribute("aria-hidden");
  }

  function hideContent() {
    gate.hidden = false;
    root.style.visibility = "hidden";
    root.setAttribute("aria-hidden", "true");
  }

  async function tryEnter() {
    errorEl.hidden = true;
    enterBtn.disabled = true;
    enterBtn.textContent = "Checking...";

    try {
      await verifyAdminPassword(passwordInput.value);
      showContent();
      document.dispatchEvent(new CustomEvent("admin-authenticated"));
    } catch (error) {
      clearAdminSession();
      errorEl.hidden = false;
      errorEl.textContent = error.message || "Incorrect password.";
    } finally {
      enterBtn.disabled = false;
      enterBtn.textContent = "Enter";
    }
  }

  enterBtn.addEventListener("click", tryEnter);
  passwordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      tryEnter();
    }
  });

  if (isAdminAuthenticated()) {
    verifyAdminPassword(getAdminPassword())
      .then(() => {
        showContent();
        document.dispatchEvent(new CustomEvent("admin-authenticated"));
      })
      .catch(() => {
        clearAdminSession();
        hideContent();
        passwordInput.focus();
      });
  } else {
    hideContent();
    passwordInput.focus();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => mountAdminGate(), { once: true });
} else {
  mountAdminGate();
}
