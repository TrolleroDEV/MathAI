from flask import Flask, request, jsonify
from flask_cors import CORS
from calculator import resolver_matematica

app = Flask(__name__)
# Habilitar CORS para permitir peticiones desde el frontend HTML/JS
CORS(app)

def limpiar_expresion(expr_texto):
    """
    Limpia la cadena ingresada por el usuario eliminando 'f(x) =', 'y =' 
    y convirtiendo superíndices Unicode u operadores '^' a la sintaxis de Python.
    """
    if not isinstance(expr_texto, str):
        return str(expr_texto)
        
    # Eliminar asignaciones de función iniciales como f(x) = o y =
    if '=' in expr_texto:
        partes = expr_texto.split('=')
        if 'f(' in partes[0] or 'y' in partes[0] or 'x' in partes[0]:
            expr_texto = partes[1]

    # Reemplazar superíndices Unicode comunes y '^' por notación de potencias (**)
    reemplazos = {
        '¹': '**1',
        '²': '**2',
        '³': '**3',
        '⁴': '**4',
        '⁵': '**5',
        '⁶': '**6',
        '⁷': '**7',
        '⁸': '**8',
        '⁹': '**9',
        '⁰': '**0',
        '^': '**'
    }
    for orig, remplazo in reemplazos.items():
        expr_texto = expr_texto.replace(orig, remplazo)
        
    return expr_texto.strip()

@app.route("/api/resolver", methods=["POST"])
def resolver():
    data = request.json
    
    tipo = data.get("tipo", "algebra")            # algebra, limite, derivada, integral
    expresion_bruta = data.get("expresion", "")      # Ej: f(x) = x³ - 6x² + 9x + 1
    variable = data.get("variable", "x")
    limite_punto = data.get("limite_punto", 0) # Utilizado en el módulo de límites

    if not expresion_bruta.strip():
        return jsonify({"estatus": "error", "mensaje": "Por favor ingresa una función o expresión matemática."}), 400

    # Limpiamos la expresión antes de enviarla al calculador
    expresion_limpia = limpiar_expresion(expresion_bruta)

    respuesta = resolver_matematica(tipo, expresion_limpia, variable, limite_punto)
    return jsonify(respuesta)

if __name__ == "__main__":
    print("Servidor de MathAI ejecutándose en http://localhost:5000")
    app.run(debug=True, port=5000)