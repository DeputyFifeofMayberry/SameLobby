import { now } from "./clock";

/** ISO timestamp for explicit SQL fixtures (prefer over JS timer drift). */
export function sqlTimestamp(offsetMs = 0): string {
  return new Date(now().getTime() + offsetMs).toISOString();
}
