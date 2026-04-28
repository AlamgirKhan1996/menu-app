import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Providers from "./providers";
import Sidebar from "./components/Sidebar";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/restaurant-auth/signin");

  return (
    <Providers>
      <div style={{ display: "flex", minHeight: "100vh", background: "#0A0C0E" }}>
        <Sidebar restaurant={session.user} />
        <main style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </Providers>
  );
}