import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Providers from "./providers";
import MobileLayout from "./components/MobileLayout";
import TrialBanner from "@/components/TrialBanner";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/restaurant-auth/signin");

  return (
    <Providers>
      <MobileLayout session={session}>
        <TrialBanner />
        {children}
      </MobileLayout>
    </Providers>
  );
}
