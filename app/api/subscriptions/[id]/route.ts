import { NextResponse } from "next/server";
import { deleteSubscription } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

// Auth-gated mutation — never cache.
export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await deleteSubscription(id);

  return new NextResponse(null, { status: 204 });
}
