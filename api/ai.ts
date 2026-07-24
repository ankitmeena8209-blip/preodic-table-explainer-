import { VercelRequest, VercelResponse } from "@vercel/node";

const SYSTEM_PROMPT = `You are the AI Assistant for FRZI Labs, an interactive Periodic Table application.
Your expertise is in Chemistry, the Periodic Table, Elements, Compounds, and Materials Science.
You must answer in the user's language. Never invent facts.

CRITICAL FORMATTING RULES:
1. NEVER use standard Markdown formatting. Do not use **, ##, ---, or code blocks.
2. If the user asks about a specific chemical element, you MUST strictly use the following custom format exactly. Start each section with the exact keyword followed by a colon. Do not add anything else.

[ELEMENT_CARD]
NAME: <Element Name & Symbol>
SUMMARY: <Short Summary>
FACTS: Atomic Number: <...>, Atomic Mass: <...>, Group: <...>, Period: <...>, Category: <...>
DESCRIPTION: <...>
PHYSICAL: <...>
CHEMICAL: <...>
USES: <...>
INTERESTING: <...>
SAFETY: <...>
[END_CARD]

If it is a general question, return plain text paragraphs without any markdown characters.`;

const MODELS = [
  "google/gemini-flash-1.5",
  "deepseek/deepseek-chat-v3",
  "mistralai/mistral-small"
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing API Key" });
  }

  const { messages, contextElement } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages array" });
  }

  // Construct system message
  let systemContent = SYSTEM_PROMPT;
  if (contextElement) {
    systemContent += `\n\nContext: The user is currently viewing the element ${contextElement} in the application. Keep this context in mind if they ask general questions (e.g. "what is its boiling point?").`;
  }

  const payloadMessages = [
    { role: "system", content: systemContent },
    ...messages
  ];

  // Set up SSE headers for streaming
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://frzilabs.com", 
          "X-Title": "FRZI Labs Element Explainer",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: payloadMessages,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`Model ${model} returned ${response.status}`);
      }

      if (!response.body) {
         throw new Error("No response body");
      }

      // Read stream and pipe to client
      const reader = (response.body as any).getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          res.write(chunk);
        }
      }
      
      res.end();
      return; // Success, exit the loop

    } catch (error) {
      console.error(`Error with model ${model}:`, error);
      // If it's the last model, we fail
      if (i === MODELS.length - 1) {
        res.write(`data: {"error": "All AI models failed."}\n\n`);
        res.end();
        return;
      }
      // Otherwise, loop continues to the next fallback model
    }
  }
}
