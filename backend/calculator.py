import sympy as sp
import numpy as np
import os
from google import genai

def limpiar_expresion(expr_texto):
    """
    Limpia la cadena ingresada por el usuario eliminando 'f(x) =', 'y =' 
    y convirtiendo superíndices Unicode u operadores '^' a la sintaxis de Python.
    """
    if not isinstance(expr_texto, str):
        return str(expr_texto)
        
    if '=' in expr_texto:
        partes = expr_texto.split('=')
        if 'f(' in partes[0] or 'y' in partes[0] or 'x' in partes[0]:
            expr_texto = partes[1]

    reemplazos = {
        '¹': '**1', '²': '**2', '³': '**3', '⁴': '**4', '⁵': '**5',
        '⁶': '**6', '⁷': '**7', '⁸': '**8', '⁹': '**9', '⁰': '**0',
        '^': '**'
    }
    for orig, remplazo in reemplazos.items():
        expr_texto = expr_texto.replace(orig, remplazo)
        
    return expr_texto.strip()

def resolver_matematica_ia(prompt_usuario):
    """
    Procesa la petición en lenguaje natural usando la API de Gemini 
    junto con SymPy y NumPy para asegurar precisión matemática y explicaciones pedagógicas.
    """
    try:
        # Inicializar el cliente de Google GenAI usando la variable de entorno
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return {
                "estatus": "error", 
                "mensaje": "Falta configurar la variable de entorno GEMINI_API_KEY en el servidor."
            }

        client = genai.Client(api_key=api_key)

        # 1. Usar IA para interpretar la solicitud, extraer la expresión y redactar los pasos pedagógicos
        prompt_sistema = """
        Eres MathAI, un profesor experto en precálculo y matemáticas. 
        El usuario te enviará una consulta en lenguaje natural sobre un problema matemático.
        Debes responder estrictamente en formato JSON plano (sin bloques de código markdown adicionales) con la siguiente estructura:
        {
            "explicacion_pasos": "Una explicación detallada, pedagógica y paso a paso de cómo resolver el problema.",
            "expresion_sympy": "La expresión matemática pura extraída para ser evaluada por Python (ej: x**3 - 6*x**2 + 9*x + 1), o 'ninguna' si es puramente conceptual.",
            "tipo_operacion": "algebra, derivada, limite, integral, grafica o general"
        }
        """

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"{prompt_sistema}\n\nConsulta del usuario: {prompt_usuario}"
        )

        import json
        # Limpiar posibles marcas de bloque de código de la respuesta de la IA
        texto_respuesta = response.text.strip()
        if texto_respuesta.startswith("```json"):
            texto_respuesta = texto_respuesta[7:]
        if texto_respuesta.endswith("```"):
            texto_respuesta = texto_respuesta[:-3]
            
        datos_ia = json.loads(texto_respuesta.strip())
        
        explicacion = datos_ia.get("explicacion_pasos", "No se pudo generar explicación.")
        expr_extraida = datos_ia.get("expresion_sympy", "")
        tipo_op = datos_ia.get("tipo_operacion", "general")

        pasos = [explicacion]
        x_vals = None
        y_vals = None

        # 2. Si la IA extrajo una expresión matemática válida, calculamos con SymPy y NumPy
        if expr_extraida and expr_extraida != "ninguna":
            x = sp.Symbol('x')
            expr_limpia = limpiar_expresion(expr_extraida)
            expr = sp.sympify(expr_limpia)

            # Generar datos de gráfica por defecto para enriquecer la respuesta
            x_vals_np = np.linspace(-10, 10, 100)
            y_vals_temp = []
            try:
                f_lambdified = sp.lambdify(x, expr, "numpy")
                for val in x_vals_np:
                    y_val = float(f_lambdified(val))
                    if np.isnan(y_val) or np.isinf(y_val):
                        y_vals_temp.append(None)
                    else:
                        y_vals_temp.append(y_val)
                x_vals = x_vals_np.tolist()
                y_vals = y_vals_temp
            except Exception:
                pass

        return {
            "estatus": "exito",
            "tipo_salida": "grafica" if y_vals else "texto",
            "pasos": pasos,
            "x_vals": x_vals,
            "y_vals": y_vals
        }

    except Exception as e:
        return {"estatus": "error", "mensaje": f"Error al procesar con la IA: {str(e)}"}