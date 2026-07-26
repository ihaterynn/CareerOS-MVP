type Fetcher = (input: string, init: RequestInit) => Promise<Response>;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return uuidPattern.test(value);
}

export function optionalServerEnv(name: string): string | undefined {
  return process.env[name] || undefined;
}

export function requireServerEnv(name: string): string {
  const value = optionalServerEnv(name);
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export async function fetchSupabaseRows<T>(path: string, fetcher: Fetcher = fetch): Promise<T[]> {
  const url = requireServerEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = requireServerEnv("SUPABASE_SERVICE_ROLE_KEY");

  const response = await fetcher(`${url}/rest/v1/${path}`, {
    cache: "no-store",
    headers: { apikey: key, Authorization: `Bearer ${key}` }
  });

  if (!response.ok) throw new Error(`Supabase read failed: ${response.status}`);
  return response.json() as Promise<T[]>;
}
