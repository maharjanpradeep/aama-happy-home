const API_URL = import.meta.env.VITE_CHECKIN_API_URL as string | undefined;

export interface ChildStatus {
  childKey: string;
  childName: string;
  status: "checked-in" | "checked-out";
  lastEventAt: string | null;
}

export interface AdminChildStatus extends ChildStatus {
  parentEmail: string;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return body as T;
}

function requireApiUrl(): string {
  if (!API_URL) {
    throw new Error("Check-in service is not configured.");
  }
  return API_URL;
}

export async function fetchChildren(idToken: string): Promise<{ children: ChildStatus[] }> {
  const res = await fetch(`${requireApiUrl()}/api/children`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  return parseResponse(res);
}

export async function checkInChild(idToken: string, childKey: string): Promise<ChildStatus> {
  const res = await fetch(`${requireApiUrl()}/api/checkin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ childKey }),
  });
  return parseResponse(res);
}

export async function checkOutChild(idToken: string, childKey: string): Promise<ChildStatus> {
  const res = await fetch(`${requireApiUrl()}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ childKey }),
  });
  return parseResponse(res);
}

export async function fetchAdminStatus(adminKey: string): Promise<{ children: AdminChildStatus[] }> {
  const res = await fetch(`${requireApiUrl()}/api/admin/status`, {
    headers: { "x-admin-key": adminKey },
  });
  return parseResponse(res);
}
