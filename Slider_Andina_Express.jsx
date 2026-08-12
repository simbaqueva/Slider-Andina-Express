// Automating After Effects Photo Slider - VERSIÓN GENÉRICA (FIX Object.keys)

(function() {
    app.beginUndoGroup("Crear Slider Automático");

    // ============================================
    // HELPER: reemplazo de Object.keys (no soportado en ExtendScript)
    // ============================================
    function getObjectKeys(obj) {
        var keys = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    }

    // ============================================
    // DIÁLOGO DE SELECCIÓN DE RESOLUCIÓN
    // ============================================
    function showResolutionDialog() {
        var dialog = new Window("dialog", "Seleccionar Resolución");
        
        dialog.add("statictext", undefined, "¿Qué formato deseas?", {multiline: false});
        
        var group = dialog.add("group");
        group.orientation = "column";
        
        var vertical = group.add("radiobutton", undefined, "📱 Vertical (9:16) - Móvil/Instagram Stories");
        var horizontal = group.add("radiobutton", undefined, "📺 Horizontal (16:9) - YouTube/Pantallas");
        
        vertical.value = true;
        
        var buttonGroup = dialog.add("group");
        buttonGroup.alignment = "right";
        var okBtn = buttonGroup.add("button", undefined, "Continuar");
        var cancelBtn = buttonGroup.add("button", undefined, "Cancelar");
        
        var result = {type: "vertical"};
        
        okBtn.onClick = function() {
            result.type = vertical.value ? "vertical" : "horizontal";
            dialog.close(1);
        };
        
        cancelBtn.onClick = function() {
            dialog.close(0);
        };
        
        if (dialog.show() === 1) {
            return result;
        }
        return null;
    }

    // ============================================
    // CREAR DIÁLOGO PERSONALIZADO
    // ============================================
    function showConfigDialog(resolutionType) {
        var dialog = new Window("dialog", "Configurar Slider Automático");
        
        // Panel principal
        dialog.add("statictext", undefined, "Configuración del Slider", {multiline: false});
        dialog.divider1 = dialog.add("panel", undefined, "");
        dialog.divider1.margins = [0, 5, 0, 5];
        
        // Grupo de nombre del proyecto
        var nameGroup = dialog.add("group");
        nameGroup.add("statictext", undefined, "Nombre del Slider:", {characters: 20});
        var projectNameInput = nameGroup.add("edittext", undefined, "Mi Slider");
        projectNameInput.characters = 30;
        
        // Grupo de resolución
        var resGroup = dialog.add("group");
        resGroup.orientation = "column";
        resGroup.add("statictext", undefined, "Configuración de Resolución:");
        
        // Valores por defecto según tipo de resolución
        var defaultWidth, defaultHeight;
        if (resolutionType === "vertical") {
            defaultWidth = "1080";
            defaultHeight = "1920";
        } else {
            defaultWidth = "1920";
            defaultHeight = "1080";
        }
        
        var widthGroup = resGroup.add("group");
        widthGroup.add("statictext", undefined, "Ancho (px):", {characters: 12});
        var widthInput = widthGroup.add("edittext", undefined, defaultWidth);
        widthInput.characters = 10;
        
        var heightGroup = resGroup.add("group");
        heightGroup.add("statictext", undefined, "Alto (px):", {characters: 12});
        var heightInput = heightGroup.add("edittext", undefined, defaultHeight);
        heightInput.characters = 10;
        
        var durationGroup = resGroup.add("group");
        durationGroup.add("statictext", undefined, "Duración (seg):", {characters: 12});
        var durationInput = durationGroup.add("edittext", undefined, "15");
        durationInput.characters = 10;
        
        var fpsGroup = resGroup.add("group");
        fpsGroup.add("statictext", undefined, "FPS:", {characters: 12});
        var fpsInput = fpsGroup.add("edittext", undefined, "30");
        fpsInput.characters = 10;
        
        // Panel de carpetas dinámicas
        dialog.divider2 = dialog.add("panel", undefined, "Seleccionar Carpetas");
        dialog.divider2.margins = [10, 10, 10, 10];
        
        var folderConfig = {};
        var folderUIElements = [];
        
        // Crear área scrollable para las carpetas
        var scrollGroup = dialog.divider2.add("group");
        scrollGroup.orientation = "column";
        scrollGroup.alignChildren = "fill";
        
        var folderListGroup = scrollGroup.add("group");
        folderListGroup.orientation = "column";
        folderListGroup.alignChildren = "fill";
        folderListGroup.minimumSize = [500, 200];
        
        // Función para agregar una carpeta
        function addFolderRow(index) {
            var rowGroup = folderListGroup.add("group");
            rowGroup.alignChildren = "fill";
            
            var labelText = "Carpeta " + (index + 1);
            rowGroup.add("statictext", undefined, labelText + ":", {characters: 20});
            
            var statusText = rowGroup.add("statictext", undefined, "No seleccionada", {characters: 40});
            statusText.graphics.foregroundColor = dialog.graphics.newPen(dialog.graphics.PenType.SOLID_COLOR, [1, 0, 0], 1);
            
            var btnGroup = rowGroup.add("group");
            
            var selectBtn = btnGroup.add("button", undefined, "Seleccionar");
            var removeBtn = btnGroup.add("button", undefined, "Eliminar");
            
            folderConfig[index] = null;
            
            selectBtn.onClick = function() {
                var folder = Folder.selectDialog("Selecciona la carpeta: " + labelText);
                if (folder) {
                    folderConfig[index] = folder;
                    statusText.text = folder.name + " ✓";
                    statusText.graphics.foregroundColor = dialog.graphics.newPen(dialog.graphics.PenType.SOLID_COLOR, [0, 0.7, 0], 1);
                }
            };
            
            removeBtn.onClick = function() {
                folderConfig[index] = null;
                rowGroup.remove();
                dialog.layout.layout();
            };
            
            folderUIElements.push({
                index: index,
                group: rowGroup,
                statusText: statusText,
                selectBtn: selectBtn,
                removeBtn: removeBtn
            });
        }
        
        // Agregar carpeta inicial
        addFolderRow(0);
        
        // Botón para agregar más carpetas
        var addFolderBtnGroup = scrollGroup.add("group");
        addFolderBtnGroup.alignment = "center";
        var addFolderBtn = addFolderBtnGroup.add("button", undefined, "+ Agregar otra carpeta");
        
        addFolderBtn.onClick = function() {
            // FIX: Object.keys() no existe en ExtendScript -> usamos getObjectKeys()
            var keys = getObjectKeys(folderConfig);
            var nums = [];
            for (var ki = 0; ki < keys.length; ki++) {
                nums.push(Number(keys[ki]));
            }
            var newIndex = (nums.length > 0 ? Math.max.apply(Math, nums) : -1) + 1;
            addFolderRow(newIndex);
            dialog.layout.layout();
        };
        
        // Botones de acción
        var buttonGroup = dialog.add("group");
        buttonGroup.alignment = "right";
        var okBtn = buttonGroup.add("button", undefined, "Listo");
        var cancelBtn = buttonGroup.add("button", undefined, "Cancelar");
        
        cancelBtn.onClick = function() {
            dialog.close(0);
        };
        
        okBtn.onClick = function() {
            // Validar que al menos una carpeta esté seleccionada
            var atLeastOneFolder = false;
            var selectedFolders = {};
            for (var fIndex in folderConfig) {
                if (folderConfig[fIndex] !== null) {
                    atLeastOneFolder = true;
                    selectedFolders[fIndex] = folderConfig[fIndex];
                }
            }
            
            if (!atLeastOneFolder) {
                alert("⚠️ Por favor, selecciona al menos una carpeta.");
                return;
            }
            
            // Validar números
            if (isNaN(parseInt(widthInput.text)) || isNaN(parseInt(heightInput.text)) || 
                isNaN(parseFloat(durationInput.text)) || isNaN(parseInt(fpsInput.text))) {
                alert("⚠️ Por favor, ingresa valores numéricos válidos en los campos de configuración.");
                return;
            }
            
            // Retornar configuración
            dialog.config = {
                projectName: projectNameInput.text || "Mi Slider",
                width: parseInt(widthInput.text),
                height: parseInt(heightInput.text),
                duration: parseFloat(durationInput.text),
                fps: parseInt(fpsInput.text),
                folders: selectedFolders
            };
            
            dialog.close(1);
        };
        
        return dialog;
    }

    // ============================================
    // FUNCIÓN PRINCIPAL GENÉRICA
    // ============================================
    function createSlider() {
        // Mostrar diálogo de resolución
        var resolutionResult = showResolutionDialog();
        if (!resolutionResult) {
            return; // Usuario canceló
        }
        
        // Mostrar diálogo de configuración
        var dialog = showConfigDialog(resolutionResult.type);
        if (dialog.show() !== 1) {
            return; // Usuario canceló
        }
        
        var config = dialog.config;
        var folderConfig = config.folders;

        var proj = app.project || app.newProject();
        
        // Usar configuración del usuario
        var compWidth = config.width;
        var compHeight = config.height;
        var compDuration = config.duration;
        var compFps = config.fps;
        
        var comp = proj.items.addComp(config.projectName, compWidth, compHeight, 1.0, compDuration, compFps);
        comp.openInViewer();

        // Crear carpeta en proyecto para organizar
        var binFolder = proj.items.addFolder("Assets " + config.projectName);

        // Funciones auxiliares para buscar archivos
        function getImages(folderOb) {
            if (!folderOb || !folderOb.exists) return [];
            var files = folderOb.getFiles();
            var imgs = [];
            for (var i = 0; i < files.length; i++) {
                var f = files[i];
                if (f instanceof File) {
                    var ext = f.name.toLowerCase().match(/\.([^\.]+)$/);
                    if (ext && (ext[1] == "jpg" || ext[1] == "jpeg" || ext[1] == "png")) {
                        imgs.push(f);
                    }
                }
            }
            return imgs;
        }

        // FIX: Object.keys() no existe en ExtendScript -> usamos getObjectKeys()
        var folderKeysRaw = getObjectKeys(folderConfig);
        var folderKeys = [];
        for (var fk = 0; fk < folderKeysRaw.length; fk++) {
            folderKeys.push(Number(folderKeysRaw[fk]));
        }
        folderKeys.sort(function(a, b) { return a - b; });

        var selectedFolderKeys = [];
        for (var sk = 0; sk < folderKeys.length; sk++) {
            if (folderConfig[folderKeys[sk]] !== null) {
                selectedFolderKeys.push(folderKeys[sk]);
            }
        }

        var finalImages = [];

        if (selectedFolderKeys.length === 1) {
            // Caso especial: solo una carpeta - añadir todas sus imágenes en orden
            var onlyImgs = getImages(folderConfig[selectedFolderKeys[0]]);
            for (var m = 0; m < onlyImgs.length; m++) {
                finalImages.push(onlyImgs[m]);
            }
        } else if (selectedFolderKeys.length > 1) {
            // Primera carpeta = Portada/Cierre
            var fachadaFile = getImages(folderConfig[selectedFolderKeys[0]])[0] || null;

            // Añadir Portada al inicio
            if (fachadaFile) {
                finalImages.push(fachadaFile);
            }

            // Añadir imágenes de todas las secciones en orden
            for (var s = 1; s < selectedFolderKeys.length; s++) {
                var imgs = getImages(folderConfig[selectedFolderKeys[s]]);
                for (var j = 0; j < imgs.length; j++) {
                    finalImages.push(imgs[j]);
                }
            }

            // Añadir Portada/Cierre al final
            if (fachadaFile) {
                finalImages.push(fachadaFile);
            }
        }

        if (finalImages.length === 0) {
            alert("No se encontraron imágenes.");
            return;
        }

        // Lógica de importación y colocación
        var totalImages = finalImages.length;
        var timePerImage = compDuration / totalImages; // aprox 15 / 18 = 0.833 segundos
        var overlap = 0.3; // Segundos de traslape para transiciones

        var placedLayers = [];

        for (var k = 0; k < totalImages; k++) {
            // Importar
            var importOptions = new ImportOptions(finalImages[k]);
            var importedItem;
            try {
                importedItem = proj.importFile(importOptions);
                importedItem.parentFolder = binFolder;
            } catch (e) {
                continue; // si falla
            }

            // Añadir a comp
            var layer = comp.layers.add(importedItem);
            
            // Reorganizar al fondo para que las de arriba solapen
            layer.moveToEnd();

            // Calcular escala (Cover: 100% del comp)
            var scaleX = (compWidth / layer.width) * 100;
            var scaleY = (compHeight / layer.height) * 100;
            var finalScale = Math.max(scaleX, scaleY);
            // Hacerlo un pelito más grande para la animación continua
            layer.property("Scale").setValue([finalScale, finalScale]);

            // Tiempos
            var inP = k * timePerImage;
            var outP = ((k + 1) * timePerImage) + overlap;
            if (k === totalImages - 1) {
                outP = compDuration; // El último dura hasta el final
            }
            
            layer.inPoint = inP;
            layer.outPoint = outP;

            // ANIMACIONES E INNOVACIÓN (Expresiones)
            // 1. Zoom Continuo: Un leve escalado continuo hacia adelante para que no se vea estático
            layer.property("Scale").expression = "var s = value[0] + (time - inPoint) * " + (Math.random() * 2 + 1.5).toFixed(2) + "; [s, s]";

            // 2. Transiciones de Entrada: Vamos a rotar entre 4 estilos de entrada
            var transType = k % 4;
            
            if (k > 0) { // El primero no necesita animación de entrada pesada
                var exprPos = "";
                var easeTime = overlap; // duración de la entrada igual al overlap
                
                if (transType === 0) {
                    // Slide Arriba con Ease
                    exprPos = "d = " + easeTime + "; t = time - inPoint; y = easeOut(t, 0, d, 3000, value[1]); [value[0], y]";
                    layer.property("Position").expression = exprPos;
                } else if (transType === 1) {
                    // Slide Izquierda
                    exprPos = "d = " + easeTime + "; t = time - inPoint; x = easeOut(t, 0, d, 2500, value[0]); [x, value[1]]";
                    layer.property("Position").expression = exprPos;
                } else if (transType === 2) {
                    // Slide Derecha
                    exprPos = "d = " + easeTime + "; t = time - inPoint; x = easeOut(t, 0, d, -1500, value[0]); [x, value[1]]";
                    layer.property("Position").expression = exprPos;
                } else if (transType === 3) {
                    // Scale Bounce
                    layer.property("Scale").expression = 
                        "var baseT = value[0] + (time - inPoint)*2;\n" + 
                        "d = " + easeTime + ";\n" + 
                        "t = time - inPoint;\n" + 
                        "if(t < d) {\n" + 
                        "  s = easeOut(t, 0, d, 0, value[0]);\n" + 
                        "  [s, s];\n" + 
                        "} else {\n" + 
                        "  [baseT, baseT];\n" + 
                        "}";
                }
            }

            // Además, un fade in en opacidad para suavizar la entrada
            if (k > 0) {
                layer.property("Opacity").expression = 
                    "d = " + overlap*.8 + "; t = time - inPoint; easeIn(t, 0, d, 0, 100)";
            }
        }

        alert("✅ ¡Slider generado con éxito!\n\nNombre: " + config.projectName + "\nDuración: " + config.duration + " segundos\nResolución: " + config.width + "x" + config.height + "\nImágenes procesadas: " + totalImages + "\n\n✨ Se aplicaron expresiones para generar transiciones automáticas.");
    }

    createSlider();

    app.endUndoGroup();
})();