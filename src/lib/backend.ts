import { createHmac } from "node:crypto";
import { auth } from "@/lib/auth";

const apiUrl = process.env.IRONFIT_API_URL || "http://localhost:8080";

type Identity = { id: string; email?: string | null; role?: string | null };

function identityHeaders(user: Identity) {
  const secret = process.env.IRONFIT_BRIDGE_SECRET;
  if (!secret) throw new Error("IRONFIT_BRIDGE_SECRET is required");
  const timestamp = String(Math.floor(Date.now() / 1000));
  const email = user.email ?? "";
  const role = user.role ?? "user";
  const signature = createHmac("sha256", secret).update(`${user.id}:${email}:${role}:${timestamp}`).digest("base64url");
  return {
    "X-Ironfit-User": user.id,
    "X-Ironfit-Email": email,
    "X-Ironfit-Role": role,
    "X-Ironfit-Timestamp": timestamp,
    "X-Ironfit-Signature": signature,
  };
}

export async function backendRequest(path: string, init: RequestInit = {}, user?: Identity | null) {
  const headers = new Headers(init.headers);
  if (user?.id) for (const [key, value] of Object.entries(identityHeaders(user))) headers.set(key, value);
  return fetch(`${apiUrl}${path}`, { ...init, headers, cache: "no-store" });
}

export async function proxyBackendRequest(request: Request, path: string, requireAuth = true) {
  const session = requireAuth ? await auth() : null;
  const user = session?.user;
  if (requireAuth && !user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const init: RequestInit = { method: request.method, headers };
  if (request.method !== "GET" && request.method !== "HEAD") init.body = await request.arrayBuffer();
  const upstream = await backendRequest(path, init, user?.id ? user : null);
  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) responseHeaders.set("content-type", upstreamType);
  return new Response(await upstream.arrayBuffer(), { status: upstream.status, headers: responseHeaders });
}

export async function backendJson<T>(path: string, user: Identity): Promise<T> {
  const response = await backendRequest(path, {}, user);
  if (!response.ok) throw new Error(`Backend request failed (${response.status})`);
  return response.json() as Promise<T>;
}
