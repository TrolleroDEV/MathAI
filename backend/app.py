from flask import Flask, request, jsonify
from flask_cors import CORS
from calculator import resolver_matematica

app = Flask(__name__)
# Habilitar CORS para permitir peticiones desde el frontend HTML/JS
CORS(app)

@app.route("/api/resolver", methods=["POST"])
def resolver():
    data = request.json
    
    tipo = data.get("tipo", "algebra")         # algebra, limite, derivada, integral
    expresion = data.get("expresion", "")      # Ej: x^2 + 2*x + 1
    variable = data.get("variable", "x")
    limite_punto = data.get("limite_punto", 0) # Utilizado en el módulo de límites

    if not expresion.strip():
        return jsonify({"estatus": "error", "mensaje": "Por favor ingresa una función o expresión matemática."}), 400

    respuesta = resolver_matematica(tipo, expresion, variable, limite_punto)
    return jsonify(respuesta)

if __name__ == "__main__":
    print("Servidor de MathAI ejecutándose en http://localhost:5000")
    app.run(debug=True, port=5000)