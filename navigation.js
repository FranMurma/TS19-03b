// 🔹 navigation.js

// 🔹 Función para cambiar la vista de manera segura
function navigateTo(view) {
    console.log(`📌 [Navigation] Cambiando a: ${view}`);

    if (window.location.hash !== `#${view}`) {
        history.pushState({ view: view }, "", `#${view}`);
    }

    updateView(view); // 🔹 Asegurar que la UI refleje el cambio de vista
}





function closeAllSubmenus() {
    let openSubmenu = document.querySelector('.submenu.visible');
    if (openSubmenu) {
        console.log("🔴 Cerrar submenús antes de cambiar de vista...");
        openSubmenu.classList.remove('visible');
        openSubmenu.style.opacity = "0";
        openSubmenu.style.visibility = "hidden";
        openSubmenu.style.pointerEvents = "none";
        return true;  // 🔹 Indica que un submenú estaba abierto y lo cerramos
    }
    return false; // 🔹 Indica que no había submenús abiertos
}

// 🔹 Función para sincronizar la vista con el hash en la URL
// modificamos para cerrar submenús antes de cambiar la vista
function syncViewWithHash() {
    let hash = window.location.hash.replace("#", "") || "loged"; // Si no hay hash, usar `#loged`
    console.log(`🔄 [Sync] Vista actual: ${hash}`);

    // 🚨 Si el hash no es válido, redirigir a `#loged`
    if (!["profile", "gameModes", "tournaments", "loged"].includes(hash)) {
        console.log("🛑 Sección no válida, redirigiendo a #loged...");
        history.replaceState(null, "", "#loged");
        hash = "loged";
    }

    // Si venimos de `#loged`, aseguramos que la nueva vista se mantenga activa
    if (document.getElementById("loged")?.style.display === "block" && hash !== "loged") {
        console.log("🔄 Cambiando desde `#loged` a otra sección, asegurando visibilidad.");
        document.getElementById("loged").style.display = "none"; // Ocultar `#loged`
    }

    // Mapeo de secciones y sus botones
    const sectionButtons = {
        "profile": "profileBox",
        "gameModes": "gameModesBox",
        "tournaments": "tournamentsBox"
    };

    // Si existe un botón correspondiente, simular clic
    if (sectionButtons[hash]) {
        const button = document.getElementById(sectionButtons[hash]);
        if (button) {
            console.log(`🟢 Simulando clic en: ${sectionButtons[hash]}`);
            button.click();
        } else {
            console.warn(`⚠️ Botón para ${hash} no encontrado.`);
        }
    }

    updateView(hash);
}




// 🔹 Evento para gestionar cambios en el historial (botón atrás/adelante)
// modificado para cerrar submenús antes de cambiar la vista
window.addEventListener("popstate", function (event) {
    if (event.state && event.state.view) {
        console.log(`🔄 [Historial] Navegando a: ${event.state.view}`);
        updateView(event.state.view); // 🔹 Sincronizar la UI con la navegación
    }
});

// 🔹 Evento para cambios en el hash (cuando el usuario lo cambia manualmente)
window.addEventListener("hashchange", syncViewWithHash);


// 🔹 Inicializar la vista al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ [Navigation] Sistema de navegación inicializado.");
    syncViewWithHash(); // 🔹 Asegurar que la UI refleje el estado inicial
});