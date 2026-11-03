import { proxyBackendRequest } from "@/lib/backend";
export async function POST(req: Request) { return proxyBackendRequest(req, "/api/auth/register", false); }
