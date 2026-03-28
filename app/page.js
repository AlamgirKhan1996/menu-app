import { redirect } from "next/navigation";

/**
 * Root page — redirect to the default demo restaurant.
 * In production, you'd redirect to a marketing page or client login.
 */
export default function RootPage() {
  redirect("/smash-kitchen");
}
