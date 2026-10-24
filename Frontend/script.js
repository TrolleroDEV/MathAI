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
            <p>Procesando tu petición...</p>
        </div>
    `;
    container.scrollTop = container.scrollHeight;

    try {
        // 3. Conectar con tu backend en Render
        const URL_BACKEND = 'https://mathai-hzgl.onrender.com/api/resolver';

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
            let pasosHtml = '';
            
            // Usamos directamente la lista de pasos del backend sin cortarla con expresiones regulares
            if (Array.isArray(data.pasos) && data.pasos.length > 0) {
                data.pasos.forEach(paso => {
                    if (paso && paso.trim() !== '') {
                        pasosHtml += `
                            <div style="background-color: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 14px; margin-bottom: 12px;">
                                <p style="margin: 0; color: #c9d1d9; line-height: 1.6; white-space: pre-line;">${paso.trim()}</p>
                            </div>
                        `;
                    }
                });
            } else {
                pasosHtml = `<p style="color: #c9d1d9; line-height: 1.6;">No hay pasos disponibles.</p>`;
            }

            // ID único para la gráfica con Chart.js
            const canvasId = 'canvas-' + Date.now();
            let tieneGrafica = data.x_vals && data.y_vals && data.x_vals.length > 0;

            let htmlRespuesta = `
                <div class="resultado-box">
                    <h3 style="color: #58a6ff; margin-top: 0;">Solución de MathAI 🤖✨</h3>
                    <div style="margin-top: 15px;">
                        ${pasosHtml}
                    </div>
            `;

            // Si hay datos de gráfica, agregamos el contenedor del canvas
            if (tieneGrafica) {
                htmlRespuesta += `
                    <div style="margin-top: 20px; padding: 15px; background-color: #0d1117; border: 1px solid #30363d; border-radius: 8px;">
                        <p style="color: #8b949e; font-size: 14px; margin-bottom: 10px; text-align: center;">📊 Gráfica matemática generada con éxito</p>
                        <div style="position: relative; height: 260px; width: 100%;">
                            <canvas id="${canvasId}"></canvas>
                        </div>
                    </div>
                `;
            }

            htmlRespuesta += `</div>`;
            container.innerHTML += htmlRespuesta;

            // Renderizar la gráfica usando Chart.js
            if (tieneGrafica) {
                setTimeout(() => {
                    const ctx = document.getElementById(canvasId).getContext('2d');
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: data.x_vals.map(v => v.toFixed(1)),
                            datasets: [{
                                label: 'f(x)',
                                data: data.y_vals,
                                borderColor: '#58a6ff',
                                backgroundColor: 'rgba(88, 166, 255, 0.15)',
                                borderWidth: 2,
                                pointRadius: 0,
                                tension: 0.2,
                                fill: true
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: {
                                    grid: { color: '#30363d' },
                                    ticks: { color: '#8b949e' }
                                },
                                y: {
                                    grid: { color: '#30363d' },
                                    ticks: { color: '#8b949e' }
                                }
                            },
                            plugins: {
                                legend: { display: false }
                            }
                        }
                    });
                }, 100);
            }

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