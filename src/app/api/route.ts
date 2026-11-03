import { proxyBackendRequest } from "@/lib/backend";
export const dynamic = "force-dynamic";
export async function GET(req: Request) { return proxyBackendRequest(req, "/", false); }
