type ApiMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface ApiOptions {
  method?: ApiMethod;
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
}

export async function callApi<T>(
  url: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = "GET", headers = {}, body, credentials } = options;
  const finalUrl = `http://localhost:3030${url}`;

  const response = await fetch(finalUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: credentials || "same-origin", // Add credentials for cookies if needed
  });

  if (!response.ok) {
    // Try to parse error message from response
    let errorMessage = `API error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage += ` - ${errorData.message || JSON.stringify(errorData)}`;
    } catch {
      // Ignore if response is not JSON
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}