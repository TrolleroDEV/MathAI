import sympy as sp
import numpy as np

def resolver_matematica(tipo, expresion, variable='x', limite_punto=0):
    """
    Recibe la expresión matemática y el tipo de operación para devolver la solución.
    Soporta: algebra, limite, derivada, integral y grafica.
    """
    try:
        x = sp.Symbol(variable)
        # Reemplazar '^' por '**' para la sintaxis correcta de Python y SymPy
        expr_str = expresion.replace('^', '**')
        expr = sp.sympify(expr_str)
        
        pasos = []
        
        # 1. MÓDULO DE ÁLGEBRA Y FUNCIONES
        if tipo == "algebra":
            simplificada = sp.simplify(expr)
            factorizada = sp.factor(expr)
            soluciones = sp.solve(expr, x)
            
            resultado_latex = sp.latex(simplificada)
            pasos.append(f"Expresión simplificada: {sp.pretty(simplificada)}")
            if factorizada != simplificada:
                pasos.append(f"Forma factorizada: {sp.pretty(factorizada)}")
            if soluciones:
                pasos.append(f"Raíces / Soluciones para {variable}: {soluciones}")
                
            return {
                "estatus": "exito",
                "tipo_salida": "texto",
                "resultado": str(simplificada),
                "resultado_latex": resultado_latex,
                "pasos": pasos
            }

        # 2. MÓDULO DE LÍMITES
        elif tipo == "limite":
            punto = sp.sympify(limite_punto)
            resultado = sp.limit(expr, x, punto)
            
            pasos.append(f"Evaluando límite cuando {variable} → {punto}")
            pasos.append(f"Resultado del límite: {sp.pretty(resultado)}")
            
            return {
                "estatus": "exito",
                "tipo_salida": "texto",
                "resultado": str(resultado),
                "resultado_latex": sp.latex(resultado),
                "pasos": pasos
            }

        # 3. MÓDULO DE DERIVADAS
        elif tipo == "derivada":
            derivada = sp.diff(expr, x)
            pasos.append(f"Aplicando reglas de derivación sobre d/d{variable}({expr_str})")
            pasos.append(f"Resultado: {sp.pretty(derivada)}")
            
            return {
                "estatus": "exito",
                "tipo_salida": "texto",
                "resultado": str(derivada),
                "resultado_latex": sp.latex(derivada),
                "pasos": pasos
            }

        # 4. MÓDULO DE INTEGRALES
        elif tipo == "integral":
            integral = sp.integrate(expr, x)
            pasos.append(f"Integrando la función respecto a {variable}")
            pasos.append(f"Resultado: {sp.pretty(integral)} + C")
            
            return {
                "estatus": "exito",
                "tipo_salida": "texto",
                "resultado": f"{integral} + C",
                "resultado_latex": f"{sp.latex(integral)} + C",
                "pasos": pasos
            }

        # 5. MÓDULO DE REPRESENTACIÓN GRÁFICA
        elif tipo == "grafica":
            # Generar 100 puntos en el intervalo [-10, 10]
            x_vals = np.linspace(-10, 10, 100)
            y_vals = []
            
            # Convertir expresión de SymPy en una función evaluable por NumPy
            f_lambdified = sp.lambdify(x, expr, "numpy")
            
            for val in x_vals:
                try:
                    y_val = float(f_lambdified(val))
                    if np.isnan(y_val) or np.isinf(y_val):
                        y_vals.append(None) # Previene errores en asíntotas o divisiones por cero
                    else:
                        y_vals.append(y_val)
                except Exception:
                    y_vals.append(None)
            
            pasos.append(f"Generando gráfica para la función: {expr_str} en el intervalo [-10, 10]")
            
            return {
                "estatus": "exito",
                "tipo_salida": "grafica",
                "x_vals": x_vals.tolist(),
                "y_vals": y_vals,
                "pasos": pasos
            }

        else:
            return {"estatus": "error", "mensaje": "Módulo no soportado"}

    except Exception as e:
        return {"estatus": "error", "mensaje": f"Error de sintaxis o cálculo: {str(e)}"}