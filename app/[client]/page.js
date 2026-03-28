import { notFound } from "next/navigation";
import { getClient, getAllClientSlugs } from "@/data/clients";
import RestaurantPage from "@/sections/RestaurantPage";

/* ── Static generation ────────────────────────────────────────────────────── */
export async function generateStaticParams() {
  return getAllClientSlugs().map((slug) => ({ client: slug }));
}

/* ── Dynamic metadata per restaurant ─────────────────────────────────────── */
export async function generateMetadata({ params }) {
  const client = getClient(params.client);
  if (!client) return {};

  return {
    title: `${client.name} — Order via WhatsApp`,
    description: client.description,
    openGraph: {
      title: `${client.name} ${client.emoji}`,
      description: `${client.tagline} — Order now via WhatsApp`,
      type: "website",
    },
    icons: {
      icon: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${client.emoji}</text></svg>`,
    },
  };
}

/* ── Page component ───────────────────────────────────────────────────────── */
export default function ClientPage({ params }) {
  const client = getClient(params.client);
  if (!client) notFound();

  return <RestaurantPage client={client} />;
}
