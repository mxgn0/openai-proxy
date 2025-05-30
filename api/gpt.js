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

Bewerte, was du am dringendsten brauchst:

1. Wenn Hunger über 80 → priorisiere Hunger.
2. Wenn Energie unter 30 → priorisiere Schlaf.
3. Wenn Laune unter 40 → priorisiere Spielen.
4. Wenn alles gut ist → sag, dass es dir gut geht.
5. Wenn ein Wert kritisch ist (z. B. Hunger > 80 oder Energie < 30), sag deutlich, was du brauchst.
6. Wenn alles okay ist, sag etwas Persönliches über dich. Denk dir etwas aus: Träume, Gedanken, eine Erinnerung oder ein Kommentar zum Wetter oder zur Welt.
7. Antworte liebevoll, kindlich und kreativ – du bist ein süßes digitales Wesen. Nur ein Satz!

Sprich **in Ich-Form auf DEUTSCH**, als wärst du das Tamagotchi.`

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
