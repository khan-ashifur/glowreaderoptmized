const BASE_URL = import.meta.env.VITE_API_URL;

export async function getGlowResponse(skinType, concern) {
  const response = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ skinType, concern }),
  });

  const data = await response.json();
  return data.result;
}
