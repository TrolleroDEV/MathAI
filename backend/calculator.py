import os
from groq import Groq

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def resolver_matematica_ia(prompt_usuario):
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "Eres MathAI, un asistente experto en matemáticas y cálculo. Responde de forma estructurada, dividiendo la solución en pasos claros."
                },
                {
                    "role": "user",
                    "content": prompt_usuario
                }
            ],
            temperature=0.1,
            max_tokens=1024
        )

        respuesta_texto = completion.choices[0].message.content
        pasos = [p.strip() for p in respuesta_texto.split('\n') if p.strip()]

        return {
            "estatus": "exito",
            "pasos": pasos,
            "x_vals": [],
            "y_vals": []
        }

    except Exception as e:
        return {
            "estatus": "error",
            "mensaje": f"Error al procesar con Groq: {str(e)}"
        }