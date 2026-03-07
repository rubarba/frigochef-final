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
        model: 'claude-3-5-haiku-latest',
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
