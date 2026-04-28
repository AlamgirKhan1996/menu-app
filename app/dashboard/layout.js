import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Providers from "./providers";    

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/restaurant-auth/signin");
  return (
    <Providers>
      {children}
    </Providers>
  );
}