export const API_URL = process.env.REACT_APP_API_URL;

export async function searchTracks(params) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/tracks/search?${query}`);
  if (!res.ok) throw new Error("Error en búsqueda");
  return res.json();
}

export async function purchase(data) {
  const res = await fetch(`${API_URL}/purchase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail);
  }
  return res.json();
}
