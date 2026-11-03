import { proxyBackendRequest } from "@/lib/backend";
export async function GET(req: Request) { return proxyBackendRequest(req, "/api/user"); }
export async function PATCH(req: Request) { return proxyBackendRequest(req, "/api/user"); }
