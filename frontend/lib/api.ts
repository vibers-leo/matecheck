import * as SecureStore from "expo-secure-store";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "https://matecheck.vibers.co.kr/api";
const TOKEN_KEY = "matecheck_auth_token";

export async function getAuthToken() {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setAuthToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeAuthToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await removeAuthToken();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * MateCheck API Endpoints
 */
export const login = (data: any) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) });
export const fetchChoreRotation = () => apiFetch<Chore[]>("/chores");
export const fetchNests = () => apiFetch<Nest[]>("/nests");

export interface Chore {
  id: string;
  title: string;
  assignee: string;
  due_date: string;
  status: "pending" | "completed";
}

export interface Nest {
  id: string;
  name: string;
  members_count: number;
}
