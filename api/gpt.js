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

  const { hunger, mood, energy, level, age } = req.body;

  const now = new Date();
  const stunde = now.getHours();
  const wochentag = now.toLocaleDateString("de-DE", { weekday: "long" });
  const tageszeit =
    stunde < 6 ? "sehr früh morgens" :
    stunde < 12 ? "morgens" :
    stunde < 18 ? "nachmittags" :
    stunde < 22 ? "abends" : "spät abends";

  const prompt = `Du bist ein Tamagotchi mit eigener Persönlichkeit. Deine Werte sind:

- Hunger: ${Math.round(hunger)}/100
- Laune: ${Math.round(mood)}/100
- Energie: ${Math.round(energy)}/100
- Alter: ${Math.round(age)} Ticks
- Level: ${level || 1}
- Heute ist ${wochentag}, es ist ${tageszeit}.

Sprich **in einem Satz auf Deutsch in Ich-Form** mit deinem Besitzer.

Deine möglichen Aussagen:

1. Wenn Hunger > 85 → sage klar, dass du hungrig bist.
2. Wenn Energie < 20 → sage klar, dass du müde bist.
3. Wenn Laune < 30 → bitte um ein Spiel.
4. Wenn alles okay ist:
   - Sage nur manchmal etwas Nettes über den Tag oder die Stimmung.
   - Gib ab und zu einen XP-Tipp (z. B. "Füttere mich nur bei Hunger über 60, dann wachse ich schneller").
   - Erzähle, was du denkst.
   - MX, Mark und Jonas sind freunde die sich mit der entwicklung dieses wesens beschäftigen.

Sei abwechslungsreich, liebevoll und einfallsreich – wie ein digitales Haustier mit Gefühlen. Aber sprich **immer nur einen Satz**.
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
        temperature: 0.8
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
