# Spain Reference Personas Sample

Página estática para explorar el job to be done:

> Evaluar si mi precio encaja con este tipo de cliente

La web transforma un sample de personas en una lectura visual de negocio con:

- métricas agregadas sobre sensibilidad al precio
- insights rápidos para interpretar el mercado
- un simulador heurístico de encaje de precio
- un mapa visual de tensión entre precio y seguridad económica
- una biblioteca filtrable de personas

El sample de este repositorio se ha elaborado a partir del dataset original:
[Spain Reference Personas Frontier](https://huggingface.co/datasets/apol/spain-reference-personas-frontier)

## Estructura

- [index.html](C:/Users/gerar/Documents/spainReferencePersonas/index.html): estructura de la página
- [styles.css](C:/Users/gerar/Documents/spainReferencePersonas/styles.css): estilos y layout
- [app.js](C:/Users/gerar/Documents/spainReferencePersonas/app.js): carga del dataset, cálculos y render dinámico
- [persons.json](C:/Users/gerar/Documents/spainReferencePersonas/persons.json): sample local de personas

## Cómo funciona

La página carga `persons.json` al abrirse y recalcula automáticamente:

- el número de personas analizadas
- las métricas agregadas
- los insights
- el simulador de encaje
- el gráfico de dispersión
- las tarjetas de personas

Si añades más entradas al array `personas` dentro de `persons.json`, la página se actualizará automáticamente al recargar.

## Formato esperado del dataset

Cada persona debe mantener la misma estructura base. Ejemplo:

```json
{
  "id": "rp-person-0000100",
  "label": "Perfil ejemplo",
  "priceSensitivity": 0.65,
  "incomeLevel": "Middle",
  "decisionStyle": "quality_balanced",
  "trustLevel": 0.52,
  "economicSecurity": 0.58,
  "noveltySeeking": 0.49,
  "brandLoyalty": 0.41,
  "sustainability": 0.63,
  "localPreference": 0.55,
  "digitalLevel": "regular",
  "ageGroup": "25-34",
  "gender": "Female",
  "education": "University",
  "environment": "Urban",
  "household": "couple_no_children",
  "motivations": [],
  "painPoints": []
}
```

Notas:

- Los valores numéricos como `priceSensitivity`, `trustLevel` o `economicSecurity` se esperan entre `0` y `1`.
- El archivo debe seguir siendo un JSON válido.
- La página ya corrige internamente el typo `Uban` a `Urban` al renderizar.

## Ejecutarlo en local

Puedes abrir `index.html` directamente, pero para una experiencia más fiable conviene servirlo con un servidor estático.

Ejemplo con Python:

```bash
python -m http.server 8000
```

Luego abre:

```text
http://localhost:8000
```

## Despliegue en GitHub Pages

1. Sube el contenido del repositorio a GitHub.
2. Ve a `Settings > Pages`.
3. En `Build and deployment`, selecciona `Deploy from a branch`.
4. Elige la rama principal y la carpeta `/ (root)`.
5. Guarda los cambios.

GitHub Pages servirá directamente:

- `index.html`
- `styles.css`
- `app.js`
- `persons.json`

## Personalización rápida

Puedes adaptar la página fácilmente si quieres:

- cambiar los textos del hero para enfocarlos a otro JTBD
- ajustar la heurística del simulador en [app.js](C:/Users/gerar/Documents/spainReferencePersonas/app.js:503)
- modificar colores y layout en [styles.css](C:/Users/gerar/Documents/spainReferencePersonas/styles.css)
- sustituir el sample local por un dataset más grande

## Limitaciones

- El simulador no es predictivo ni estadísticamente validado; es una herramienta orientativa.
- La calidad de la lectura depende totalmente de la calidad del sample incluido en `persons.json`.
- Si cambias la forma del JSON, habrá que adaptar la lógica de render.
