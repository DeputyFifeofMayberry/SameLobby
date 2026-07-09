import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function isRegistrationCapReached(): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("registration_cap_reached");
    if (error) return false;
    return data === true;
  } catch {
    return false;
  }
}
