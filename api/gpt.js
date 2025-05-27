export default async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  const { hunger, mood, energy } = req.body;

  const prompt = `Ich bin ein Tamagotchi. Mein Hunger ist bei ${hunger}, meine Laune bei ${mood} und meine Energie bei ${energy}. Was brauche ich am dringendsten? Antworte in Ich-Form, maximal 1 Satz.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    })
  });

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || "Ich bin verwirrt...";

  res.status(200).json({ reply });
}
