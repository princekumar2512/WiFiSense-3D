const API_BASE = "http://localhost:8000/api/v1";

export interface ApiTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  email: string;
  role: string;
  permissions: string[];
}

export async function loginUser(email: string, password: string): Promise<ApiTokenResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    throw new Error(`Login failed: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchBuildingConfig(buildingId: string = "hostel-block-alpha") {
  try {
    const res = await fetch(`${API_BASE}/buildings/${buildingId}`);
    if (!res.ok) throw new Error("Failed to load building");
    return await res.json();
  } catch (err) {
    console.warn("Backend offline or unreachable, using local store cache.", err);
    return null;
  }
}

export async function persistBuildingConfig(buildingId: string, payload: Record<string, unknown>, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/buildings/${buildingId}/save-config`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error(`Failed to persist building configuration: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchLiveAnalytics() {
  try {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    if (!res.ok) throw new Error("Failed to fetch analytics");
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function grantConsentOnBackend(userId: string, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/consent/grant`, {
    method: "POST",
    headers,
    body: JSON.stringify({ user_id: userId, purpose: "Indoor spatial sensing telemetry" })
  });
  return res.json();
}

export async function revokeConsentOnBackend(userId: string, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/consent/revoke`, {
    method: "POST",
    headers,
    body: JSON.stringify({ user_id: userId, reason: "User revoked" })
  });
  return res.json();
}
