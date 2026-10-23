document.addEventListener('DOMContentLoaded', () => {
    const menuButtons = document.querySelectorAll('.menu-btn');
    const inputField = document.getElementById('math-input');
    const solveBtn = document.getElementById('solve-btn');
    const outputBox = document.getElementById('output-box');
    const symButtons = document.querySelectorAll('.sym-btn');
    const moduleTitle = document.getElementById('module-title');
    const moduleDesc = document.getElementById('module-desc');
    
    let currentModule = 'algebra'; // Módulo por defecto

    // Descripciones dinámicas para cada módulo de MathAI
    const moduleDescriptions = {
        algebra: "Suma, simplifica, resuelve ecuaciones y analiza funciones polinómicas o trascendentes.",
        grafica: "Genera y visualiza la curva de la función matemática en el plano cartesiano en tiempo real.",
        limite: "Calcula el valor al que se aproxima una función cuando la variable independiente tiende a un punto.",
        derivada: "Obtén la función derivada aplicando reglas de derivación analítica de forma exacta.",
        integral: "Calcula la antiderivada o integral indefinida de la función ingresada."
    };

    // 1. Cambiar entre módulos de la barra lateral
    menuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            menuButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentModule = btn.getAttribute('data-topic');
            const titleText = btn.innerText.trim();
            moduleTitle.innerText = titleText;
            
            if (moduleDescriptions[currentModule]) {
                moduleDesc.innerText = moduleDescriptions[currentModule];
            }
            
            // Limpiar caja de texto o resultado al cambiar de módulo (opcional)
            inputField.focus();
        });
    });

    // 2. Insertar símbolos matemáticos rápidos en el input
    symButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const sym = btn.getAttribute('data-sym');
            inputField.value += sym;
            inputField.focus();
        });
    });

    // 3. Petición al Backend Python al hacer clic en "Resolver" o presionar Enter
    solveBtn.addEventListener('click', resolverProblema);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') resolverProblema();
    });

    let myChart = null; // Variable global para administrar el canvas de Chart.js

    async function resolverProblema() {
        const expresion = inputField.value.trim();
        if (!expresion) {
            outputBox.innerHTML = `<p class="error-text" style="color: #ef4444;">Por favor ingresa una expresión válida.</p>`;
            return;
        }

        // Mostrar indicador de carga interactivo
        outputBox.innerHTML = `<p class="placeholder-text"><i class="ph-bold ph-spinner" style="animation: spin 1s linear infinite;"></i> Procesando en MathAI...</p>`;

        try {
            const response = await fetch('https://mathai-hzgl.onrender.com/api/resolver', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tipo: currentModule,
                    expresion: expresion,
                    variable: 'x',
                    limite_punto: 0
                })
            });

            const data = await response.json();

            if (data.estatus === 'exito') {
                if (data.tipo_salida === 'grafica') {
                    // Si el módulo es gráfica, creamos el elemento canvas para Chart.js
                    outputBox.innerHTML = `<canvas id="mathChart" style="width:100%; max-height:300px;"></canvas>`;
                    
                    const ctx = document.getElementById('mathChart').getContext('2d');
                    
                    // Destruir el gráfico anterior si existía para evitar superposición
                    if (myChart) myChart.destroy();

                    myChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: data.x_vals.map(val => val.toFixed(1)),
                            datasets: [{
                                label: `f(x) = ${expresion}`,
                                data: data.y_vals,
                                borderColor: '#6366f1',
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                borderWidth: 2,
                                pointRadius: 0,
                                tension: 0.1
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                x: { 
                                    grid: { color: '#334155' }, 
                                    ticks: { color: '#94a3b8' } 
                                },
                                y: { 
                                    grid: { color: '#334155' }, 
                                    ticks: { color: '#94a3b8' } 
                                }
                            }
                        }
                    });
                } else {
                    // Resultados de texto estándar (Álgebra, Límites, Derivadas, Integrales)
                    let htmlPasos = data.pasos.map(paso => `<li>${paso}</li>`).join('');
                    outputBox.innerHTML = `
                        <div class="result-success">
                            <div class="main-result" style="font-size: 1.4rem; font-weight: bold; color: #6366f1; margin-bottom: 1rem;">
                                Resultado: ${data.resultado}
                            </div>
                            <div class="steps-container">
                                <h4 style="margin-bottom: 0.5rem; color: #94a3b8;">Desglose y Pasos:</h4>
                                <ul style="padding-left: 1.2rem; color: #f8fafc;">
                                    ${htmlPasos}
                                </ul>
                            </div>
                        </div>
                    `;
                }
            } else {
                outputBox.innerHTML = `<p class="error-text" style="color: #ef4444;">${data.mensaje}</p>`;
            }
        } catch (error) {
            outputBox.innerHTML = `<p class="error-text" style="color: #ef4444;">Error al conectar con el servidor de MathAI. Asegúrate de que app.py esté corriendo.</p>`;
        }
    }
});