
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

// Banda sonora original estilo videojuego hacker, generada con Web Audio.
// No necesita MP3 ni conexión a Internet: comienza al pulsar INICIAR.
let contextoAudio = null;
let musicaActiva = true;
let intervaloMusica = null;
let pasoMusica = 0;
const melodia = [
    523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.00, 698.46,
    523.25, 659.25, 987.77, 783.99, 587.33, 698.46, 880.00, 783.99
];
const bajos = [65.41, 65.41, 98.00, 65.41, 73.42, 73.42, 110.00, 73.42];

function tono(frecuencia, duracion, tipo = "square", volumenMax = 0.025, momento = null) {
    if (!contextoAudio) return;
    const ahora = momento ?? contextoAudio.currentTime;
    const oscilador = contextoAudio.createOscillator();
    const volumen = contextoAudio.createGain();
    oscilador.type = tipo;
    oscilador.frequency.setValueAtTime(frecuencia, ahora);
    volumen.gain.setValueAtTime(0.0001, ahora);
    volumen.gain.exponentialRampToValueAtTime(volumenMax, ahora + 0.015);
    volumen.gain.exponentialRampToValueAtTime(0.0001, ahora + duracion);
    oscilador.connect(volumen);
    volumen.connect(contextoAudio.destination);
    oscilador.start(ahora);
    oscilador.stop(ahora + duracion + 0.02);
}

function golpeBajo(momento) {
    if (!contextoAudio) return;
    const oscilador = contextoAudio.createOscillator();
    const volumen = contextoAudio.createGain();
    oscilador.type = "sine";
    oscilador.frequency.setValueAtTime(115, momento);
    oscilador.frequency.exponentialRampToValueAtTime(42, momento + 0.13);
    volumen.gain.setValueAtTime(0.12, momento);
    volumen.gain.exponentialRampToValueAtTime(0.0001, momento + 0.15);
    oscilador.connect(volumen);
    volumen.connect(contextoAudio.destination);
    oscilador.start(momento);
    oscilador.stop(momento + 0.16);
}

function pasoDeMusica() {
    if (!contextoAudio || !musicaActiva) return;
    const ahora = contextoAudio.currentTime + 0.015;
    const paso = pasoMusica % 16;
    // Melodía electrónica y bajo pulsante.
    if (paso % 2 === 0) {
        tono(melodia[paso], 0.19, "sawtooth", 0.012, ahora);
        tono(bajos[Math.floor(paso / 2)], 0.22, "triangle", 0.045, ahora);
    }
    // Golpe rítmico suave cada cuatro pasos.
    if (paso % 4 === 0) golpeBajo(ahora);
    // Hi-hat sintético en contratiempos.
    if (paso % 2 === 1) tono(1150, 0.035, "square", 0.004, ahora);
    pasoMusica++;
}

function iniciarAudio() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!contextoAudio) contextoAudio = new AudioCtx();
    if (contextoAudio.state === "suspended") contextoAudio.resume();
    if (!musicaActiva || intervaloMusica) return;
    pasoDeMusica();
    intervaloMusica = setInterval(pasoDeMusica, 250);
}
function detenerMusica() {
    if (intervaloMusica) clearInterval(intervaloMusica);
    intervaloMusica = null;
}
function reproducirError() {
    if (!contextoAudio) return;
    const ahora = contextoAudio.currentTime;
    [185, 140].forEach((frecuencia, i) => {
        const osc = contextoAudio.createOscillator();
        const volumen = contextoAudio.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(frecuencia, ahora + i * 0.16);
        volumen.gain.setValueAtTime(0.0001, ahora + i * 0.16);
        volumen.gain.linearRampToValueAtTime(0.12, ahora + i * 0.16 + 0.025);
        volumen.gain.exponentialRampToValueAtTime(0.0001, ahora + i * 0.16 + 0.22);
        osc.connect(volumen); volumen.connect(contextoAudio.destination);
        osc.start(ahora + i * 0.16); osc.stop(ahora + i * 0.16 + 0.23);
    });
}
function alternarAudio() {
    musicaActiva = !musicaActiva;
    const boton = $("btnAudio");
    boton.textContent = musicaActiva ? "♫ MÚSICA: ON" : "♫ MÚSICA: OFF";
    boton.setAttribute("aria-pressed", String(musicaActiva));
    if (musicaActiva) iniciarAudio(); else detenerMusica();
}


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
        categoria: "MINIJUEGO 01 // ENGLISH BASICS",
        titulo: "Vocabulary check",
        descripcion: "Elegí el significado correcto de una palabra básica en inglés.",
        tipo: "opciones", nexo: "Empezamos con inglés básico. ¡Vos podés, operador!",
        pregunta: "What does COMPUTER mean? (¿Qué significa COMPUTER?)",
        opciones: ["Teléfono", "Computadora", "Ventana", "Libro"], correcta: 1,
        explicacion: "Correct! COMPUTER significa computadora."
    },
    {
        categoria: "MINIJUEGO 02 // ENGLISH BASICS",
        titulo: "Complete the sentence",
        descripcion: "Completá una frase sencilla usando la palabra correcta.",
        tipo: "opciones", nexo: "Leé la oración y elegí la palabra que falta.",
        pregunta: "I ____ a student. (Yo soy estudiante.)",
        opciones: ["am", "is", "are", "be"], correcta: 0,
        explicacion: "Great! Con I usamos AM: I am a student."
    },
    {
        categoria: "MINIJUEGO 03 // PROGRAMMING BASICS",
        titulo: "Variables en JavaScript",
        descripcion: "Identificá qué palabra se usa para declarar una variable que puede cambiar.",
        tipo: "opciones", nexo: "Ahora pasamos a programación. ¡Pensá como programador!",
        pregunta: "¿Qué palabra permite declarar una variable que puede cambiar?",
        opciones: ["const", "let", "function", "return"], correcta: 1,
        explicacion: "Correcto. let declara una variable cuyo valor puede cambiar."
    },
    {
        categoria: "MINIJUEGO 04 // PROGRAMMING BASICS",
        titulo: "¿Qué muestra la consola?",
        descripcion: "Leé este pequeño código de JavaScript y descubrí el resultado.",
        tipo: "opciones", nexo: "No hace falta ejecutar el código: solo tenés que leerlo.",
        codigo: 'let nombre = "NEXO";\nconsole.log(nombre);',
        pregunta: "¿Qué se muestra en la consola?",
        opciones: ["nombre", "console", "NEXO", "ERROR"], correcta: 2,
        explicacion: "¡Exacto! console.log(nombre) muestra el contenido de la variable: NEXO."
    },
    {
        categoria: "MINIJUEGO 05 // ENGLISH BASICS",
        titulo: "Greetings",
        descripcion: "Reconocé un saludo común en inglés.",
        tipo: "opciones", nexo: "A little more English! Elegí el saludo correcto.",
        pregunta: "Which word means HOLA?",
        opciones: ["Goodbye", "Please", "Hello", "Thanks"], correcta: 2,
        explicacion: "Excellent! HELLO significa hola."
    },
    {
        categoria: "MINIJUEGO 06 // PROGRAMMING BASICS",
        titulo: "Condicional IF",
        descripcion: "Analizá qué sucede cuando una condición es verdadera.",
        tipo: "opciones", nexo: "Los condicionales permiten que un programa tome decisiones.",
        codigo: 'let edad = 18;\nif (edad >= 18) {\n  console.log("Mayor");\n}',
        pregunta: "¿Qué mensaje muestra el programa?",
        opciones: ["Menor", "Mayor", "18", "No muestra nada"], correcta: 1,
        explicacion: "Correcto. Como 18 es mayor o igual a 18, se muestra Mayor."
    },
    {
        categoria: "MINIJUEGO 07 // PROGRAMMING BASICS",
        titulo: "Escribí un comando",
        descripcion: "En JavaScript, console.log() permite mostrar información en la consola.",
        tipo: "texto", nexo: "Ahora escribí el comando tal como corresponde.",
        pregunta: "Escribí la instrucción para mostrar Hola en la consola.",
        respuesta: 'console.log("hola")',
        explicacion: "¡Bien! console.log(\"hola\") muestra el texto Hola en la consola.",
        pista: 'Usá console.log("hola")'
    },
    {
        categoria: "MINIJUEGO 08 // FINAL BOSS: ENGLISH + CODE",
        titulo: "Final checkpoint",
        descripcion: "Último desafío: combiná inglés básico y programación.",
        tipo: "opciones", nexo: "¡Última prueba, operador! Ya casi recuperamos el sistema.",
        pregunta: "In programming, what does the word TRUE mean?",
        opciones: ["Falso", "Verdadero", "Vacío", "Texto"], correcta: 1,
        explicacion: "MISSION COMPLETE! TRUE significa verdadero y es un valor booleano."
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
            "Correct! Buen comienzo con vocabulario en inglés.",
            "Excellent! La oración está completa.",
            "¡Variable correcta! Ya dominás lo básico de let.",
            "¡Código interpretado! La consola muestra el valor de la variable.",
            "Great! HELLO significa hola.",
            "¡Condición correcta! El programa tomó la decisión esperada.",
            "¡Comando correcto! Ya podés mostrar mensajes en JavaScript.",
            "¡Desafío final superado! Combinaste inglés y programación."
        ];
        actualizarNexo(mensajesExito[misionActual] || "¡Desafío superado!", "happy");
        actualizarPanel();
        actualizarDirectorios();
    } else {
        reproducirError();
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

btnIniciar.addEventListener("click", () => { iniciarAudio(); iniciarJuego(); });
$("btnAudio").addEventListener("click", alternarAudio);
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

