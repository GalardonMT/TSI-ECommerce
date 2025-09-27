const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetcher(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error("Error en la petición");
  return res.json();
}
