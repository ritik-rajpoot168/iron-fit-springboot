import { proxyBackendRequest } from "@/lib/backend";
type Context = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";
async function forward(req: Request, ctx: Context) { const { id } = await ctx.params; return proxyBackendRequest(req, `/api/plans/${encodeURIComponent(id)}`); }
export async function GET(req: Request, ctx: Context) { return forward(req, ctx); }
export async function DELETE(req: Request, ctx: Context) { return forward(req, ctx); }
export async function PATCH(req: Request, ctx: Context) { return forward(req, ctx); }
export async function PUT(req: Request, ctx: Context) { return forward(req, ctx); }
