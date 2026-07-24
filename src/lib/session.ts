import { cache } from "react";
import { auth } from "@/auth";

/**
 * Shares the authenticated session between a protected layout and its page
 * during a single server render.
 */
export const getCurrentSession = cache(async () => auth());
