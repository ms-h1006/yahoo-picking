export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { image, mimeType, prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'VercelにGEMINI_API_KEYが設定されていません。' });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: mimeType || "image/jpeg", data: image } }
          ]
        }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(400).json({ error: `Google APIエラー: ${data.error.message}` });
    }

    const resultText = data.candidates[0].content.parts[0].text;
    res.status(200).json({ result: JSON.parse(resultText) });
  } catch (error) {
    res.status(500).json({ error: `サーバー処理エラー: ${error.message}` });
  }
}
