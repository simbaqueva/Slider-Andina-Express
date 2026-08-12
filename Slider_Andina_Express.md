# 📌 ¿Qué hace este script?

Es un **script de automatización para Adobe After Effects** que crea automáticamente un **slider de fotos** (presentación de imágenes con transiciones animadas) a partir de imágenes organizadas en carpetas.

### Funcionalidades principales:
1. **Selección de resolución**: Pregunta si quieres formato **Vertical (9:16)** para móvil/Instagram Stories, o **Horizontal (16:9)** para YouTube/pantallas.
2. **Configuración personalizada**: Permite definir nombre del proyecto, ancho, alto, duración y FPS.
3. **Selección de carpetas**: Puedes agregar múltiples carpetas de imágenes (con botones "Seleccionar" y "Eliminar").
4. **Organización inteligente**:
   - Si seleccionas **1 sola carpeta**: usa todas sus imágenes en orden.
   - Si seleccionas **varias carpetas**: la primera carpeta se usa como **portada/cierre** (se coloca al inicio y al final), y las demás como secciones en orden.
5. **Importación y composición**: Importa las imágenes, las coloca en una composición, las escala para cubrir el frame (efecto "cover").
6. **Animaciones automáticas** (mediante expresiones de After Effects):
   - **Zoom continuo** (efecto Ken Burns) con velocidad aleatoria.
   - **4 tipos de transiciones de entrada** que rotan: Slide arriba, Slide izquierda, Slide derecha y Scale Bounce.
   - **Fade in** de opacidad para suavizar las entradas.
   - **Traslape de 0.3 segundos** entre imágenes para transiciones fluidas.

---

# 🎬 ¿Para qué programa es?

Es un script **`.jsx` para Adobe After Effects** (usa el objeto `app`, `app.project`, `comp.layers`, etc.). Se ejecuta dentro de After Effects, no en un navegador ni en Node.js.

---

# 🚀 ¿Cómo ejecutarlo?

1. **Abre Adobe After Effects** (CC 2019 o superior recomendado).
2. Ve al menú **Archivo → Scripts → Run Script File...** (o **File → Scripts → Run Script File...**).
3. Selecciona el archivo `Slider_Andina_Express.jsx`.
4. Sigue los diálogos:
   - Elige **Vertical** o **Horizontal**.
   - Configura nombre, resolución, duración y FPS.
   - Selecciona al menos **una carpeta** con imágenes (JPG, JPEG o PNG).
   - Haz clic en **Listo**.
5. El script creará la composición, importará las imágenes y aplicará las animaciones automáticamente.

> 💡 **Alternativa**: Puedes copiar el script a la carpeta de Scripts de After Effects (por ejemplo `C:\Program Files\Adobe\Adobe After Effects <versión>\Support Files\Scripts\`) y aparecerá en **Archivo → Scripts** para ejecutarlo directamente.

---

# ⚙️ ¿Cómo funciona internamente?

1. **Diálogo de resolución** → `showResolutionDialog()`: pregunta vertical u horizontal.
2. **Diálogo de configuración** → `showConfigDialog()`: recoge nombre, dimensiones, duración, FPS y carpetas.
3. **Función principal** → `createSlider()`:
   - Crea la composición con los parámetros dados.
   - Crea una carpeta "Assets" en el proyecto para organizar.
   - Lee las imágenes de las carpetas (solo `.jpg`, `.jpeg`, `.png`).
   - Ordena las imágenes según la lógica de portada/secciones.
   - Importa cada imagen y la añade como capa.
   - Calcula la escala para cubrir el frame (`Math.max(scaleX, scaleY)`).
   - Aplica expresiones de animación (zoom, transiciones, fade).
   - Muestra un mensaje de éxito con el resumen.

---

# ✅ Requisitos previos

| Requisito | Detalle |
|-----------|---------|
| **Adobe After Effects** | CC 2019 o superior (usa `app.beginUndoGroup`, `ImportOptions`, expresiones modernas). |
| **Sistema operativo** | Windows o macOS (el script es multiplataforma). |
| **Imágenes** | Archivos `.jpg`, `.jpeg` o `.png` organizados en carpetas. |
| **Al menos 1 carpeta** | Debe seleccionarse al menos una carpeta con imágenes. |
| **Permisos de ejecución de scripts** | En After Effects: **Edición → Preferencias → General → Permitir escritura de scripts para acceder a la red** (o similar) si es necesario. |

---

# ⚠️ Notas importantes

- El script usa un **reemplazo de `Object.keys()`** (`getObjectKeys`) porque ExtendScript (el motor de scripts de After Effects) no lo soporta nativamente.
- Si no se encuentran imágenes, muestra "No se encontraron imágenes" y se detiene.
- Las animaciones se aplican mediante **expresiones**, por lo que son editables y no destructivas.
- El script está diseñado para ser **genérico** (funciona con cualquier tipo de imágenes, no solo las de "Andina Express").