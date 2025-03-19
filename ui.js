// ui.js
console.log("✅ [ui.js] Cargado correctamente.");


// PARA QUITAR SIMULACIONES HAY QUE ELIMINARLO
// Activar o desactivar la simulación
let useSimulation = localStorage.getItem("useSimulation") === "true";

console.log(`🔄 Modo de simulación: ${useSimulation ? "Activado (Pruebas)" : "Desactivado (Real)"}`);


function showElement(element) {
    if (element) element.style.display = 'block';
}

function hideElement(element) {
    if (element) element.style.display = 'none';
}


function updateUIBasedOnAuth(isAuthenticated) {
    console.log(`🔍 [Debug] updateUIBasedOnAuth(${isAuthenticated}) ejecutado.`);
    console.log(`🔄 [updateUIBasedOnAuth] Actualizando UI, autenticado: ${isAuthenticated}`);

    const loginBox = document.getElementById('loginBox');
    const loginMenu = document.getElementById('loginMenu');
    const logoutBox = document.getElementById('logoutBox');

    if (!loginBox || !loginMenu) {
        console.warn("⚠️ [updateUIBasedOnAuth] No se encontró loginBox o loginMenu.");
        return;
    }

    hideElement(document.getElementById('profileBox'));
    hideElement(document.getElementById('tournamentsBox'));
    hideElement(document.getElementById('gameModesBox'));

    if (isAuthenticated) {
        console.warn("✅ [updateUIBasedOnAuth] Usuario autenticado. Mostramos menús.");
        showElement(document.getElementById('profileBox'));
        showElement(document.getElementById('tournamentsBox'));
        showElement(document.getElementById('gameModesBox'));

        // Mostrar "Log out" y ocultar "Log in"
        hideElement(loginBox);
        showElement(logoutBox);

        // Aquí es donde hacemos que Logout sea navegable, antes no podíamos.
        logoutBox.setAttribute("tabindex", "0");
        logoutBox.addEventListener("keydown", function(event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                this.click();
            }
        });
    } else {
        console.warn("🔴 [updateUIBasedOnAuth] Usuario no autenticado. Mostramos solo Login.");
        hideElement(document.getElementById('profileBox'));
        hideElement(document.getElementById('tournamentsBox'));
        hideElement(document.getElementById('gameModesBox'));

        // Mostrar "Log in" y ocultar "Log out"
        showElement(loginBox);
        hideElement(logoutBox);
    }
}


// 🔹 Abre/cierra submenús desplegándolos a la derecha
function toggleSubMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (!menu) return;

    // Ocultar todos los demás submenús antes de abrir uno nuevo
    document.querySelectorAll('.submenu').forEach(m => {
        if (m !== menu) {
            m.classList.remove('visible');
            m.style.opacity = "0";
            m.style.visibility = "hidden";
            m.style.pointerEvents = "none";
            m.style.transform = "translateX(-10px)"; // Pequeña animación para cerrar suavemente
        }
    });

    // Alternar visibilidad con efecto suave
    if (menu.classList.contains('visible')) {
        menu.classList.remove('visible');
        menu.style.opacity = "0";
        menu.style.visibility = "hidden";
        menu.style.pointerEvents = "none";
        menu.style.transform = "translateX(-10px)"; // Pequeña animación de cierre
    } else {
        menu.classList.add('visible');
        menu.style.opacity = "1";
        menu.style.visibility = "visible";
        menu.style.pointerEvents = "auto"; // Reactivar interacción
        menu.style.transform = "translateX(0)"; // Abre suavemente
    }
}

// 🔹 Permitir apertura de submenús con teclado
document.querySelectorAll(".menu-option").forEach(menu => {
    menu.setAttribute("tabindex", "0"); // Permitir navegación con Tab
    
    menu.addEventListener("keydown", function(event) {
        if (event.key === "Enter" || event.key === " ") {
            toggleSubMenu(menu.id.replace("Box", "Menu"));
        }
    });
});


// Cierra todos los submenús cuando se hace clic fuera
document.addEventListener('click', (event) => {
    if (!event.target.closest('.menu-option') && !event.target.closest('.submenu')) {
        document.querySelectorAll('.submenu').forEach(menu => menu.classList.remove('visible'));
    }
});



// languageSelector
// + asignar eventos al cargar la página
// Añadido asignación para navigateTo...
document.addEventListener("DOMContentLoaded", function () {
    console.log("UI cargada. Asignando eventos...");

    // ✅ Asegurar que estos eventos solo se asignen una vez
    if (!document.body.dataset.eventsAssigned) {
        document.body.dataset.eventsAssigned = "true";

        // 🔹 ✅ Asignamos eventos de navegación a los botones principales
        console.log("🔄 [UI] Asignando eventos de navegación a los botones principales...");

        const navigationButtons = {
            "profileBox": "profile",
            "gameModesBox": "gameModes",
            "tournamentsBox": "tournaments"
        };
        
        Object.entries(navigationButtons).forEach(([buttonId, view]) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener("click", (event) => {
                    event.stopPropagation(); // Evita conflictos con elementos internos
                    console.log(`🟢 [UI] Click en ${buttonId}, navegando a #${view}`);
                    navigateTo(view);
                });
            } else {
                console.warn(`⚠️ [UI] Botón no encontrado: ${buttonId}`);
            }
        });

        // ✅ Asignamos eventos a otros elementos de la UI
        assignLoginLogoutEvents();
        assignSubMenuEvents();
        assignDynamicSubMenuEvents();
        assignMainMenuEvents();
        assignAvatarEvents();
        assignTournamentEvents();
    }

    // ✅ Asegurar que solo asignamos tabindex a elementos válidos
    document.querySelectorAll(".login-option").forEach(option => {
        if (!option) return; // 🔹 Evita errores si `option` es `null` o `undefined`

        option.setAttribute("tabindex", "0"); // Permitir navegación con Tab

        option.addEventListener("keydown", function(event) {
            if ((event.key === "Enter" || event.key === " ") && event.target === document.activeElement) {
                event.preventDefault();
                this.click(); // Simula clic en la opción seleccionada
            }
        });
    });

    // 🔹 Eliminar el fondo oscuro cuando se abre un modal
    document.addEventListener("shown.bs.modal", function () {
        setTimeout(() => {
            document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
            console.log("🟢 Eliminado modal-backdrop.");
        }, 100);
    });

    const languageBox = document.getElementById("languageBox");
    const languageSelector = document.getElementById("languageSelector");
    if (languageBox && languageSelector) {
        languageBox.setAttribute("tabindex", "0"); // ✅ Hacerlo navegable con teclado
    
        // ✅ Permitir abrir con clic o teclado (Enter y Espacio)
        function toggleLanguageSelector(event) {
            if (event.type === "click" || event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                console.log("🌍 Toggle en LanguageBox, abriendo/cerrando selector...");
                languageBox.classList.toggle("active");
                languageSelector.classList.toggle("hidden");

                // ✅ Enfocar el `select` automáticamente al abrir el selector
                if (!languageSelector.classList.contains("hidden")) {
                    setTimeout(() => {
                        languageSelector.focus();
                    }, 100);
                }
            }
        }

        languageBox.addEventListener("click", toggleLanguageSelector);
        languageBox.addEventListener("keydown", toggleLanguageSelector);

        // 🔹 Asegurar que el `click` en el selector de idioma no lo cierre inmediatamente
        languageSelector.addEventListener("click", function (event) {
            event.stopPropagation(); // 🔹 Evita que el clic cierre el selector
            console.log("🌍 Click en LanguageSelector detectado");
        });

        // 🔹 Cerrar el selector solo si se hace clic fuera, pero NO al seleccionar un idioma
        document.addEventListener("click", function (event) {
            if (!languageBox.contains(event.target) && !languageSelector.contains(event.target)) {
                languageBox.classList.remove("active");
                languageSelector.classList.add("hidden");
            }
        });

        // ✅ Cerrar con Escape o Tab
        languageSelector.addEventListener("keydown", function (event) {
            if (event.key === "Escape" || event.key === "Tab") {
                console.log("❌ Cerrando selector de idioma...");
                languageBox.classList.remove("active");
                languageSelector.classList.add("hidden");
                languageBox.focus(); // ✅ Devolver el foco al botón de idioma
            }
        });

        // ✅ Mantener abierto si el usuario usa el teclado para seleccionar un idioma
        languageSelector.addEventListener("change", function () {
            const selectedLanguage = this.value;
            console.log(`🌍 Cambiando idioma a: ${selectedLanguage}`);
            localStorage.setItem("language", selectedLanguage);
            applyLanguage();

            // ✅ Dejar un pequeño tiempo antes de cerrar para evitar interrupciones
            setTimeout(() => {
                languageBox.classList.remove("active");
                languageSelector.classList.add("hidden");
                languageBox.focus();
            }, 200);
        });

    } else {
        console.warn("⚠️ No se encontró #languageBox o #languageSelector.");
    }

    applyLanguage();
});



// Cerrar submenús y modales con "Esc": lo ponemos aqui porque acaba de cargar los eventos.
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        console.log("🔴 [UI] Escape presionado. Cerrando menús y modales...");

        // Cerrar submenús abiertos
        document.querySelectorAll(".submenu.visible").forEach(menu => {
            menu.classList.remove("visible");
            menu.style.opacity = "0";
            menu.style.visibility = "hidden";
            menu.style.pointerEvents = "none";
        });

        // Cerrar cualquier modal abierto
        document.querySelectorAll(".modal.show").forEach(modal => {
            bootstrap.Modal.getInstance(modal).hide();
        });
    }
});




/*
function applyLanguage() {
    const lang = localStorage.getItem("language") || "en";
    console.log(`🌍 Aplicando idioma: ${lang}`);

    document.querySelectorAll("[data-translate]").forEach(element => {
        const key = element.getAttribute("data-translate");
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === "INPUT") {
                element.setAttribute("placeholder", translations[lang][key]); // Para inputs
            } else {
                element.innerHTML = translations[lang][key]; // Forzar actualización de texto
            }
        } else {
            console.warn(`⚠️ No hay traducción para: ${key}`);
        }
    });
}*/





// 🔹 Asigna eventos al login y logout
function assignLoginLogoutEvents() {
    console.log("🔍 [Debug] assignLoginLogoutEvents() ejecutado.");
    console.log("🔹 [Debug] Ejecutando assignLoginLogoutEvents()...");

    const loginButton = document.getElementById('loginBox');
    const logoutButton = document.getElementById('logoutBox');

    if (loginButton) {
        loginButton.addEventListener("click", () => toggleSubMenu('loginMenu'));
        console.log("🟢 Evento asignado: Toggle Login Menu");
    } else {
        console.warn("⚠️ Botón de Log in no encontrado.");
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            console.log("🛑 Logout seleccionado. Cerrando sesión...");
            typeof logoutUser === "function" ? logoutUser() : console.error("❌ Error: logoutUser no está definida.");
        });
        console.log("🟢 Evento asignado: Logout");
    } else {
        console.warn("⚠️ Botón de Log out no encontrado.");
    }
}



// 🔹 Captura eventos dentro del submenú de Login
function assignSubMenuEvents() {
    console.log("🔹 Asignando eventos a las opciones del submenú de Login...");

    // ✅ Asegurar que `keydown` solo se asigna una vez
    document.querySelectorAll(".login-option").forEach(option => {
        option.setAttribute("tabindex", "0"); // Permitir navegación con Tab

        console.log(`🟢 Asignando eventos a: ${option.id}`);

        // ❌ Evitar múltiples eventos acumulados
        option.removeEventListener("keydown", handleSubmenuKeydown);
        option.addEventListener("keydown", handleSubmenuKeydown);
        console.log(`✅ Evento keydown asignado a: ${option.id}`);

        option.removeEventListener("click", handleSubmenuClick);
        option.addEventListener("click", handleSubmenuClick);
        console.log(`✅ Evento click asignado a: ${option.id}`);
    });

    console.log("✅ Eventos de submenú asignados correctamente.");
}

// ✅ Función separada para manejar `keydown`
function handleSubmenuKeydown(event) {
    if ((event.key === "Enter" || event.key === " ") && event.target === document.activeElement) {
        event.preventDefault();

        const action = event.target.id || event.target.dataset.action;
        console.log(`🟢 [handleSubmenuKeydown] Activando opción de menú: ${action}`);

        setTimeout(() => {
            let menuItem = document.getElementById(action);

            if (menuItem) {
                console.log(`🟢 Simulando click en: ${action}`);
                menuItem.click();
            } else {
                console.warn(`⚠️ No se encontró el elemento: ${action}`);
            }
        }, 50);  // ✅ Esperamos 50ms para asegurar que el DOM esté listo
    }
}



let avatarModalInstance = null; // 🔹 Variable global para evitar instancias duplicadas

// ✅ Función separada para manejar `click` y evitar eventos duplicados
function handleSubmenuClick(event) {
    console.log("🔍 [Debug] handleSubmenuClick() ejecutado para:", event.target.id);

    // Si ya se ha procesado, ignoramos el evento duplicado
    if (event.target.dataset.clicked) {  
        console.warn(`⚠️ [handleSubmenuClick] Ignorando click duplicado en: ${event.target.id}`);
        return; 
    }

    // Bloquear clicks repetidos durante un breve período
    event.target.dataset.clicked = "true";  
    setTimeout(() => delete event.target.dataset.clicked, 200);  

    console.log(`🔹 Opción de login seleccionada: ${event.target.id}`);
    console.trace("📌 Rastreo del evento click");

    const action = event.target.id || event.target.dataset.action;

    const loginActions = {
        "sign-up": () => {
            console.log("🟢 Abriendo modal de registro...");
            setTimeout(() => new bootstrap.Modal(document.getElementById("signUpModal")).show(), 10);
        },
        "login-email": () => {
            console.log("🟢 Abriendo modal de login con email...");
            setTimeout(() => typeof secureLoginWithEmail === "function" ? secureLoginWithEmail() : console.error("❌ Error: secureLoginWithEmail no está definida."), 10);
        },
        "login-intra": () => {
            console.log("🟢 Abriendo modal de login con intra...");
            setTimeout(() => typeof loginWithIntra === "function" ? loginWithIntra() : console.error("❌ Error: loginWithIntra no está definida."), 10);
        },
        "login-username": () => {
            console.log("🟢 Abriendo modal de login con username...");
            setTimeout(() => {
                let loginUsernameModal = new bootstrap.Modal(document.getElementById("loginUsernameModal"));
                loginUsernameModal.show();
            }, 10);
        },
        "change-avatar": () => {
            console.log("🖼️ Abriendo modal de cambio de avatar...");
            new bootstrap.Modal(document.getElementById("changeAvatarModal")).show();
        },


        "log-out": () => {
            console.log("🛑 Seleccionado Log out en el menú. Cerrando sesión...");
            setTimeout(() => typeof logoutUser === "function" ? logoutUser() : console.error("❌ Error: logoutUser no está definida."), 10);
        },
        "change-username": () => {
            console.log("🟢 Abriendo modal de cambio de nombre de usuario...");
            setTimeout(() => new bootstrap.Modal(document.getElementById("changeUsernameModal")).show(), 10);
        },
        "toggle-2fa": () => {
            console.log("🛡️ Abriendo modal de 2FA...");
            setTimeout(() => {
                const twoFAEnabled = getCookie("2fa_required") === "true";
                document.getElementById("2faMessage").textContent = twoFAEnabled
                    ? getTranslation("disable-2fa")
                    : getTranslation("enable-2fa");
                new bootstrap.Modal(document.getElementById("toggle2FAModal")).show();
            }, 10);
        },
        "change-password": () => {
            console.log("🔑 Abriendo modal de cambio de contraseña...");
            setTimeout(() => new bootstrap.Modal(document.getElementById("changePasswordModal")).show(), 10);
        },

        "change-avatar": () => {
            console.log("🖼️ Abriendo modal de cambio de avatar...");

            if (!avatarModalInstance) { // ✅ Solo crea la instancia una vez
                avatarModalInstance = new bootstrap.Modal(document.getElementById("changeAvatarModal"));
            }
            
            avatarModalInstance.show();
        },

        "create-tournament": () => {
            console.log(" Abriendo modal de creación de torneo...");
            setTimeout(() => new bootstrap.Modal(document.getElementById("tournamentModal")).show(), 10);
            // ✅ Asegurar que la pestaña "Create" está seleccionada al abrir el modal
            document.getElementById("createTab").click();
        },
        "join-tournament": () => {
            console.log(" Abriendo modal para unirse a un torneo...");
            setTimeout(() => new bootstrap.Modal(document.getElementById("tournamentModal")).show(), 10);
            // ✅ Asegurar que la pestaña "Join" está seleccionada al abrir el modal
            document.getElementById("joinTab").click();
        }
    };


    if (loginActions[action]) {
        loginActions[action]();
    } else {
        console.warn(`⚠️ Acción no reconocida: ${action}`);
    }
}






// 🔹 Asignar eventos al cambio de avatar
// 🔹 Asignar eventos al cambio de avatar
function assignAvatarEvents() {
    console.log("🔍 [Debug] assignAvatarEvents() ejecutado.");

    const avatarModal = document.getElementById("changeAvatarModal");
    const avatarInput = document.getElementById("avatarInput");
    const saveAvatarBtn = document.getElementById("saveAvatar");
    const avatarImage = document.getElementById("avatar");
    const avatarPreview = document.getElementById("avatarPreview");

    console.log("📌 Verificando elementos:", { avatarModal, avatarInput, saveAvatarBtn, avatarImage, avatarPreview });

    if (!avatarModal || !avatarInput || !saveAvatarBtn || !avatarImage || !avatarPreview) {
        console.warn("⚠️ [assignAvatarEvents] Algunos elementos no se encontraron.");
        return;
    }

    // ✅ Restaurar avatar desde localStorage si existe
    const savedAvatar = localStorage.getItem("userAvatar");
    if (savedAvatar) {
        avatarImage.src = savedAvatar;
        avatarPreview.src = savedAvatar; // ✅ También actualiza el preview
    } else {
        console.warn("⚠️ No hay avatar guardado en localStorage, dejando el espacio vacío.");
        avatarImage.src = "";
        avatarPreview.src = "";
    }

    // ✅ Evitar asignaciones múltiples de eventos en el modal
    if (!avatarModal.dataset.listenerAdded) {
        avatarModal.dataset.listenerAdded = "true";

        avatarModal.addEventListener("hidden.bs.modal", function () {
            console.log("🔄 Modal cerrado correctamente. Verificando backdrop...");
            // ✅ Asegurar que el foco vuelve a un botón visible
            setTimeout(() => {
                document.getElementById("change-avatar")?.focus();
            }, 300);
        });
    }

    // ✅ Evento `click` en el botón de guardar avatar
    if (!saveAvatarBtn.dataset.clickListenerAdded) {
        console.log("🟢 [Debug] Intentando asignar evento click a Save Avatar.");

        saveAvatarBtn.dataset.clickListenerAdded = "true";

        saveAvatarBtn.addEventListener("click", function () {
            console.log("🟢 [Debug] Click en Save Avatar.");

            const file = avatarInput.files[0];
            if (!file) {
                document.getElementById("avatarError").textContent = "❌ " + getTranslation("avatar-error");
                return;
            }

            const previousAvatar = localStorage.getItem("userAvatar");

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                avatarImage.src = reader.result; // ✅ Asignamos la imagen en Base64
                avatarPreview.src = reader.result; // ✅ También actualizamos el preview
                localStorage.setItem("userAvatar", reader.result); // ✅ Guardamos en localStorage

                if (previousAvatar !== reader.result) {
                    console.warn("🛑 [AVISO] ESTO SOLO CAMBIA EL AVATAR EN LA SESIÓN LOCAL.");
                }
            };

            // ✅ Cerrar el modal después de guardar el avatar
            const modalInstance = bootstrap.Modal.getInstance(avatarModal);
            if (modalInstance) {
                modalInstance.hide();
            } else {
                console.warn("⚠️ No se pudo cerrar el modal, instancia no encontrada.");
            }
        });

        console.log("✅ [Debug] Evento click en Save Avatar asignado correctamente.");
    }

    /*******************************************************************/
    /*** 🔹 OPCIÓN 2: ENVIAR EL AVATAR AL BACKEND (update-profile/)  ***/
    /*******************************************************************/
    /*
    console.warn("🛑 [AVISO] ESTA OPCIÓN ENVÍA EL AVATAR AL BACKEND.");

    const formData = new FormData();
    formData.append("avatar", file);

    fetch("https://arr4str2.relixr.io/backend/api/update-profile/", { 
        method: "POST",
        headers: { "Authorization": `Bearer ${getCookie("access_token")}` },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("✅ " + getTranslation("avatar-updated"));
            document.getElementById("avatar").src = URL.createObjectURL(file); // Actualizar avatar en la UI
            bootstrap.Modal.getInstance(document.getElementById("changeAvatarModal")).hide();
        } else {
            document.getElementById("avatarError").textContent = `❌ ${data.error}`;
        }
    })
    .catch(error => {
        console.error("❌ Error al subir avatar:", error);
        document.getElementById("avatarError").textContent = "❌ Error al subir avatar.";
    });

    // ✅ Cerrar el modal después de guardar el avatar
    const modalInstance = bootstrap.Modal.getInstance(avatarModal);
    if (modalInstance) {
        modalInstance.hide();
    } else {
        console.warn("⚠️ No se pudo cerrar el modal, instancia no encontrada.");
    }*/
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("🔄 [Debug] DOMContentLoaded ejecutado, esperando elementos del avatar...");
    

    const observer = new MutationObserver((mutations, obs) => {
        if (document.getElementById("saveAvatar")) {
            console.log("✅ [Debug] saveAvatar encontrado, asignando eventos.");
            assignAvatarEvents();
            obs.disconnect(); // ✅ Detener la observación después de asignar los eventos
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
});




// Asegurar que el backdrop desaparece cuando se cierra cualquier modal
document.addEventListener("hidden.bs.modal", function () {
    console.log("🔄 Modal cerrado correctamente. Verificando backdrop...");

    // Eliminar cualquier backdrop que haya quedado en la pantalla
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());

    // Restaurar el scroll en la página si quedó bloqueado
    document.body.classList.remove('modal-open');
    document.body.style.overflow = "";
});




/*******************************************************************/
/*** A REVISAR CON JOSE                                          ***/
/***  HACER MÁS QUE REVISAR                                      ***/
/*******************************************************************/
// 🔹 Asignar eventos al menú de Blockchain Tournaments
function assignTournamentEvents() {
    console.log("🟢 [UI] Blockchain Tournaments: Asignando eventos...");

    const resultsContainer = document.getElementById("tournamentResults");
    const searchInput = document.getElementById("tournamentSearch");

    async function loadTournaments() {
        console.log("📢 Cargando torneos guardados...");

        resultsContainer.innerHTML = "<p>Loading tournaments...</p>";

        try {
            const response = await fetch("https://arr4str2.relixr.io/backend/api/tournaments/");
            const tournaments = await response.json();

            if (!tournaments.length) {
                resultsContainer.innerHTML = "<p>No tournaments found.</p>";
                return;
            }

            // 🔹 Generar lista de torneos
            resultsContainer.innerHTML = tournaments.map(tournament => `
                <li class="tournament-item" data-name="${tournament.name.toLowerCase()}" data-id="${tournament.id.toLowerCase()}">
                    <strong>${tournament.name}</strong> (ID: ${tournament.id})
                    <ul>
                        ${tournament.participants.map(participant => `
                            <li data-username="${participant.username.toLowerCase()}" data-position="${participant.position}">
                                ${participant.username} - Position: ${participant.position}
                            </li>
                        `).join("")}
                    </ul>
                </li>
            `).join("");

            console.log("✅ Torneos cargados con éxito.");
        } catch (error) {
            console.error("❌ Error al cargar torneos:", error);
            resultsContainer.innerHTML = `<p data-translate="error-loading-tournaments">${getTranslation("error-loading-tournaments")}</p>`;
        }
    }

    // ✅ Mostrar torneos automáticamente al abrir el menú
    document.getElementById("tournamentsBox")?.addEventListener("click", loadTournaments);

    // ✅ Evento para filtrar torneos en la búsqueda
    searchInput?.addEventListener("input", function () {
        const query = this.value.toLowerCase();
        const items = document.querySelectorAll(".tournament-item");

        items.forEach(item => {
            const matchTournament = item.dataset.name.includes(query) || item.dataset.id.includes(query);
            const matchParticipant = Array.from(item.querySelectorAll("li")).some(participant => 
                participant.dataset.username.includes(query) || participant.dataset.position.includes(query)
            );

            item.style.display = matchTournament || matchParticipant ? "block" : "none";
        });
    });
}




// 🔹 Asignación de eventos dinámicos a las opciones del submenú
function assignDynamicSubMenuEvents() {
    const subMenuActions = {
        "sign-up": () => {
            console.log("🟢 Abriendo modal de registro...");
            new bootstrap.Modal(document.getElementById("signUpModal")).show();
        },
        "login-email": () => {
            typeof secureLoginWithEmail === "function" ? secureLoginWithEmail() : console.error("❌ Error: secureLoginWithEmail no está definida.");
        },
        "login-intra": () => {
            typeof loginWithIntra === "function" ? loginWithIntra() : console.error("❌ Error: loginWithIntra no está definida.");
        }
    };

    Object.keys(subMenuActions).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            // ✅ Eliminar eventos previos antes de agregar uno nuevo
            element.removeEventListener("click", subMenuActions[id]);
            element.addEventListener("click", subMenuActions[id]);
        } else {
            console.warn(`⚠️ Elemento del submenú no encontrado en el DOM en este momento: ${id}`);
        }
    });
}


// 🔹 Asignar eventos para abrir submenús de Profile, Tournaments y Game Modes
function assignMainMenuEvents() {
    ["profileBox", "tournamentsBox", "gameModesBox"].forEach(menuId => {
        document.getElementById(menuId)?.addEventListener('click', () => toggleSubMenu(`${menuId.replace("Box", "Menu")}`));
    });
}


// Función para abrir la configuración de privacidad
function openPrivacySettings() {
    console.log("Abriendo configuración de privacidad...");
    alert("Mostrando configuración de privacidad...");
}

// Función para abrir el submenú de modos de juego
function openGameModes() {
    console.log("🎮 Abriendo modos de juego...");
    toggleSubMenu('gameModesMenu');
}

// Función para abrir el submenú de torneos
function openTournaments() {
    console.log("Abriendo torneos...");
    toggleSubMenu('tournamentsMenu');
}


// 🔹 Cierra todos los submenús cuando se hace clic fuera, evitando asignaciones múltiples
if (!document.body.dataset.menuClickListenerAdded) {
    document.body.dataset.menuClickListenerAdded = "true";

    document.addEventListener('click', (event) => {
        // 🔹 Evitar cerrar el menú si hay un modal abierto
        const modal = document.querySelector(".modal.show");  
        if (modal) {
            console.log("🟢 Modal abierto, ignorando cierre del menú.");
            return;
        }

        // 🔹 Cerrar submenús si el clic es fuera de ellos
        if (!event.target.closest('.menu-option') && !event.target.closest('.submenu')) {
            console.warn("❌ Clic fuera del menú. Cerrando loginMenu...");
            document.querySelectorAll('.submenu').forEach(menu => {
                menu.classList.remove('visible');
                menu.style.display = "none";
            });
        }
    });
}




// ✅ Asegurar que los placeholders y botones se traduzcan al abrir un modal
document.addEventListener("shown.bs.modal", function () {
    console.log("🌍 Aplicando traducción dentro del modal...");

    document.querySelectorAll("input[data-translate]").forEach(input => {
        input.setAttribute("placeholder", getTranslation(input.getAttribute("data-translate")));
    });

    document.querySelectorAll("label[data-translate]").forEach(label => {
        label.textContent = getTranslation(label.getAttribute("data-translate"));
    });

    document.querySelectorAll("button[data-translate]").forEach(button => {
        button.textContent = getTranslation(button.getAttribute("data-translate"));
    });

    // Traducir el botón de cerrar del modal (Bootstrap lo maneja)
    document.querySelectorAll("button.btn-close").forEach(button => {
        button.setAttribute("aria-label", getTranslation("cancel-button"));
    });
});




window.secureSignUp = secureSignUp;