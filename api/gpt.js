export default async function handler(req, res) {
  // CORS Header setzen
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Preflight-Anfrage abfangen
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST requests allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing OpenAI API key" });
    return;
  }

  const { hunger, mood, energy } = req.body;
  const prompt = `Ich bin ein Tamagotchi. Mein Hunger ist bei ${hunger}, meine Laune bei ${mood} und meine Energie bei ${energy}. Was brauche ich am dringendsten?`;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await openaiRes.json();
    res.status(200).json({ reply: data.choices?.[0]?.message?.content || "Ich bin verwirrt..." });
  } catch (error) {
    res.status(500).json({ error: "OpenAI request failed", details: error.message });
  }
}
