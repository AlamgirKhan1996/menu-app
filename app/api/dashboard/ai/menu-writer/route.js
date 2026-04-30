import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemName, category, price } = await request.json();
  if (!itemName) return NextResponse.json({ error: "Item name required" }, { status: 400 });

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.restaurantId },
    select: { name: true, city: true },
  });

  const prompt = `You are a professional menu copywriter for GCC/Arab restaurants.

Restaurant: ${restaurant?.name || "Restaurant"} (${restaurant?.city || "Riyadh"})
Dish: ${itemName}
Category: ${category || "Main Course"}
Price: SAR ${price || ""}

Write appetizing menu descriptions:
- English: 1-2 sentences, mouth-watering, max 120 characters
- Arabic: Perfect Arabic for Saudi/GCC market, max 120 characters
- Highlight ingredients, cooking method, or unique quality
- Do NOT mention price or restaurant name

Respond ONLY with valid JSON, no markdown:
{"descriptionEn": "...", "descriptionAr": "..."}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].text.trim();
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json({
      descriptionEn: parsed.descriptionEn || "",
      descriptionAr: parsed.descriptionAr || "",
    });
  } catch (error) {
    console.error("AI error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}