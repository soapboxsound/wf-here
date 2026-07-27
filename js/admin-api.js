import { auth } from "/js/firebase.js";

const AUTH_FLAG = "adminAuthenticated";
const AUTH_EMAIL_KEY = "wfAdminEmail";

export function isAdminAuthenticated() {
  return sessionStorage.getItem(AUTH_FLAG) === "true" && Boolean(auth.currentUser);
}

export function getAdminEmail() {
  return sessionStorage.getItem(AUTH_EMAIL_KEY) || auth.currentUser?.email || "";
}

export function setAdminSession(email = "") {
  sessionStorage.setItem(AUTH_FLAG, "true");
  if (email) {
    sessionStorage.setItem(AUTH_EMAIL_KEY, email);
  }
}

export function clearAdminSession() {
  sessionStorage.removeItem(AUTH_FLAG);
  sessionStorage.removeItem(AUTH_EMAIL_KEY);
}

async function getIdToken(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) {
    return "";
  }

  return user.getIdToken(forceRefresh);
}

export async function verifyAdminSession() {
  const idToken = await getIdToken(true);

  if (!idToken) {
    throw new Error("Sign in with Google first");
  }

  const response = await fetch("/api/admin/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify({ idToken })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    clearAdminSession();
    throw new Error(data.error || "Not authorized for admin");
  }

  setAdminSession(data.email || auth.currentUser?.email || "");
  return data;
}

export async function adminRequest(path, options = {}) {
  const idToken = await getIdToken();

  if (!idToken) {
    clearAdminSession();
    throw new Error("Sign in with Google to use admin tools");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${idToken}`,
    ...(options.headers || {})
  };

  const response = await fetch(path, {
    ...options,
    headers,
    body:
      options.body == null
        ? undefined
        : typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body)
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 || response.status === 403) {
    clearAdminSession();
    throw new Error(data.error || "Admin session expired. Sign in again.");
  }

  if (!response.ok) {
    throw new Error(data.error || `Admin request failed (${response.status})`);
  }

  return data;
}

export async function adminGetListings() {
  const data = await adminRequest("/api/admin/listings");
  return data.listings || [];
}

export async function adminUpdateListing(id, updates) {
  const data = await adminRequest("/api/admin/listings", {
    method: "PATCH",
    body: { id, updates }
  });
  return data.listing;
}

export async function adminDeleteListing(id) {
  return adminRequest(`/api/admin/listings?id=${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}

export async function adminUpsertListings(listings, { merge = true } = {}) {
  const payload = Array.isArray(listings) ? { listings, merge } : { listing: listings, merge };
  return adminRequest("/api/admin/listings", {
    method: "POST",
    body: payload
  });
}

export async function adminGetSubmissions(status = "pending") {
  const data = await adminRequest(`/api/admin/submissions?status=${encodeURIComponent(status)}`);
  return data.submissions || [];
}

export async function adminApproveSubmission(id, listing) {
  return adminRequest("/api/admin/submissions", {
    method: "POST",
    body: { action: "approve", id, listing }
  });
}

export async function adminRejectSubmission(id) {
  return adminRequest("/api/admin/submissions", {
    method: "POST",
    body: { action: "reject", id }
  });
}
