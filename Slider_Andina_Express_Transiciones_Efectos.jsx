// Automating After Effects Photo Slider Generico - Transiciones Pro con Efectos
// Combina: seleccion de resolucion, configuracion personalizada, multiples carpetas
// y mantiene los efectos nativos: Ken Burns, Linear Wipe, Radial Wipe, Venetian Blinds, Block Dissolve y Fade

(function() {
    app.beginUndoGroup("Crear Slider Generico Efectos");

    // ============================================================
    // 1. DIALOGO DE RESOLUCION (Vertical 9:16 / Horizontal 16:9)
    // ============================================================
    function showResolutionDialog() {
        var dlg = new Window("dialog", "Selecciona Resolucion");
        dlg.orientation = "column";
        dlg.alignChildren = "fill";

        dlg.add("statictext", undefined, "Elige el formato del slider:");

        var btnGroup = dlg.add("group");
        btnGroup.alignment = "center";

        var btnVertical = btnGroup.add("button", undefined, "Vertical (9:16)");
        var btnHorizontal = btnGroup.add("button", undefined, "Horizontal (16:9)");

        var result = { choice: null };

        btnVertical.onClick = function() {
            result.choice = "vertical";
            dlg.close();
        };
        btnHorizontal.onClick = function() {
            result.choice = "horizontal";
            dlg.close();
        };

        dlg.show();
        return result.choice;
    }

    // ============================================================
    // 2. DIALOGO DE CONFIGURACION PERSONALIZADA
    // ============================================================
    function showConfigDialog(resolution) {
        var defaults = {};
        if (resolution === "vertical") {
            defaults = { name: "Slider Vertical", width: 1080, height: 1920, duration: 15, fps: 30 };
        } else {
            defaults = { name: "Slider Horizontal", width: 1920, height: 1080, duration: 15, fps: 30 };
        }

        var dlg = new Window("dialog", "Configuracion del Slider");
        dlg.orientation = "column";
        dlg.alignChildren = "fill";
        dlg.preferredSize.width = 420;

        // Nombre
        var nameGroup = dlg.add("group");
        nameGroup.add("statictext", undefined, "Nombre del proyecto:");
        var nameInput = nameGroup.add("edittext", undefined, defaults.name);
        nameInput.preferredSize.width = 250;

        // Dimensiones
        var dimGroup = dlg.add("group");
        dimGroup.add("statictext", undefined, "Ancho:");
        var widthInput = dimGroup.add("edittext", undefined, String(defaults.width));
        widthInput.preferredSize.width = 60;
        dimGroup.add("statictext", undefined, "Alto:");
        var heightInput = dimGroup.add("edittext", undefined, String(defaults.height));
        heightInput.preferredSize.width = 60;

        // FPS
        var fpsGroup = dlg.add("group");
        fpsGroup.add("statictext", undefined, "FPS:");
        var fpsInput = fpsGroup.add("edittext", undefined, String(defaults.fps));
        fpsInput.preferredSize.width = 60;
        dlg.add("statictext", undefined, "La duracion se calcula automaticamente: total de imagenes x segundos por imagen.");

        // ===== Seleccion de carpetas =====
        dlg.add("statictext", undefined, "Carpetas de imagenes (JPG/JPEG/PNG):");

        var folderList = dlg.add("listbox", undefined, [], { numberOfColumns: 1, showHeaders: false });
        folderList.preferredSize.height = 120;
        folderList.alignment = "fill";

        var folderBtnGroup = dlg.add("group");
        folderBtnGroup.alignment = "center";

        var btnAdd = folderBtnGroup.add("button", undefined, "Seleccionar");
        var btnRemove = folderBtnGroup.add("button", undefined, "Eliminar");

        var folders = [];

        btnAdd.onClick = function() {
            var sel = Folder.selectDialog("Selecciona una carpeta con imagenes");
            if (sel) {
                folders.push(sel);
                folderList.add("item", sel.fsName);
            }
        };

        btnRemove.onClick = function() {
            var idx = folderList.selection ? folderList.selection.index : -1;
            if (idx >= 0) {
                folderList.remove(idx);
                folders.splice(idx, 1);
            }
        };

        // ===== Segundos por imagen =====
        var secGroup = dlg.add("group");
        secGroup.add("statictext", undefined, "Segundos por imagen:");
        var secInput = secGroup.add("edittext", undefined, "1");
        secInput.preferredSize.width = 60;
        dlg.add("statictext", undefined, "Cada imagen durara exactamente este tiempo en pantalla (cortes sin sobreposicion).");

        // Botones Aceptar / Cancelar
        var actionGroup = dlg.add("group");
        actionGroup.alignment = "center";

        var btnOk = actionGroup.add("button", undefined, "Listo");
        var btnCancel = actionGroup.add("button", undefined, "Cancelar");

        var result = { ok: false, config: null };

        btnOk.onClick = function() {
            var w = parseInt(widthInput.text, 10);
            var h = parseInt(heightInput.text, 10);
            var f = parseInt(fpsInput.text, 10);
            var sec = parseFloat(secInput.text);

            if (isNaN(w) || isNaN(h) || isNaN(f) || isNaN(sec) || w <= 0 || h <= 0 || f <= 0 || sec <= 0) {
                alert("Valores invalidos. Revisa ancho, alto, FPS y segundos por imagen.");
                return;
            }
            if (folders.length === 0) {
                alert("Debes seleccionar al menos una carpeta con imagenes.");
                return;
            }

            result.ok = true;
            result.config = {
                name: nameInput.text || defaults.name,
                width: w,
                height: h,
                fps: f,
                secPerImage: sec,
                folders: folders.slice()
            };
            dlg.close();
        };

        btnCancel.onClick = function() {
            dlg.close();
        };

        dlg.show();
        return result;
    }

    // ============================================================
    // 3. FUNCIONES AUXILIARES
    // ============================================================
    function getImages(folderOb) {
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

    // ============================================================
    // 4. FUNCION PRINCIPAL
    // ============================================================
    function createSlider(config) {
        var proj = app.project || app.newProject();

        var compWidth = config.width;
        var compHeight = config.height;
        var compDuration = 0; // Se calcula automaticamente
        var compFps = config.fps;

        // La duracion se calcula automaticamente: totalImagenes * segundosPorImagen
        var totalImages = 0;
        if (config.folders.length === 1) {
            totalImages = getImages(config.folders[0]).length;
        } else {
            var coverCount = getImages(config.folders[0]).length;
            totalImages = (coverCount > 0 ? 1 : 0); // Portada
            for (var ci = 1; ci < config.folders.length; ci++) {
                totalImages += getImages(config.folders[ci]).length;
            }
            if (coverCount > 0) totalImages += 1; // Cierre
        }
        compDuration = totalImages * config.secPerImage;

        var comp = proj.items.addComp(config.name, compWidth, compHeight, 1.0, compDuration, compFps);
        comp.openInViewer();

        var binFolder = proj.items.addFolder("Assets Slider Efectos");

        // ===== Organizacion inteligente de imagenes =====
        var finalImages = [];

        if (config.folders.length === 1) {
            // Una sola carpeta: usa todas sus imagenes en orden
            finalImages = getImages(config.folders[0]);
        } else {
            // Varias carpetas: la primera es portada/cierre, las demas son secciones
            var coverImages = getImages(config.folders[0]);
            if (coverImages.length > 0) {
                finalImages.push(coverImages[0]); // Portada al inicio
            }
            for (var i = 1; i < config.folders.length; i++) {
                var secImgs = getImages(config.folders[i]);
                for (var j = 0; j < secImgs.length; j++) {
                    finalImages.push(secImgs[j]);
                }
            }
            if (coverImages.length > 0) {
                finalImages.push(coverImages[0]); // Cierre al final
            }
        }

        if (finalImages.length === 0) {
            alert("No se encontraron imagenes.");
            return;
        }

        var totalImages = finalImages.length;
        var timePerImage = config.secPerImage; // Cada imagen dura exactamente los segundos indicados
        var transDuration = 0.45; // Casi medio segundo de transicion suave

        for (var k = 0; k < totalImages; k++) {
            var importOptions = new ImportOptions(finalImages[k]);
            var importedItem;
            try {
                importedItem = proj.importFile(importOptions);
                importedItem.parentFolder = binFolder;
            } catch (e) {
                continue;
            }

            var layer = comp.layers.add(importedItem);

            // Colocar siempre arriba para que el diseno apile de abajo (viejas) hacia arriba (nuevas)
            layer.moveToBeginning();

            // Escalar "Cover", 100% Canvas
            var scaleX = (compWidth / layer.width) * 100;
            var scaleY = (compHeight / layer.height) * 100;
            var finalScale = Math.max(scaleX, scaleY);
            // Hacerla un poco mas grande de inicio para evitar bordes durante el movimiento o efectos
            layer.property("Scale").setValue([finalScale * 1.05, finalScale * 1.05]);

            // Cortes exactos: cada imagen dura exactamente timePerImage, sin sobreposicion
            var inP = k * timePerImage;
            var outP = (k + 1) * timePerImage;
            if (k === totalImages - 1) {
                outP = compDuration;
            }

            layer.inPoint = inP;
            layer.outPoint = outP;

            // ZOOM CONTINUO: Efecto sutil para mantener vivo el cuadro (Ken Burns)
            layer.property("Scale").expression =
                "var st = value[0];\n" +
                "var duration = outPoint - inPoint;\n" +
                "var s = ease(time - inPoint, 0, duration, st, st + 8);\n" +
                "[s, s];";

            // TRANSICIONES DE ENTRADA CON EFECTOS NATIVOS
            if (k > 0) {
                var effectType = (k - 1) % 4; // Rotamos entre 4 efectos atractivos
                var fx;

                // Expresion de 100 a 0
                var complExp = "d = " + transDuration + "; t = time - inPoint; easeOut(t, 0, d, 100, 0)";

                try {
                    if (effectType === 0) {
                        fx = layer.property("Effects").addProperty("ADBE Linear Wipe"); // Barrido Lineal
                        fx.property(1).expression = complExp; // Transition Completion
                        fx.property(2).setValue(Math.random() > 0.5 ? 90 : -90); // Wipe Angle
                        fx.property(4).setValue(75); // Feather (desvanecimiento) para que sea elegante
                    }
                    else if (effectType === 1) {
                        fx = layer.property("Effects").addProperty("ADBE Radial Wipe"); // Barrido Radial
                        fx.property(1).expression = complExp; // Transition Completion
                        if (fx.property(3)) fx.property(3).setValue(50); // Intento de dar Feather si la version lo permite
                    }
                    else if (effectType === 2) {
                        fx = layer.property("Effects").addProperty("ADBE Venetian Blinds"); // Persianas
                        fx.property(1).expression = complExp;
                        fx.property(2).setValue(45); // Dir
                        fx.property(3).setValue(40); // Width
                        fx.property(4).setValue(20); // Feather
                    }
                    else if (effectType === 3) {
                        fx = layer.property("Effects").addProperty("ADBE Block Dissolve"); // Disolucion de bloque
                        fx.property(1).expression = complExp;
                        fx.property(2).setValue(60); // Block Width
                        fx.property(3).setValue(60); // Block Height
                    }
                } catch(e) {
                    // Fallback a Opacidad si el plug-in tuviera otro nombre en el idioma de la app
                    layer.property("Opacity").expression =
                        "d = " + transDuration + "; t = time - inPoint; easeOut(t, 0, d, 0, 100)";
                }

                // Opacidad progresiva extra para mezclar bien
                layer.property("Opacity").expression =
                    "d = " + transDuration * 0.7 + "; t = time - inPoint; easeIn(t, 0, d, 0, 100)";
            }
        }

        alert("Slider con transiciones visuales (Efectos) generado!\n" +
              "Nombre: " + config.name + "\n" +
              "Resolucion: " + compWidth + "x" + compHeight + "\n" +
              "Duracion: " + compDuration + " segundos.\n" +
              "Imagenes: " + totalImages + "\n" +
              "Segundos por imagen: " + config.secPerImage + "\n" +
              "Puedes probarlo con el boton de previsualizacion.");
    }

    // ============================================================
    // 5. FLUJO PRINCIPAL
    // ============================================================
    var resolution = showResolutionDialog();
    if (!resolution) return;

    var configResult = showConfigDialog(resolution);
    if (!configResult.ok) return;

    createSlider(configResult.config);

    app.endUndoGroup();
})();