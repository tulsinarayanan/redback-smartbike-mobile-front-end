import { Platform } from "react-native";

const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5001";
  }
  return "http://localhost:5001";
};

export const callHealthyBot = async ({ user_id, message }) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/ai/coach/chat`;

  console.log(`[HealthyBot API] Attempting POST ${url} with user_id=${user_id}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id, message }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.warn(`[HealthyBot API] Request failed: ${url} → status ${response.status}`, data);
      throw new Error(data?.message || `Healthy Bot request failed (${response.status}) at ${url}`);
    }

    console.log(`[HealthyBot API] Success: ${url} → status ${response.status}`);
    // Expected { reply: string, context_used: object }
    return data;
  } catch (err) {
    console.error(`[HealthyBot API] Network error for ${url}:`, err?.message || err, err?.stack || "");
    // Enhance error with attempted URL for UI
    const networkError = new Error(`Failed to fetch (API at '${baseUrl}') - ${err.message || "Network request failed"}`);
    networkError.cause = err;
    networkError.attemptedUrl = url;
    throw networkError;
  }
};

export const getHealthyBotApiBase = getApiBaseUrl;
