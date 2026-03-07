export const config = {
  runtime: 'edge',
};

const API_KEY = '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';

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { photos } = await request.json();

    // Preparar imagens
    const imageParts = photos.map(photo => {
      const base64Data = photo.split(',')[1];
      let mediaType = 'image/jpeg';
      if (photo.startsWith('data:image/png')) {
        mediaType = 'image/png';
      } else if (photo.startsWith('data:image/webp')) {
        mediaType = 'image/webp';
      }
      
      return {
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType,
          data: base64Data
        }
      };
    });

    // Chamar Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-latest',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            ...imageParts,
            {
              type: "text",
              text: `Analisa estas imagens do frigorífico/cozinha e lista APENAS os alimentos que vês CLARAMENTE.

REGRAS CRÍTICAS:
- NUNCA inventes ingredientes
- NUNCA assumes o que está dentro de embalagens fechadas
- Lista APENAS o que vês DIRECTAMENTE e COM CERTEZA
- Prefere detectar MENOS do que inventar

Responde APENAS em JSON válido (sem markdown):
{"ingredients": ["ingrediente1", "ingrediente2"]}

Português de Portugal.`
            }
          ]
        }]
      })
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
