export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY fehlt" });
  }

  const { hunger, mood, energy } = req.body;

  const prompt = `Du bist ein Tamagotchi mit folgenden Werten:
- Hunger: ${hunger}/100
- Laune: ${mood}/100
- Energie: ${energy}/100

Sage dem Benutzer auf DEUTSCH in einem Satz, was du am dringendsten brauchst. Sprich in Ich-Form.`;

  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await groqResponse.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(500).json({ error: "Antwort leer", raw: data });
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Fehler bei Groq:", error);
    res.status(500).json({ error: "Fehler beim Abruf", details: error.message });
  }
}
