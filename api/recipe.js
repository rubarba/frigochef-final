export const config = {
  runtime: 'edge',
};

const API_KEY = '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';

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { recipeName, ingredients } = await request.json();

    // Chamar Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: `Cria receita completa de: "${recipeName}"

Ingredientes disponíveis: ${ingredients.join(', ')}.

Responde APENAS em JSON:
{
  "recipe": {
    "name": "${recipeName}",
    "time": "30 min",
    "difficulty": "Fácil",
    "ingredients": ["250g de X", "..."],
    "steps": ["Passo detalhado 1", "..."]
  }
}

Português de Portugal.`
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
