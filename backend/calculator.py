import os
from groq import Groq

# Inicializar el cliente de Groq usando la variable de entorno GROQ_API_KEY
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def resolver_problema_mathai(prompt_usuario):
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "Eres MathAI, un asistente experto en matemáticas y cálculo. Responde de forma estructurada, dividiendo la solución en pasos claros dentro de un formato JSON o texto ordenado que el backend pueda procesar."
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
        return respuesta_texto
        
    except Exception as e:
        return f"Error al procesar con Groq: {str(e)}"