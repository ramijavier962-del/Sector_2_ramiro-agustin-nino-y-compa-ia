
const DURACION = 600;

let segundosRestantes = DURACION;
let intervalo = null;
let puntos = 0;
let vidas = 3;
let misionActual = 0;
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
        categoria: "MINIJUEGO 02 // TERMINAL",
        titulo: "La terminal perdida",
        descripcion: "Necesitamos conocer la configuración IP de una computadora Windows.",
        tipo: "texto",
        nexo: "La terminal nos puede dar información importante. Escribí el comando correcto.",
        pregunta: "Escribí el comando para consultar la configuración IP en Windows.",
        respuesta: "ipconfig",
        explicacion: "¡Bien! ipconfig permite consultar información de la configuración de red en Windows.",
        pista: "Empieza con ip y termina con config."
    },
    {
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
        categoria: "MINIJUEGO 05 // DESARROLLO WEB",
        titulo: "Repará la página",
        descripcion: "La página no tiene un encabezado principal. Necesitamos la etiqueta HTML adecuada.",
        tipo: "opciones",
        nexo: "Vamos con algo de desarrollo web. HTML utiliza etiquetas para organizar el contenido.",
        pregunta: "¿Qué etiqueta representa un encabezado principal?",
        opciones: [
            "<main>",
            "<h1>",
            "<footer>",
            "<img>"
        ],
        correcta: 1,
        explicacion: "¡Correcto! h1 se utiliza para el encabezado de mayor nivel de la página."
    },
    {
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
        pregunta: "¿Qué deberías hacer primero ante una computadora sospechosa de estar infectada?",
        opciones: [
            "Abrir todos los archivos",
            "Ignorar las alertas",
            "Seguir las indicaciones de seguridad y avisar al responsable",
            "Desactivar todas las protecciones"
        ],
        correcta: 2,
        explicacion: "¡NÚCLEO NEUTRALIZADO! Seguir el procedimiento de seguridad y avisar al responsable evita empeorar el incidente."
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
        `${misionActual}/${misiones.length}`;

    $("barraProgreso").style.width =
        `${(misionActual / misiones.length) * 100}%`;
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

    mensajeEscena.textContent = "OPERADOR EN MOVIMIENTO...";
    mensajeNexo.textContent =
        "Operador detectado. Esperando conexión con la terminal.";

    // El monigote camina hacia la computadora
    esperaInicio = setTimeout(() => {
        escena.classList.add("connected");
        mensajeEscena.textContent = "CONEXIÓN ESTABLECIDA";

        $("computadora").querySelector(".computer-text").innerHTML =
            "SYSTEM<br>ONLINE";

        mensajeNexo.textContent =
            "Conexión establecida. Iniciando la operación...";

        // Espera un momento antes de comenzar el juego
        esperaConexion = setTimeout(() => {
            comenzarPartida();
        }, 900);

    }, 2200);
}

function comenzarPartida() {
    introEnCurso = false;
    esperaInicio = null;
    esperaConexion = null;

    $("pantallaInicio").hidden = true;
    $("pantallaFinal").hidden = true;
    $("zonaJuego").hidden = false;

    cargarMision();

    intervalo = setInterval(() => {
        segundosRestantes--;
        mostrarTiempo();

        if (segundosRestantes <= 0) {
            segundosRestantes = 0;
            mostrarTiempo();

            terminarJuego(
                false,
                "Se terminó el tiempo. El sistema quedó bloqueado."
            );
        }
    }, 1000);
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
    mensajeNexo.textContent = m.nexo;

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

        resultado.textContent = m.explicacion;
        resultado.className = "result good";

        bloquearRespuestas();
        btnComprobar.hidden = true;
        btnSiguiente.hidden = false;

        btnSiguiente.textContent =
            misionActual === misiones.length - 1
                ? "FINALIZAR OPERACIÓN ✓"
                : "SIGUIENTE MISIÓN →";

        mensajeNexo.textContent = "Desafío superado. Seguimos avanzando.";
        actualizarPanel();
    } else {
        vidas--;
        actualizarPanel();

        resultado.textContent =
            m.pista
                ? "Respuesta incorrecta. Perdiste una vida. " + "Revisá la pista e intentá otra vez."
                : "Respuesta incorrecta. Perdiste una vida. Probá nuevamente.";

        resultado.className = "result bad";

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

    misionActual++;
    cargarMision();
}

function terminarJuego(victoria, mensajeFinal) {
    if (juegoTerminado) return;

    juegoTerminado = true;

    clearInterval(intervalo);
    intervalo = null;

    $("zonaJuego").hidden = true;
    $("pantallaInicio").hidden = true;
    $("pantallaFinal").hidden = false;

    $("iconoFinal").textContent = victoria ? "✓" : "×";
    $("tituloFinal").textContent = victoria
        ? "OPERACIÓN COMPLETADA"
        : "OPERACIÓN FALLIDA";

    $("textoFinal").textContent = mensajeFinal;
    $("puntajeFinal").textContent = puntos;

    mensajeNexo.textContent = victoria
        ? "¡Lo logramos! El sistema escolar volvió a estar operativo."
        : "La misión terminó. Podés reiniciar y volver a intentarlo.";

    $("barraProgreso").style.width =
        `${(misionActual / misiones.length) * 100}%`;
}

function reiniciarJuego() {
    clearInterval(intervalo);
    intervalo = null;

    segundosRestantes = DURACION;
    puntos = 0;
    vidas = 3;
    misionActual = 0;
    seleccion = null;
    respondida = false;
    juegoTerminado = false;

    mostrarTiempo();
    actualizarPanel();

    $("pantallaInicio").hidden = false;
    $("zonaJuego").hidden = true;
    $("pantallaFinal").hidden = true;

    $("numeroMision").textContent = "MISIÓN 00";
    mensajeNexo.textContent =
        "Te estaba esperando. Tenemos que recuperar el sistema.";

    resultado.textContent = "";
}

btnIniciar.addEventListener("click", iniciarJuego);
btnComprobar.addEventListener("click", comprobarRespuesta);
btnSiguiente.addEventListener("click", siguienteMision);
btnReiniciar.addEventListener("click", reiniciarJuego);

mostrarTiempo();
actualizarPanel();
