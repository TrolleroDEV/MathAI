async function enviarPrompt() {
    const textarea = document.getElementById('promptUsuario');
    const texto = textarea.value;
    if (!texto.trim()) return;

    const container = document.getElementById('chatContainer');
    
    // 1. Mostrar la pregunta del usuario
    container.innerHTML += `
        <div class="resultado-box user-query">
            <strong>Tú:</strong>
            <p>${texto}</p>
        </div>
    `;

    textarea.value = '';

    // 2. Mostrar indicador de carga mientras responde la IA
    const loadingId = 'loading-' + Date.now();
    container.innerHTML += `
        <div class="resultado-box" id="${loadingId}">
            <strong>MathAI 🤖:</strong>
            <p>Pensando la solución y preparando la gráfica...</p>
        </div>
    `;
    container.scrollTop = container.scrollHeight;

    try {
        // 3. Conectar con tu backend en Render
        const URL_BACKEND = 'https://mathai-hzgl.onrender.com/api/resolver'; // O 'http://localhost:5000/api/resolver' para pruebas locales

        const response = await fetch(URL_BACKEND, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: texto })
        });

        const data = await response.json();

        // Eliminar mensaje de carga
        document.getElementById(loadingId).remove();

        if (data.estatus === 'exito') {
            // Mostrar la explicación paso a paso de la IA
            let pasosHtml = '';
            data.pasos.forEach(paso => {
                pasosHtml += `<p>${paso.replace(/\n/g, '<br>')}</p>`;
            });

            let htmlRespuesta = `
                <div class="resultado-box">
                    <h3>Solución de MathAI 🤖✨</h3>
                    ${pasosHtml}
            `;

            // Si hay datos de gráfica, agregamos un indicador visual
            if (data.x_vals && data.y_vals) {
                htmlRespuesta += `
                    <div style="margin-top: 15px; padding: 10px; background-color: #0d1117; border-radius: 8px; text-align: center;">
                        <p style="color: #8b949e; font-size: 14px;">📊 Gráfica matemática generada con éxito</p>
                    </div>
                `;
            }

            htmlRespuesta += `</div>`;
            container.innerHTML += htmlRespuesta;

        } else {
            container.innerHTML += `
                <div class="resultado-box" style="border-left: 4px solid #f85149;">
                    <strong>Error:</strong>
                    <p>${data.mensaje}</p>
                </div>
            `;
        }

    } catch (error) {
        document.getElementById(loadingId).remove();
        container.innerHTML += `
            <div class="resultado-box" style="border-left: 4px solid #f85149;">
                <strong>Error de conexión:</strong>
                <p>No se pudo conectar con el servidor de MathAI. Asegúrate de que esté activo.</p>
            </div>
        `;
    }

    container.scrollTop = container.scrollHeight;
}