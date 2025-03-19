function createMatrixEffect(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn(`⚠️ [Matrix Effect] No se encontró el canvas con ID: ${canvasId}`);
        return;
    }

    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth || 200; // Evitar tamaño 0
        canvas.height = canvas.parentElement.clientHeight || window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const columns = Math.floor(canvas.width / 14);
    const drops = Array(columns).fill(0);

    function draw() {
        ctx.fillStyle = 'rgba(39, 33, 35, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff00';
        ctx.font = '14px monospace';

        drops.forEach((y, i) => {
            const text = String.fromCharCode(0x30A0 + Math.random() * 96);
            ctx.fillText(text, i * 14, y * 14);
            if (y * 14 > canvas.height || Math.random() > 0.95) drops[i] = 0;
            drops[i]++;
        });
    }

    setInterval(draw, 50);
}

// Asegurar que se aplican ambos efectos
document.addEventListener("DOMContentLoaded", () => {
    const leftCanvas = document.getElementById('matrixCanvas');
    const rightCanvas = document.getElementById('matrixCanvasRight');

    if (leftCanvas) {
        console.log("✅ Aplicando efecto Matrix al canvas izquierdo.");
        createMatrixEffect('matrixCanvas');
    } else {
        console.warn("⚠️ No se encontró el canvas izquierdo.");
    }

    if (rightCanvas) {
        console.log("✅ Aplicando efecto Matrix al canvas derecho.");
        createMatrixEffect('matrixCanvasRight');
    } else {
        console.warn("⚠️ No se encontró el canvas derecho.");
    }
});

function updateView(section) {
    console.log(`🟢 updateView('${section}') llamado.`);

    // Si estamos en `#loged`, ocultarlo antes de cambiar de vista
    const logedSection = document.getElementById("loged");
    if (logedSection?.style.display === "block" && section !== "loged") {
        console.log("🔄 Saliendo de `#loged`, asegurando visibilidad de la nueva vista.");
        logedSection.style.display = "none"; // Ocultar `#loged` antes de cambiar de vista
    }

    // Ocultar todas las secciones con clase 'view-section'
    document.querySelectorAll(".view-section").forEach(sec => {
        sec.style.display = "none";
        console.log(`❌ Ocultando sección: ${sec.id}`);
    });

    // Mostrar la sección correcta con display: block
    const activeSection = document.getElementById(section);
    if (activeSection) {
        activeSection.style.display = "block"; // Asegurar visibilidad
        console.log(`✅ Mostrando sección: ${section}`);
    } else {
        console.warn(`⚠️ Sección '${section}' no encontrada en el DOM.`);
    }
}


