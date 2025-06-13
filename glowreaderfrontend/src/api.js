const BASE_URL = import.meta.env.VITE_API_URL;

export async function getGlowResponse(skinType, concern) {
  try {
    const response = await fetch(`${BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skinType, concern }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.result) {
      throw new Error('No result returned from backend.');
    }

    return data.result;
  } catch (error) {
    console.error('🔥 Error from API:', error.message);
    return `❌ Error: ${error.message}`;
  }
}
