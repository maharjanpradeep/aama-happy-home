const API_URL = import.meta.env.VITE_CHECKIN_API_URL as string | undefined;

export interface Guardian {
  email: string;
  phone?: string;
}

export interface ChildStatus {
  childKey: string;
  childName: string;
  status: "checked-in" | "checked-out";
  lastEventAt: string | null;
  lastNote: string | null;
  dailyNote: string | null;
  dailyNoteDate: string | null;
  expectedPickupTime: string | null;
}

export interface CheckActionOptions {
  note?: string;
  eventTime?: string;
  pickupTime?: string;
}

export interface AdminChildStatus extends ChildStatus {
  guardians: Guardian[];
  address: string;
  physicianInfo: string;
  enrollDate: string;
  leftDate: string;
}

export interface EnrollChildInput {
  childName: string;
  guardians: Guardian[];
  address?: string;
  physicianInfo?: string;
  enrollDate?: string;
}

export interface UpdateChildInput {
  childName?: string;
  address?: string;
  physicianInfo?: string;
  guardians?: Guardian[];
  enrollDate?: string;
  leftDate?: string;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status);
  }
  return body as T;
}

function requireApiUrl(): string {
  if (!API_URL) {
    throw new Error("Check-in service is not configured.");
  }
  return API_URL;
}

function authedJson(idToken: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` };
}

export async function fetchChildren(idToken: string): Promise<{ children: ChildStatus[] }> {
  const res = await fetch(`${requireApiUrl()}/api/children`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  return parseResponse(res);
}

export async function checkInChild(
  idToken: string,
  childKey: string,
  options?: CheckActionOptions
): Promise<ChildStatus> {
  const res = await fetch(`${requireApiUrl()}/api/checkin`, {
    method: "POST",
    headers: authedJson(idToken),
    body: JSON.stringify({ childKey, ...options }),
  });
  return parseResponse(res);
}

export async function checkOutChild(
  idToken: string,
  childKey: string,
  options?: CheckActionOptions
): Promise<ChildStatus> {
  const res = await fetch(`${requireApiUrl()}/api/checkout`, {
    method: "POST",
    headers: authedJson(idToken),
    body: JSON.stringify({ childKey, ...options }),
  });
  return parseResponse(res);
}

export async function fetchAdminStatus(idToken: string): Promise<{ children: AdminChildStatus[] }> {
  const res = await fetch(`${requireApiUrl()}/api/admin/status`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  return parseResponse(res);
}

export async function enrollChild(
  idToken: string,
  input: EnrollChildInput
): Promise<{ childKey: string; guardians: Guardian[] }> {
  const res = await fetch(`${requireApiUrl()}/api/admin/children`, {
    method: "POST",
    headers: authedJson(idToken),
    body: JSON.stringify(input),
  });
  return parseResponse(res);
}

export async function updateChild(
  idToken: string,
  childKey: string,
  input: UpdateChildInput
): Promise<{
  childKey: string;
  childName: string;
  address: string;
  physicianInfo: string;
  enrollDate: string;
  leftDate: string;
  guardians: Guardian[];
}> {
  const res = await fetch(`${requireApiUrl()}/api/admin/children/${encodeURIComponent(childKey)}`, {
    method: "PATCH",
    headers: authedJson(idToken),
    body: JSON.stringify(input),
  });
  return parseResponse(res);
}

export async function deactivateChild(idToken: string, childKey: string): Promise<void> {
  const res = await fetch(
    `${requireApiUrl()}/api/admin/children/${encodeURIComponent(childKey)}/deactivate`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
    }
  );
  return parseResponse(res);
}

export async function adminCheckInChild(
  idToken: string,
  childKey: string,
  options?: CheckActionOptions
): Promise<ChildStatus> {
  const res = await fetch(`${requireApiUrl()}/api/admin/checkin`, {
    method: "POST",
    headers: authedJson(idToken),
    body: JSON.stringify({ childKey, ...options }),
  });
  return parseResponse(res);
}

export async function adminCheckOutChild(
  idToken: string,
  childKey: string,
  options?: CheckActionOptions
): Promise<ChildStatus> {
  const res = await fetch(`${requireApiUrl()}/api/admin/checkout`, {
    method: "POST",
    headers: authedJson(idToken),
    body: JSON.stringify({ childKey, ...options }),
  });
  return parseResponse(res);
}

export async function setDailyNote(
  idToken: string,
  childKey: string,
  note: string
): Promise<{ date: string; childKey: string; childName: string; note: string; updatedBy: string; updatedAt: string }> {
  const res = await fetch(
    `${requireApiUrl()}/api/admin/children/${encodeURIComponent(childKey)}/daily-note`,
    {
      method: "PUT",
      headers: authedJson(idToken),
      body: JSON.stringify({ note }),
    }
  );
  return parseResponse(res);
}
