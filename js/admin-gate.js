import { onAuthChange, signInWithGoogle, logOut } from "/js/auth.js";
import {
  clearAdminSession,
  getAdminEmail,
  isAdminAuthenticated,
  verifyAdminSession
} from "/js/admin-api.js";

function createGate() {
  const gate = document.createElement("div");
  gate.id = "adminGate";
  gate.className = "admin-gate";
  gate.innerHTML = `
    <div class="admin-gate-card">
      <h2 class="admin-gate-title">Admin access</h2>
      <p class="admin-gate-copy" id="adminGateCopy">
        Sign in with the Google account that manages wf—here.
      </p>
      <p class="admin-gate-error" id="adminGateError" hidden></p>
      <button class="google-sign-in-btn" id="adminGoogleBtn" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
        <span>Continue with Google</span>
      </button>
      <button class="listing-btn listing-btn-cancel" id="adminSwitchBtn" type="button" hidden>
        Use a different account
      </button>
    </div>
  `;
  return gate;
}

export function mountAdminGate({ rootSelector = "main" } = {}) {
  const root = document.querySelector(rootSelector) || document.body;
  const gate = createGate();
  document.body.prepend(gate);

  const copyEl = gate.querySelector("#adminGateCopy");
  const errorEl = gate.querySelector("#adminGateError");
  const googleBtn = gate.querySelector("#adminGoogleBtn");
  const switchBtn = gate.querySelector("#adminSwitchBtn");

  let unlocked = false;

  function showContent() {
    unlocked = true;
    gate.hidden = true;
    root.style.visibility = "";
    root.removeAttribute("aria-hidden");
  }

  function hideContent() {
    unlocked = false;
    gate.hidden = false;
    root.style.visibility = "hidden";
    root.setAttribute("aria-hidden", "true");
  }

  function setBusy(isBusy) {
    googleBtn.disabled = isBusy;
    switchBtn.disabled = isBusy;
    googleBtn.querySelector("span").textContent = isBusy ? "Checking..." : "Continue with Google";
  }

  async function unlockIfAllowed(user) {
    errorEl.hidden = true;

    if (!user) {
      clearAdminSession();
      copyEl.textContent = "Sign in with the Google account that manages wf—here.";
      switchBtn.hidden = true;
      hideContent();
      return;
    }

    copyEl.textContent = `Signed in as ${user.email}. Checking admin access…`;
    switchBtn.hidden = false;
    setBusy(true);

    try {
      const result = await verifyAdminSession();
      copyEl.textContent = `Signed in as ${result.email || user.email}`;
      showContent();
      document.dispatchEvent(new CustomEvent("admin-authenticated"));
    } catch (error) {
      clearAdminSession();
      hideContent();
      errorEl.hidden = false;
      errorEl.textContent =
        error.message || "This Google account is not authorized for admin access.";
      copyEl.textContent = `Signed in as ${user.email}, but this account can’t open admin tools.`;
    } finally {
      setBusy(false);
    }
  }

  googleBtn.addEventListener("click", async () => {
    errorEl.hidden = true;
    setBusy(true);

    try {
      const user = await signInWithGoogle();
      await unlockIfAllowed(user);
    } catch (error) {
      errorEl.hidden = false;
      errorEl.textContent = error.message || "Google sign-in failed.";
      setBusy(false);
    }
  });

  switchBtn.addEventListener("click", async () => {
    clearAdminSession();
    hideContent();
    await logOut();
  });

  onAuthChange((user) => {
    if (unlocked && user && isAdminAuthenticated()) {
      return;
    }

    unlockIfAllowed(user);
  });

  if (isAdminAuthenticated() && getAdminEmail()) {
    copyEl.textContent = `Signed in as ${getAdminEmail()}. Checking admin access…`;
  } else {
    hideContent();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => mountAdminGate(), { once: true });
} else {
  mountAdminGate();
}
