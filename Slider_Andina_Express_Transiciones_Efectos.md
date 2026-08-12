# 📌 ¿Qué hace este script?

Es un **script de automatización para Adobe After Effects** que crea automáticamente un **slider de fotos (presentación de imágenes)** con transiciones profesionales y efectos visuales. Está diseñado específicamente para el proyecto "Andina Express" (un negocio de carnes, frutas y verduras), pero es genérico y sirve para cualquier slider de fotos.

### Funcionalidades principales:
1. **Selección de resolución**: Te pregunta si quieres formato **Vertical (9:16)** para redes sociales (Reels/Stories) o **Horizontal (16:9)** para YouTube/televisión.
2. **Configuración personalizada**: Permite definir nombre del proyecto, ancho, alto, FPS y segundos por imagen.
3. **Múltiples carpetas de imágenes**: Puedes seleccionar varias carpetas. La primera se usa como **portada/cierre**, y las demás como **secciones** del slider.
4. **Efectos nativos de After Effects** que se rotan automáticamente entre imágenes:
   - **Linear Wipe** (barrido lineal)
   - **Radial Wipe** (barrido radial)
   - **Venetian Blinds** (persianas venecianas)
   - **Block Dissolve** (disolución de bloques)
   - **Fade** (desvanecimiento por opacidad)
5. **Efecto Ken Burns**: Zoom continuo y sutil en cada imagen para mantener el cuadro "vivo".
6. **Cálculo automático de duración**: Cada imagen dura exactamente los segundos que configures, sin superposiciones.

---

## 🎬 ¿Para qué programa es?

Es para **Adobe After Effects** (versión que soporte ExtendScript, es decir, CS6 en adelante). El archivo tiene extensión `.jsx`, que es el formato de scripts de After Effects.

---

## 🚀 ¿Cómo ejecutarlo?

1. **Abre Adobe After Effects**.
2. Ve al menú **Archivo (File) → Scripts → Run Script File...** (o **Ejecutar archivo de script**).
3. Selecciona el archivo `Slider_Andina_Express_Transiciones_Efectos.jsx`.
4. Se abrirá un diálogo pidiendo elegir **Vertical (9:16)** u **Horizontal (16:9)**.
5. Luego se abrirá el diálogo de configuración donde:
   - Escribes el **nombre del proyecto**.
   - Ajustas **ancho, alto y FPS** (vienen con valores por defecto según la resolución elegida).
   - Haces clic en **"Seleccionar"** para elegir las carpetas con las imágenes (JPG/JPEG/PNG).
   - Defines los **segundos por imagen**.
   - Pulsas **"Listo"**.
6. El script creará automáticamente la composición con todas las imágenes, efectos y transiciones.

> **Nota**: También puedes ejecutarlo desde el panel de scripts de After Effects (si lo colocas en la carpeta de Scripts de la aplicación).

---

## ⚙️ ¿Cómo funciona internamente?

El script se divide en 5 secciones:

1. **Diálogo de resolución** (`showResolutionDialog`): Muestra botones para elegir vertical u horizontal.
2. **Diálogo de configuración** (`showConfigDialog`): Recoge nombre, dimensiones, FPS, carpetas y segundos por imagen. Valida que los datos sean correctos.
3. **Funciones auxiliares** (`getImages`): Filtra los archivos de cada carpeta para quedarse solo con JPG, JPEG y PNG.
4. **Función principal** (`createSlider`):
   - Crea la composición con las dimensiones y duración calculadas.
   - Organiza las imágenes (portada + secciones + cierre si hay varias carpetas).
   - Importa cada imagen y la escala al 105% para cubrir el lienzo (efecto "Cover").
   - Aplica el **zoom Ken Burns** mediante expresiones.
   - Aplica los **efectos de transición** rotando entre los 4 tipos, con expresiones que van de 100% a 0% de completitud.
   - Si un efecto falla (por idioma de la app), usa un **fallback de opacidad**.
5. **Flujo principal**: Ejecuta los diálogos en orden y llama a la función de creación.

---

## ✅ Requisitos previos

| Requisito | Detalle |
|-----------|---------|
| **Software** | Adobe After Effects (CS6 o superior, preferiblemente CC 2018+) |
| **Sistema operativo** | Windows o macOS (el script es multiplataforma) |
| **Imágenes** | Carpetas con imágenes en formato **JPG, JPEG o PNG** |
| **Idioma de After Effects** | El script usa nombres de efectos en inglés (`ADBE Linear Wipe`, etc.). Si tu After Effects está en español, el script tiene un **fallback automático** que usa opacidad en su lugar. Para mejores resultados, usa After Effects en inglés o con efectos en inglés. |
| **Permisos de scripts** | En versiones recientes, puede ser necesario habilitar "Permitir scripts para escribir archivos y acceder a la red" en **Edición → Preferencias → General → Scripting & Expressions** (o el script puede no ejecutarse). |

---

## ⚠️ Consideraciones adicionales

- **Organización de carpetas**: Si usas varias carpetas, la **primera** se trata como portada/cierre (solo se usa su primera imagen al inicio y al final). Las demás carpetas son las secciones del slider.
- **Duración**: Se calcula como `total de imágenes × segundos por imagen`. No hay superposición entre imágenes (cortes exactos).
- **Efectos**: Se rotan cada 4 imágenes (imagen 2 → Linear Wipe, imagen 3 → Radial Wipe, imagen 4 → Venetian Blinds, imagen 5 → Block Dissolve, imagen 6 → Linear Wipe, etc.).
- **Resultado**: Al final muestra un resumen con nombre, resolución, duración, número de imágenes y segundos por imagen.