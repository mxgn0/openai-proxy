export default async function handler(req, res) {
  // CORS für deinen Browser (GitHub Pages)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONS Preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Nur POST zulassen
  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST requests allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "OPENAI_API_KEY not set" });
    return;
  }

  try {
    const { hunger, mood, energy } = req.body;

    const prompt = `Du bist ein Tamagotchi mit folgenden Werten:
- Hunger: ${hunger}/100
- Laune: ${mood}/100
- Energie: ${energy}/100

Sage dem Benutzer auf DEUTSCH in maximal einem Satz, was du am meisten brauchst. Sprich wie ein kleines Wesen in Ich-Form.`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await openaiRes.json();

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      console.error("GPT response leer:", data);
      return res.status(500).json({ error: "GPT response leer", raw: data });
    }

    res.status(200).json({ reply });
  } catch (err) {
    console.error("GPT Fehler:", err);
    res.status(500).json({ error: "Fehler bei GPT-Proxy", details: err.message });
  }
}
