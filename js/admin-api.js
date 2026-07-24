const AUTH_FLAG = "adminAuthenticated";
const PASSWORD_KEY = "wfAdminPassword";

export function getAdminPassword() {
  return sessionStorage.getItem(PASSWORD_KEY) || "";
}

export function isAdminAuthenticated() {
  return sessionStorage.getItem(AUTH_FLAG) === "true" && Boolean(getAdminPassword());
}

export function setAdminSession(password) {
  sessionStorage.setItem(AUTH_FLAG, "true");
  sessionStorage.setItem(PASSWORD_KEY, password);
}

export function clearAdminSession() {
  sessionStorage.removeItem(AUTH_FLAG);
  sessionStorage.removeItem(PASSWORD_KEY);
}

export async function verifyAdminPassword(password) {
  const response = await fetch("/api/admin/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Incorrect password");
  }

  setAdminSession(password);
  return data;
}

export async function adminRequest(path, options = {}) {
  const password = getAdminPassword();

  if (!password) {
    throw new Error("Admin session required. Refresh and sign in again.");
  }

  const headers = {
    "Content-Type": "application/json",
    "X-Admin-Password": password,
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

  if (response.status === 401) {
    clearAdminSession();
    throw new Error("Admin session expired. Refresh and sign in again.");
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
