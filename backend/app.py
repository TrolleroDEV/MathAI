from flask import Flask, request, jsonify
from flask_cors import CORS
from calculator import resolver_matematica_ia

app = Flask(__name__)
# Habilitar CORS para permitir peticiones desde el frontend en Netlify
CORS(app)

@app.route("/api/resolver", methods=["POST"])
def resolver():
    data = request.json
    prompt_usuario = data.get("prompt", "")

    if not prompt_usuario.strip():
        return jsonify({"estatus": "error", "mensaje": "Por favor ingresa una consulta o problema matemático."}), 400

    # Llamar al nuevo motor inteligente basado en IA
    respuesta = resolver_matematica_ia(prompt_usuario)
    return jsonify(respuesta)

if __name__ == "__main__":
    print("Servidor de MathAI ejecutándose en http://localhost:5000")
    app.run(debug=True, port=5000)