# FrutaFit (Spain Reference Personas Sample)

Pagina estatica para aterrizar el job to be done:

> Evaluar si mi precio encaja con este tipo de cliente

En este repositorio lo aterrizamos a un caso concreto: quieres abrir una franquicia de fruta y necesitas decidir donde empezar, como fijar un precio medio razonable y que mensaje usar para no parecer "caro".

El dataset de este repositorio es una muestra elaborada a partir del original:
[Spain Reference Personas Frontier](https://huggingface.co/datasets/apol/spain-reference-personas-frontier)

## Que incluye

- Metric as agregadas sobre sensibilidad al precio
- Recomendaciones por tipo de zona (urbano/suburbano/rural)
- Simulador heuristico de precio medio vs claridad de valor
- Mapa de ubicaciones (OpenStreetMap) para guardar posibles locales
- Biblioteca filtrable de personas

## Estructura

- `index.html`: estructura de la pagina
- `styles.css`: estilos
- `app.js`: carga de `persons.json`, calculos y render dinamico
- `persons.json`: muestra local de personas
- `favicon.svg`: favicon

## Mapa (OpenStreetMap)

La seccion **Ubicacion** usa Leaflet + OpenStreetMap.

- Haz clic en el mapa para soltar un marcador (rellena `lat/lng`)
- "Usar mi ubicacion" intenta detectar tu posicion (si das permiso)
- "Guardar marcador" guarda nombre/notas/coords en el navegador (localStorage)
- "Copiar coords" copia `lat, lng` al portapapeles
- "Borrar marcadores" elimina todos los guardados

### Tipo de zona (estimado)

Al elegir un punto, la pagina intenta estimar si es una zona `urbana`, `suburbana` o `rural` usando geocodificacion inversa de OpenStreetMap (Nominatim) y una heuristica.

Notas:

- Si Nominatim falla o limita peticiones, el campo puede quedar como "No disponible" o "Sin datos".
- El estado "Calculando..." es normal mientras resuelve la ubicacion.

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

- Los valores numericos como `priceSensitivity`, `trustLevel` o `economicSecurity` se esperan entre `0` y `1`.
- El archivo debe seguir siendo un JSON valido.
- La pagina corrige internamente el typo `Uban` a `Urban` al renderizar.

## Ejecutarlo en local

Abrir `index.html` directamente puede fallar al cargar JSON segun el navegador. Lo mas fiable es servirlo con un servidor estatico.

Ejemplo con Python:

```bash
python -m http.server 8000
```

Luego abre:

```text
http://localhost:8000
```

## Despliegue en GitHub Pages

1. Sube el repo a GitHub.
2. Ve a `Settings > Pages`.
3. Selecciona `Deploy from a branch`.
4. Elige la rama principal y la carpeta `/ (root)`.

GitHub Pages servira directamente:

- `index.html`
- `styles.css`
- `app.js`
- `persons.json`

## Limitaciones

- El simulador no es predictivo ni estadisticamente validado: es orientativo.
- La lectura depende de la calidad de la muestra en `persons.json`.
- La estimacion de zona usa una heuristica y puede equivocarse.
