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
            // Unir los pasos y separarlos de forma limpia por cada número o punto clave
            let explicacionCompleta = data.pasos.join(' ');
            let pasosSeparados = explicacionCompleta.split(/(?=\d+\.\s+\*\*)/g);
            
            let pasosHtml = '';
            if (pasosSeparados.length > 1) {
                pasosSeparados.forEach(paso => {
                    if (paso.trim() !== '') {
                        pasosHtml += `
                            <div style="background-color: #0d1117; border: 1px solid #30363d; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
                                <p style="margin: 0; color: #c9d1d9; line-height: 1.5;">${paso.trim()}</p>
                            </div>
                        `;
                    }
                });
            } else {
                data.pasos.forEach(paso => {
                    pasosHtml += `<p style="color: #c9d1d9; line-height: 1.5;">${paso.replace(/\n/g, '<br>')}</p>`;
                });
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