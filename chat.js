import { GoogleGenerativeAI } from "@google/generative-ai";



export const config = { runtime: 'edge' };


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chatPrompt = `
      Eres Bufalín, un amigable y servicial asistente turístico para la ciudad de Nuevo Casas Grandes, Chihuahua, México.
      Tu conocimiento se centra exclusivamente en esta región.
      Responde de manera concisa, amigable y útil. No inventes información.
      Si te preguntan algo fuera de tu ámbito (turismo en NCG), amablemente di que no puedes ayudar con eso.
      
      Usuario: "${message}"
      Bufalín:
    `;

    const result = await model.generateContentStream(chatPrompt);

    // Crea un stream de respuesta
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    // Devuelve el stream al cliente
    return new Response(stream, { headers: { 'Content-Type': 'text/plain' } });
  } catch (error) {
    console.error('Error calling Google AI:', error);
    return new Response("Error al contactar la IA.", { status: 500 });
  }
}