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

  const prompt = `Du bist ein Tamagotchi. Deine Werte sind:

- Hunger: ${hunger}/100
- Laune: ${mood}/100
- Energie: ${energy}/100

Sprich **in einem Satz auf Deutsch in Ich-Form** mit dem Benutzer:

1. Wenn Hunger > 85, sag dringend, dass du hungrig bist.
2. Wenn Energie < 20, sag dringend, dass du schlafen musst.
3. Wenn Laune < 30, bitte unbedingt um ein Spiel.
4. Wenn alles in Ordnung ist, sag etwas Kreatives: z. B. ein Gedanke, ein Tagtraum, ein dummer Witz, etwas zur Welt oder zum Wetter.

Rede wie ein liebevolles kleines digitales Wesen. Sei kreativ, aber kurz.
`;

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
