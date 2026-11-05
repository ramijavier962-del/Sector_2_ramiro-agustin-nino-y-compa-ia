
const DURACION = 240;

let segundosRestantes = DURACION;
let intervalo = null;
let puntos = 0;
let vidas = 3;
let misionActual = 0;
let desafiosCompletados = 0;
let directorioActual = null;
const directorios = [
    { nombre: "FILES", misiones: [0, 1] },
    { nombre: "COMMANDS", misiones: [5, 6] },
    { nombre: "NETWORK", misiones: [2, 3] },
    { nombre: "SECURITY", misiones: [4, 7] }
];
const progresoDirectorios = [0, 0, 0, 0];
let seleccion = null;
let respondida = false;
let juegoTerminado = false;

const $ = (id) => document.getElementById(id);

const temporizador = $("temporizador");
const mensajeNexo = $("mensajeNexo");
const zonaDesafio = $("zonaDesafio");
const resultado = $("resultado");
const btnIniciar = $("btnIniciar");
const btnReiniciar = $("btnReiniciar");
const btnComprobar = $("btnComprobar");
const btnSiguiente = $("btnSiguiente");

function actualizarNexo(mensaje, estado = "normal") {
    mensajeNexo.textContent = mensaje;
    const avatar = document.querySelector(".nexo-avatar");
    if (!avatar) return;

    avatar.classList.remove("thinking", "happy", "alert", "talking");
    if (estado !== "normal") avatar.classList.add(estado);
    if (estado === "thinking" || estado === "happy" || estado === "alert") {
        avatar.classList.add("talking");
    }
}

const misiones = [
    {
        categoria: "MINIJUEGO 01 // ANÁLISIS DE ARCHIVOS",
        titulo: "Detectá el archivo sospechoso",
        descripcion: "El sistema encontró cuatro archivos. Identificá cuál podría ser peligroso en esta simulación.",
        tipo: "opciones",
        nexo: "Primero tenemos que encontrar el archivo sospechoso. Observá bien los nombres.",
        pregunta: "¿Cuál es el archivo más sospechoso?",
        opciones: [
            "tarea.html",
            "foto.png",
            "virus.exe",
            "apuntes.txt"
        ],
        correcta: 2,
        explicacion: "Correcto. El nombre virus.exe es sospechoso en este escenario. La extensión por sí sola no demuestra que un archivo sea malicioso."
    },
    {
        categoria: "MINIJUEGO 02 // SIMPLE ENGLISH",
        titulo: "English checkpoint",
        descripcion: "NEXO necesita comprobar una palabra básica en inglés. Leé la pregunta y elegí su significado.",
        tipo: "opciones",
        nexo: "Small English words can help us understand the system. ¡Vamos con una fácil!",
        pregunta: "What does PASSWORD mean? (¿Qué significa PASSWORD?)",
        opciones: [
            "Contraseña",
            "Computadora",
            "Escuela",
            "Ventana"
        ],
        correcta: 0,
        explicacion: "Correct! PASSWORD significa contraseña. Es una palabra importante para la seguridad digital."
    },    {
        categoria: "MINIJUEGO 03 // REDES",
        titulo: "Restaurá la conexión",
        descripcion: "Una computadora necesita recibir automáticamente su configuración de red.",
        tipo: "opciones",
        nexo: "Tenemos que identificar qué servicio asigna automáticamente direcciones IP.",
        pregunta: "¿Qué protocolo permite asignar direcciones IP automáticamente?",
        opciones: [
            "HTML",
            "DHCP",
            "CSS",
            "USB"
        ],
        correcta: 1,
        explicacion: "Exacto. DHCP permite asignar automáticamente la configuración IP a los dispositivos."
    },
    {
        categoria: "MINIJUEGO 04 // MEMORIA",
        titulo: "Código de acceso",
        descripcion: "El sistema mostró una secuencia. Recordala y escribila en el mismo orden.",
        tipo: "memoria",
        nexo: "Este acceso depende de tu memoria. Mirá la secuencia y reproducila sin cambiar el orden.",
        secuencia: "4 - 2 - 7",
        respuesta: "427",
        explicacion: "Secuencia correcta. El orden de los datos importa."
    },
    {
        categoria: "MINIJUEGO 05 // SIMPLE ENGLISH",
        titulo: "Say hello!",
        descripcion: "Para desbloquear este archivo, elegí el saludo correcto en inglés.",
        tipo: "opciones",
        nexo: "You can do it! Recordá que HELLO se usa para saludar a alguien.",
        pregunta: "Choose the correct greeting. (Elegí el saludo correcto.)",
        opciones: [
            "Goodbye",
            "Hello",
            "Night",
            "Sorry"
        ],
        correcta: 1,
        explicacion: "Great! HELLO significa hola y se usa para saludar. GOODBYE significa chau/adiós."
    },    {
        categoria: "MINIJUEGO 06 // LÓGICA",
        titulo: "Descifrá el programa",
        descripcion: "Analizá esta instrucción antes de responder.",
        tipo: "opciones",
        nexo: "No hace falta ejecutar nada. Leé el código y razoná qué va a pasar.",
        codigo: 'let acceso = true;\nif (acceso) {\n  console.log("ENTRADA");\n}',
        pregunta: "¿Qué mensaje se mostraría en la consola?",
        opciones: [
            "ERROR",
            "false",
            "ENTRADA",
            "No muestra nada"
        ],
        correcta: 2,
        explicacion: "Correcto. Como acceso vale true, se ejecuta el bloque y se muestra ENTRADA."
    },
    {
        categoria: "MINIJUEGO 07 // PERMISOS",
        titulo: "Abrí el archivo autorizado",
        descripcion: "Necesitamos otorgar al propietario lectura, escritura y ejecución; al grupo y a otros, solo lectura y ejecución.",
        tipo: "texto",
        nexo: "Los permisos determinan qué acciones se pueden realizar sobre un archivo.",
        pregunta: "Escribí el comando chmod completo para archivo.sh.",
        respuesta: "chmod 755 archivo.sh",
        explicacion: "¡Bien! En este ejemplo, 755 representa permisos rwx para el propietario y r-x para grupo y otros.",
        pista: "La estructura es chmod 755 nombre-del-archivo."
    },
    {
        categoria: "MINIJUEGO 08 // JEFE FINAL",
        titulo: "MALWARE_CORE.EXE",
        descripcion: "El núcleo malicioso bloqueó el sistema. Resolvé el último desafío para completar la operación.",
        tipo: "opciones",
        nexo: "¡Llegamos al núcleo! Elegí la medida más segura para responder a un equipo posiblemente infectado.",
        pregunta: "Choose the SAFE action. (Elegí la acción segura ante una computadora sospechosa.)",
        opciones: [
            "Open every file / Abrir todos los archivos",
            "Ignore the alert / Ignorar la alerta",
            "Tell the teacher or IT staff / Avisar al docente o encargado técnico",
            "Turn off all protection / Desactivar la protección"
        ],
        correcta: 2,
        explicacion: "CORE DISABLED! SAFE significa seguro. Avisar al docente o encargado técnico es la opción más segura."
    }
];

function mostrarTiempo() {
    const minutos = Math.floor(segundosRestantes / 60);
    const segundos = segundosRestantes % 60;

    temporizador.textContent =
        String(minutos).padStart(2, "0") + ":" +
        String(segundos).padStart(2, "0");

    temporizador.style.color =
        segundosRestantes <= 60 ? "#ff5364" : "";
}

function actualizarPanel() {
    $("puntos").textContent = String(puntos).padStart(4, "0");
    $("vidas").textContent =
        "♥ ".repeat(vidas) + "♡ ".repeat(3 - vidas);
    $("progreso").textContent =
        `${desafiosCompletados}/${misiones.length}`;

    $("barraProgreso").style.width =
        `${(desafiosCompletados / misiones.length) * 100}%`;
}


let introEnCurso = false;
let esperaInicio = null;
let esperaConexion = null;

function iniciarJuego() {
    if (intervalo !== null || juegoTerminado || introEnCurso) return;

    introEnCurso = true;
    btnIniciar.disabled = true;
    btnIniciar.textContent = "CONECTANDO...";
    
    const escena = $("escenaIntro");
    const mensajeEscena = $("mensajeEscena");

    escena.classList.remove("connected");
    escena.classList.add("walking");

    mensajeEscena.textContent = "NEXO INICIALIZANDO TERMINAL...";
    actualizarNexo(
        "¡Ahí estás, operador! Voy a acompañarte. Preparando la conexión con la terminal...",
        "thinking"
    );

    // NEXO inicia la conexión con la terminal
    esperaInicio = setTimeout(() => {
        escena.classList.add("connected");
        mensajeEscena.textContent = "CONEXIÓN ESTABLECIDA";

        $("computadora").querySelector(".computer-text").innerHTML =
            "SYSTEM<br>ONLINE";

        actualizarNexo(
            "¡Conexión establecida! Ya estoy en línea. Leé las instrucciones y contá conmigo.",
            "happy"
        );

        // Después de la animación aparece el cartel de instrucciones.
        esperaConexion = setTimeout(() => {
            mostrarInstrucciones();
        }, 900);

    }, 2200);
}


function mostrarInstrucciones() {
    introEnCurso = false;
    esperaInicio = null;
    esperaConexion = null;
    $("pantallaInicio").hidden = true;
    $("zonaJuego").hidden = true;
    $("zonaDirectorios").hidden = true;
    $("pantallaFinal").hidden = true;
    $("pantallaInstrucciones").hidden = false;
    actualizarNexo("Read the instructions, operator. Press PLAY NOW when you are ready. ¡Estoy listo!", "happy");
}

function comenzarPartida() {
    introEnCurso = false;
    esperaInicio = null;
    esperaConexion = null;

    $("pantallaInicio").hidden = true;
    $("pantallaInstrucciones").hidden = true;
    $("pantallaFinal").hidden = true;
    $("zonaJuego").hidden = true;
    $("zonaDirectorios").hidden = false;
    directorioActual = null;
    actualizarDirectorios();
    actualizarNexo("Explorá los cuatro directorios. Cada carpeta tiene dos minijuegos. ¡Tenemos cuatro minutos, operador!", "happy");

    // El contador global empieza al presionar PLAY NOW.
    mostrarTiempo();

    intervalo = setInterval(() => {
        segundosRestantes--;
        mostrarTiempo();

        if (segundosRestantes <= 0) {
            segundosRestantes = 0;
            mostrarTiempo();

            terminarJuego(
                false,
                "Time is over! The system is locked."
            );
        }
    }, 1000);
}



function actualizarDirectorios() {
    document.querySelectorAll("[data-directory]").forEach((boton) => {
        const indice = Number(boton.dataset.directory);
        const completadas = progresoDirectorios[indice];
        const desbloqueado = indice === 0 || progresoDirectorios.slice(0, indice).every((valor) => valor === 2);
        boton.disabled = !desbloqueado || completadas === 2;
        boton.classList.toggle("completed", completadas === 2);
        const estado = $("dirProgress" + indice);
        if (estado) estado.textContent = completadas === 2 ? "✓ COMPLETADO" : desbloqueado ? `${completadas}/2 desafíos` : "BLOQUEADO";
    });
    document.querySelectorAll("[data-open-directory]").forEach((boton) => {
        const indice = Number(boton.dataset.openDirectory);
        const desbloqueado = indice === 0 || progresoDirectorios.slice(0, indice).every((valor) => valor === 2);
        boton.disabled = !desbloqueado;
        boton.classList.toggle("active", directorioActual === indice);
    });
}

function entrarDirectorio(indice) {
    if (juegoTerminado || indice < 0 || indice > 3) return;
    const desbloqueado = indice === 0 || progresoDirectorios.slice(0, indice).every((valor) => valor === 2);
    if (!desbloqueado || progresoDirectorios[indice] >= 2) return;
    directorioActual = indice;
    misionActual = directorios[indice].misiones[progresoDirectorios[indice]];
    $("zonaDirectorios").hidden = true;
    $("zonaJuego").hidden = false;
    $("numeroMision").textContent = `DIRECTORIO ${String(indice + 1).padStart(2, "0")}`;
    actualizarDirectorios();
    actualizarNexo(`Entraste en ${directorios[indice].nombre}. Completá sus dos minijuegos para continuar.`, "thinking");
    cargarMision();
}

function volverADirectorios() {
    if (juegoTerminado) return;
    $("zonaJuego").hidden = true;
    $("zonaDirectorios").hidden = false;
    directorioActual = null;
    actualizarDirectorios();
    actualizarNexo("Elegí el próximo directorio disponible. ¡No pierdas de vista el cronómetro!", "normal");
}

function cargarMision() {
    if (misionActual >= misiones.length) {
        terminarJuego(true, "Superaste todos los desafíos y recuperaste el sistema escolar.");
        return;
    }

    const m = misiones[misionActual];

    seleccion = null;
    respondida = false;

    $("numeroMision").textContent =
        `MISIÓN ${String(misionActual + 1).padStart(2, "0")}`;

    $("categoria").textContent = m.categoria;
    $("tituloMision").textContent = m.titulo;
    $("descripcionMision").textContent = m.descripcion;
    actualizarNexo(m.nexo, "thinking");

    resultado.textContent = "";
    resultado.className = "result";

    btnComprobar.hidden = false;
    btnComprobar.disabled = false;
    btnSiguiente.hidden = true;

    zonaDesafio.innerHTML = "";

    if (m.tipo === "opciones") {
        crearOpciones(m);
    } else if (m.tipo === "texto") {
        crearEntrada(m);
    } else if (m.tipo === "memoria") {
        crearMemoria(m);
    }

    actualizarPanel();
}

function crearOpciones(m) {
    const pregunta = document.createElement("h3");
    pregunta.textContent = m.pregunta;
    zonaDesafio.appendChild(pregunta);

    if (m.codigo) {
        const codigo = document.createElement("pre");
        codigo.className = "terminal";
        codigo.textContent = m.codigo;
        zonaDesafio.appendChild(codigo);
    }

    const contenedor = document.createElement("div");
    contenedor.className = "options";

    m.opciones.forEach((opcion, indice) => {
        const boton = document.createElement("button");
        boton.className = "option";
        boton.textContent = opcion;

        boton.addEventListener("click", () => {
            if (respondida) return;

            seleccion = indice;

            contenedor.querySelectorAll(".option").forEach((b) => {
                b.classList.remove("selected");
            });

            boton.classList.add("selected");
            actualizarNexo("Estoy analizando tu elección... Cuando estés seguro, presioná COMPROBAR RESPUESTA.", "thinking");
        });

        contenedor.appendChild(boton);
    });

    zonaDesafio.appendChild(contenedor);
}

function crearEntrada(m) {
    const etiqueta = document.createElement("p");
    etiqueta.textContent = m.pregunta;
    zonaDesafio.appendChild(etiqueta);

    const terminal = document.createElement("div");
    terminal.className = "terminal";

    const label = document.createElement("div");
    label.className = "terminal-label";
    label.textContent = "user@school:~$";

    const input = document.createElement("input");
    input.id = "respuestaTexto";
    input.className = "answer-input";
    input.type = "text";
    input.autocomplete = "off";
    input.placeholder = "Escribí tu respuesta...";

    input.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter" && !respondida) {
            comprobarRespuesta();
        }
    });

    terminal.append(label, input);
    zonaDesafio.appendChild(terminal);
}

function crearMemoria(m) {
    const etiqueta = document.createElement("p");
    etiqueta.textContent = "SECUENCIA DETECTADA:";
    zonaDesafio.appendChild(etiqueta);

    const secuencia = document.createElement("div");
    secuencia.className = "big-icon";
    secuencia.textContent = m.secuencia;
    zonaDesafio.appendChild(secuencia);

    const aviso = document.createElement("p");
    aviso.textContent = "Escribí los números juntos y en el mismo orden.";
    zonaDesafio.appendChild(aviso);

    const input = document.createElement("input");
    input.id = "respuestaTexto";
    input.className = "answer-input";
    input.type = "text";
    input.inputMode = "numeric";
    input.maxLength = 3;
    input.placeholder = "Ejemplo: 123";

    input.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter" && !respondida) {
            comprobarRespuesta();
        }
    });

    zonaDesafio.appendChild(input);
}

function comprobarRespuesta() {
    if (respondida || juegoTerminado) return;

    const m = misiones[misionActual];
    let correcta = false;

    if (m.tipo === "opciones") {
        if (seleccion === null) {
            resultado.textContent = "Seleccioná una respuesta primero.";
            resultado.className = "result hint";
            return;
        }

        correcta = seleccion === m.correcta;
    } else {
        const input = $("respuestaTexto");
        const respuestaUsuario = input.value.trim().toLowerCase();
        const respuestaCorrecta = m.respuesta.toLowerCase();

        if (m.tipo === "texto") {
            correcta = respuestaUsuario.replace(/\s+/g, " ") === respuestaCorrecta;
        } else {
            correcta = respuestaUsuario.replace(/\s/g, "") === respuestaCorrecta;
        }

        if (!correcta && m.pista) {
            resultado.textContent = "Pista: " + m.pista;
        }
    }

    if (correcta) {
        respondida = true;
        puntos += 100 + Math.floor(segundosRestantes / 10);
        desafiosCompletados++;
        if (directorioActual !== null) progresoDirectorios[directorioActual] = Math.min(2, progresoDirectorios[directorioActual] + 1);

        resultado.textContent = m.explicacion;
        resultado.className = "result good";

        bloquearRespuestas();
        btnComprobar.hidden = true;
        btnSiguiente.hidden = false;

        btnSiguiente.textContent =
            misionActual === misiones.length - 1
                ? "FINALIZAR OPERACIÓN ✓"
                : "SIGUIENTE MISIÓN →";

        const mensajesExito = [
            "¡Buen trabajo! Detectaste la señal sospechosa. Un buen análisis evita problemas.",
            "Excellent! PASSWORD significa contraseña. ¡Tu inglés también ayuda a proteger el sistema!",
            "¡Conexión restaurada! DHCP se encarga de asignar direcciones IP automáticamente.",
            "¡Secuencia correcta! Tenés buena memoria, operador. El acceso está habilitado.",
            "Great! HELLO significa hola. ¡Checkpoint de inglés superado!",
            "¡Código interpretado correctamente! Como acceso es true, se muestra ENTRADA.",
            "¡Permisos correctos! El comando chmod 755 quedó validado.",
            "¡NÚCLEO DESACTIVADO! Elegiste avisar al personal técnico. Esa es la decisión segura."
        ];
        actualizarNexo(mensajesExito[misionActual] || "¡Desafío superado! Seguimos avanzando.", "happy");
        actualizarPanel();
        actualizarDirectorios();
    } else {
        vidas--;
        actualizarPanel();

        resultado.textContent =
            m.pista
                ? "Respuesta incorrecta. Perdiste una vida. " + "Revisá la pista e intentá otra vez."
                : "Respuesta incorrecta. Perdiste una vida. Probá nuevamente.";

        resultado.className = "result bad";
        actualizarNexo(
            vidas > 1
                ? "Ojo, esa no era. No te rindas: revisá la pista y probá otra vez. ¡Todavía podemos recuperar el sistema!"
                : "¡Alerta, operador! Nos queda una sola oportunidad. Pensá bien la próxima respuesta.",
            "alert"
        );

        if (vidas <= 0) {
            terminarJuego(false, "Te quedaste sin integridad. El sistema no pudo recuperarse.");
        }
    }
}

function bloquearRespuestas() {
    zonaDesafio.querySelectorAll("button, input").forEach((elemento) => {
        elemento.disabled = true;
    });
}

function siguienteMision() {
    if (!respondida || juegoTerminado) return;

    if (desafiosCompletados >= misiones.length) {
        terminarJuego(true, "Superaste los ocho minijuegos, exploraste todos los directorios y recuperaste el sistema escolar.");
        return;
    }

    const indice = directorioActual;
    if (indice !== null && progresoDirectorios[indice] < 2) {
        misionActual = directorios[indice].misiones[progresoDirectorios[indice]];
        cargarMision();
    } else {
        $("zonaJuego").hidden = true;
        $("zonaDirectorios").hidden = false;
        directorioActual = null;
        actualizarDirectorios();
        actualizarNexo("¡Directorio completado! Elegí la siguiente carpeta desbloqueada.", "happy");
    }
}

function terminarJuego(victoria, mensajeFinal) {
    if (juegoTerminado) return;

    juegoTerminado = true;

    clearInterval(intervalo);
    intervalo = null;

    $("zonaJuego").hidden = true;
    $("zonaDirectorios").hidden = true;
    $("pantallaInicio").hidden = true;
    $("pantallaInstrucciones").hidden = true;
    $("pantallaFinal").hidden = false;

    $("iconoFinal").textContent = victoria ? "✓" : "×";
    $("celebracionMonigote").hidden = !victoria;
    $("iconoFinal").hidden = victoria;
    $("tituloFinal").textContent = victoria
        ? "OPERACIÓN COMPLETADA"
        : "OPERACIÓN FALLIDA";

    $("textoFinal").textContent = mensajeFinal;
    $("puntajeFinal").textContent = puntos;

    actualizarNexo(
        victoria
            ? "¡LO LOGRAMOS! El sistema escolar volvió a estar operativo. ¡Excelente trabajo, operador!"
            : "La misión terminó, operador. No pasa nada: analizá los desafíos y podemos intentarlo de nuevo.",
        victoria ? "happy" : "thinking"
    );

    $("barraProgreso").style.width =
        `${(desafiosCompletados / misiones.length) * 100}%`;
}

function reiniciarJuego() {
    clearInterval(intervalo);
    intervalo = null;

    segundosRestantes = DURACION;
    puntos = 0;
    vidas = 3;
    misionActual = 0;
    desafiosCompletados = 0;
    directorioActual = null;
    progresoDirectorios.fill(0);
    seleccion = null;
    respondida = false;
    juegoTerminado = false;
    introEnCurso = false;
    clearTimeout(esperaInicio);
    clearTimeout(esperaConexion);
    esperaInicio = null;
    esperaConexion = null;

    mostrarTiempo();
    actualizarPanel();

    $("pantallaInicio").hidden = false;
    $("pantallaInstrucciones").hidden = true;
    $("zonaJuego").hidden = true;
    $("zonaDirectorios").hidden = true;
    $("pantallaFinal").hidden = true;
    $("celebracionMonigote").hidden = true;
    $("iconoFinal").hidden = false;
    actualizarDirectorios();
    btnIniciar.disabled = false;
    btnIniciar.textContent = "INICIAR OPERACIÓN →";
    $("escenaIntro").classList.remove("walking", "connected");
    $("mensajeEscena").textContent = "WAITING FOR OPERATOR...";
    $("computadora").querySelector(".computer-text").innerHTML = "SYSTEM<br>OFFLINE";

    $("numeroMision").textContent = "MISIÓN 00";
    actualizarNexo("Te estaba esperando. Tenemos que recuperar el sistema.", "normal");

    resultado.textContent = "";
}

btnIniciar.addEventListener("click", iniciarJuego);
btnComprobar.addEventListener("click", comprobarRespuesta);
btnSiguiente.addEventListener("click", siguienteMision);
btnReiniciar.addEventListener("click", reiniciarJuego);
$("btnVolverDirectorios").addEventListener("click", volverADirectorios);
document.querySelectorAll("[data-directory]").forEach((boton) => boton.addEventListener("click", () => entrarDirectorio(Number(boton.dataset.directory))));
document.querySelectorAll("[data-open-directory]").forEach((boton) => boton.addEventListener("click", () => entrarDirectorio(Number(boton.dataset.openDirectory))));

mostrarTiempo();
actualizarPanel();
actualizarDirectorios();

$("btnComenzarMision").addEventListener("click", function () {
    comenzarPartida();
});

