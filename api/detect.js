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

    // Validar resposta antes de fazer .json()
    if (!response.ok) {
      const text = await response.text();
      return new Response(text, { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
