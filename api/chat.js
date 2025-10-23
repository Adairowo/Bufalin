import { GoogleGenerativeAI } from "@google/generative-ai";



export const config = { runtime: 'edge' };


const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  // Esto se registrará en los logs de Vercel si la clave no está configurada.
  console.error("GOOGLE_API_KEY no está configurada en las variables de entorno.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    if (!apiKey) {
      throw new Error("La clave de API del servidor no está configurada.");
    }

    const { message } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'No message provided' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
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
    // Devuelve un mensaje de error más específico si es un problema de configuración.
    const errorMessage = error.message.includes("API del servidor no está configurada")
      ? "Error de configuración en el servidor."
      : "Error al contactar la IA.";
    return new Response(errorMessage, { status: 500 });
  }
}