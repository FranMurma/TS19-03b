// auth.js - Manejo de autenticación y estado del usuario

let isLoggedIn = false;  // Estado global de autenticación

/***************************************************** */
// ELIMINAR ESTA LINEA PARA QUITAR EL MODO SIMULACIÓN
// Y todas las referencias a devMode
/***************************************************** */
let devMode = localStorage.getItem("devMode") === "true";  // Modo desarrollo



/***************************************************************************************************/
// Junto el chequeo de si hay sesión con el listener del 2FA para no tener dos addEventListener...
// Añadimios la cargadelavatar
/************************************************************************************************* */
document.addEventListener("DOMContentLoaded", () => {
    console.log("🔹 [auth.js] Cargando eventos de autenticación...");

    if (devMode) {
        console.warn("MODO DESARROLLO ACTIVADO: No se requiere login.");
        isLoggedIn = true;
        activateMenus();
    } else {
        checkSession();
    }

    // Restaurar el avatar desde localStorage
    console.log("🔄 [Auth] Intentando cargar avatar guardado...");
    const savedAvatar = localStorage.getItem("userAvatar");
    const avatarElement = document.getElementById("avatar");
    const avatarPreview = document.getElementById("avatarPreview");

    if (avatarElement && avatarPreview) {  // ✅ Asegurar que los elementos existen antes de modificar
        if (savedAvatar) {
            avatarElement.src = savedAvatar; // ✅ Usamos la imagen en Base64
            avatarPreview.src = savedAvatar; // ✅ También actualiza el preview
            console.log("✅ Avatar restaurado correctamente.");
        } else {
            console.warn("⚠️ No hay avatar guardado en localStorage, manteniendo el espacio vacío.");
            avatarElement.src = "";
            avatarPreview.src = ""; // ✅ Evita que el preview cargue una imagen inexistente
        }
    } else {
        console.warn("⚠️ No se encontró el elemento #avatar o #avatarPreview en el DOM.");
    }

    // Comprobar si 2FA está activado y actualizar el botón
    actualizarBoton2FA();
});


// 🔹 Nueva función para actualizar el botón 2FA solo cuando sea necesario. La meteremos en checkSession
function actualizarBoton2FA() {
    const toggleButton = document.getElementById("toggle-2fa");
    if (toggleButton) {
        const twoFARequired = getCookie("2fa_required") === "true";
        toggleButton.textContent = twoFARequired ? "Disable 2FA" : "Manage Two-Factor Authentication";
    }
}


// Manejar activación/desactivación de 2FA
document.getElementById("confirmToggle2FA")?.addEventListener("click", () => {
    const twoFAEnabled = getCookie("2fa_required") === "true";
    console.log(` ${twoFAEnabled ? "Disabling" : "Enabling"} 2FA...`);

    const requestFunction = twoFAEnabled ? send2FADisable : send2FARequest;
    
    requestFunction().then(() => {
        alert(`✅ ${twoFAEnabled ? getTranslation("2fa-disabled") : getTranslation("2fa-enabled")}`);
        bootstrap.Modal.getInstance(document.getElementById("toggle2FAModal")).hide();
    }).catch(error => {
        console.error("Error:", error);
    });
});


// 🔹 Verificar sesión mediante cookies y actualizar "Profile $user"
function checkSession() {
    console.log("🔍 Verificando sesión...");
    console.log("✅ checkSession() se ha ejecutado correctamente.");

    if (devMode) {
        console.warn("MODO DESARROLLO ACTIVADO: Simulando autenticación.");
        isLoggedIn = true;
        updateProfileButton("Player (Test Mode)");
        actualizarBoton2FA();
        updateUIBasedOnAuth(true);

        // 🛑 Si estamos en #login, redirigir a #loged
        if (window.location.hash === "#login") {
            console.log("🛑 Redirigiendo de #login a #loged...");
            history.replaceState(null, "", "#loged");
            syncViewWithHash();
        }
        return;
    }

    const accessToken = getCookie("access_token");
    const refreshToken = getCookie("refresh_token");
    const userName = getCookie("username");

    if (accessToken && refreshToken) {
        console.log("✅ Usuario autenticado.");
        isLoggedIn = true;
        updateProfileButton(userName);
        actualizarBoton2FA();
        updateUIBasedOnAuth(true);

        // 🛑 Si estamos en #login, redirigir a #loged
        if (window.location.hash === "#login") {
            console.log("🛑 Redirigiendo de #login a #loged...");
            history.replaceState(null, "", "#loged");
            syncViewWithHash();
        }

    } else {
        console.warn("🔴 No hay sesión activa.");
        isLoggedIn = false;
        resetUI();
        updateUIBasedOnAuth(false);

        // ⚠️ Si la vista no es válida, redirigir a #loged
        if (!["profile", "gameModes", "tournaments"].includes(window.location.hash.replace("#", ""))) {
            console.log("🟡 No hay sesión y la vista no es válida, redirigiendo a #loged.");
            history.replaceState(null, "", "#loged");
            syncViewWithHash();
        }
    }
}







// 🔹 Función auxiliar para actualizar el botón de Profile
function updateProfileButton(userName) {
    const profileBox = document.getElementById("profileBox");
    if (profileBox && userName) {
        profileBox.innerHTML = `Profile <strong>${userName}</strong>`;
    }
}

// Para el cambio de username
document.getElementById("saveNewUsername")?.addEventListener("click", () => {
    const newUsername = document.getElementById("newUsername").value.trim();
    const errorText = document.getElementById("changeUsernameError");

    console.log(getTranslation("validating-username"));

    if (!errorText) {
        console.error("❌ ERROR: No se encontró el elemento #changeUsernameError en el DOM.");
        return;
    }

    if (!newUsername) {
        console.warn(getTranslation("username-empty"));
        errorText.textContent = getTranslation("username-empty");
        return;
    }
    if (newUsername.length < 3 || newUsername.length > 7) {
        console.warn(getTranslation("username-range"));
        errorText.textContent = getTranslation("username-range");
        return;
    }

    console.log("🟢 Nuevo username ingresado:", newUsername);

    fetch("https://arr4str2.relixr.io/backend/api/update-profile/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getCookie("access_token")}`
        },
        body: JSON.stringify({ newUsername: newUsername }),
    })
    .then(response => response.json())
    .then(data => {
        console.log("🔄 Respuesta del servidor:", data);
        if (data.success) {
            alert(getTranslation("username-updated"));
            document.getElementById("userNameDisplay").textContent = newUsername;
            bootstrap.Modal.getInstance(document.getElementById("changeUsernameModal")).hide();
        } else {
            console.warn(getTranslation("backend-error") + data.error);
            errorText.textContent = `❌ ${data.error}`;
        }
    })
    .catch(error => console.error("Error:", error));
});



// 🔹 Función para activar/desactivar el modo desarrollo en la consola
function toggleDevMode() {
    devMode = !devMode;
    localStorage.setItem("devMode", devMode.toString());
    console.log(`🔄 Modo desarrollo: ${devMode ? "Activado (Pruebas)" : "Desactivado (Real)"}`);

    if (devMode) {
        console.warn("🛠 Modo desarrollo activado: Simulando autenticación.");
        isLoggedIn = true;
    } else {
        console.warn("🔐 Modo desarrollo desactivado: Usando autenticación real.");
        isLoggedIn = false;
    }

    console.log("🚀 Llamando a checkSession() tras cambiar el modo de desarrollo...");
    checkSession(); // ⚡ Llamar a `checkSession()` para aplicar el estado actualizado inmediatamente
}



// 🔹 Función para activar Two-Factor Authentication (2FA)
function send2FARequest() {
    const accessToken = getCookie('access_token');

    return fetch("https://arr4str2.relixr.io/backend/api/2FA/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            window.location.href = 'https://arr4str2.relixr.io/2FA';
        } else {
            alert(`❌ ${data.error}`);
        }
    })
    .catch(error => console.error("Error:", error));
}

// Función para desactivar Two-Factor Authentication (2FA)
function send2FADisable() {
    const accessToken = getCookie('access_token');

    return fetch("https://arr4str2.relixr.io/backend/api/disable2FA/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    }).then(response => response.json());
}

// Función para cambiar la contraseña
function secureChangePassword() {
    console.log("Cambio de contraseña iniciado...");
    let changePasswordModal = document.getElementById("changePasswordModal");
    
    if (changePasswordModal) {
        new bootstrap.Modal(changePasswordModal).show();
    } else {
        console.warn("⚠️ Modal de cambio de contraseña no encontrado. Redirigiendo...");
        window.location.href = "/change-password";
    }
}

document.getElementById("confirmChangePassword")?.addEventListener("click", () => {
    const currentPassword = document.getElementById("currentPassword").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmNewPassword = document.getElementById("confirmNewPassword").value.trim();
    const errorText = document.getElementById("passwordChangeError");

    if (newPassword.length < 6 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        errorText.textContent = getTranslation("password-invalid");
        return;
    }
    if (newPassword !== confirmNewPassword) {
        errorText.textContent = getTranslation("password-mismatch");
        return;
    }

    console.log("🟢 Sending password change request...");

    fetch("https://arr4str2.relixr.io/backend/api/change-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getCookie("access_token")}` },
        body: JSON.stringify({ currentPassword, newPassword }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(getTranslation("update-success"));
            bootstrap.Modal.getInstance(document.getElementById("changePasswordModal")).hide();
        } else {
            errorText.textContent = getTranslation("update-failed");
        }
    })
    .catch(error => console.error("Error:", error));
});


/********************************* */
//Funciones de LOGEO
/********************************** */

// 🔹 Validar Username (7 caracteres o menos)
function isValidUsername() {
    const usernameField = document.getElementById("signUpUsername");
    const errorText = document.getElementById("usernameError");

    if (usernameField.value.length > 100) {
        errorText.textContent = getTranslation("username-too-long");
        errorText.style.color = "var(--green-bright)";  
        errorText.style.display = "block";  // Forzar que el mensaje aparezca en su propia línea
        return false;
    } else {
        errorText.textContent = "";
        return true;
    }
}

// 🔹 Validar Email
function isValidEmail(email) {
    const errorText = document.getElementById("emailError");

    if (!errorText) {
        console.error(getTranslation("error-email-element-missing"));
        return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorText.textContent = getTranslation("email-invalid");
        return false;
    } else {
        errorText.textContent = "";
        return true;
    }
}

// 🔹 Validar Password (6 caracteres mínimo, 1 mayúscula, 1 número)
function isValidPassword() {
    const passwordField = document.getElementById("signUpPassword");
    const errorText = document.getElementById("passwordError");
    const passwordHelp = document.getElementById("passwordHelp"); // Agregamos esta línea

    errorText.textContent = ""; // Limpiar errores previos
    passwordHelp.style.display = "none"; // 🔹 Ocultar mensaje por defecto

    console.log("🟢 [Debug] Validando contraseña:", passwordField.value);

    if (passwordField.value.length < 6) {
        errorText.textContent = getTranslation("password-min-length");
        errorText.style.color = "var(--green-bright)";
        errorText.style.display = "block";
        passwordHelp.style.display = "block"; // 🔹 Mostrar el mensaje solo si hay error
        return false;
    }
    if (!/[A-Z]/.test(passwordField.value)) {
        errorText.textContent = getTranslation("password-uppercase-required");
        errorText.style.color = "var(--green-bright)";
        errorText.style.display = "block";
        passwordHelp.style.display = "block"; // 🔹 Mostrar el mensaje solo si hay error
        return false;
    }
    if (!/[0-9]/.test(passwordField.value)) {
        errorText.textContent = getTranslation("password-number-required");
        errorText.style.color = "var(--green-bright)";
        errorText.style.display = "block";
        passwordHelp.style.display = "block"; // 🔹 Mostrar el mensaje solo si hay error
        return false;
    }

    errorText.textContent = "";
    passwordHelp.style.display = "none"; // 🔹 Ocultar si la contraseña es válida
    return true;
}



// 🔹 Validar que la contraseña confirmada coincida con la original
function validateConfirmPassword() {
    const password = document.getElementById("signUpPassword").value;
    const confirmPassword = document.getElementById("confirmSignUpPassword").value;
    const errorMessage = document.getElementById("confirmPasswordError");

    if (confirmPassword.trim() === "") {
        errorMessage.textContent = getTranslation("password-empty");
        errorMessage.style.color = "var(--green-bright)";
        return;
    }

    if (confirmPassword !== password) {
        errorMessage.textContent = getTranslation("password-mismatch");
        errorMessage.style.color = "var(--green-bright)";
    } else {
        errorMessage.textContent = "";
    }
}


// 🔹 Iniciar sesión con Intra (42 School)
function loginWithIntra() {
    if (devMode) {
        console.warn("Modo desarrollo activado: Simulando login.");
        isLoggedIn = true;
        activateMenus();
        return;
    }
    console.log("🟢 Redirigiendo a Intra...");
    setTimeout(() => {
        window.location.href = "https://arr4str2.relixr.io/backend/api/oauth/login/";
    }, 500);

    // Actualizamos la UI y la visualización después del logeo.
    setTimeout(() => {
        checkSession();
    }, 2000); // Pequeño delay para esperar la autenticación
}


    
// 🔹 Función para abrir el modal de Sign Up
function secureSignUp() {
    console.log("🟢 Abriendo modal de registro...");
    let signUpModal = new bootstrap.Modal(document.getElementById("signUpModal"));
    signUpModal.show();
}

// 🔹 Evento para capturar el click en "Sign Up"
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("confirmSignUp").addEventListener("click", function () {
        const username = document.getElementById("signUpUsername").value.trim();
        const email = document.getElementById("signUpEmail").value.trim();
        const password = document.getElementById("signUpPassword").value.trim();
        const confirmPassword = document.getElementById("confirmSignUpPassword").value.trim();

        // Validaciones antes de enviar los datos a back
        if (!isValidUsername()) {
            document.getElementById("usernameError").textContent = getTranslation("username-max");
            return;
        } else {
            document.getElementById("usernameError").textContent = "";
        }

        if (!isValidEmail(email)) {
            document.getElementById("emailError").textContent = getTranslation("email-invalid");
            return;
        } else {
            document.getElementById("emailError").textContent = "";
        }

        if (!isValidPassword(password)) {
            document.getElementById("passwordError").textContent = getTranslation("password-requirements");
            return;
        } else {
            document.getElementById("passwordError").textContent = "";
        }

        if (confirmPassword === "") {
            alert(getTranslation("password-confirm-empty"));
            return;
        }

        if (password !== confirmPassword) {
            document.getElementById("confirmPasswordError").textContent = getTranslation("password-mismatch");
            return;
        } else {
            document.getElementById("confirmPasswordError").textContent = "";
        }

        console.log(getTranslation("sign-up-request"));
        sendSignUpRequest(username, email, password);
    });
});


// 🔹 Función para enviar datos de Sign Up (igual que en antes en el script.js)
function sendSignUpRequest(username, email, password) {
    console.log("🟢 [Debug] Entrando en sendSignUpRequest()");
    console.log("📨 [Debug] Datos enviados:", { username, email, password });

    fetch("https://arr4str2.relixr.io/backend/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: username, name: username, email: email, password: password }),
    })
    .then(response => {
        console.log("🔄 [Debug] Recibiendo respuesta del servidor...");
        return response.json();
    })
    .then(data => {
        console.log("🔄 [Debug] Respuesta del servidor:", data);
        if (data.message) {
            alert(getTranslation("sign-up-success", { username }));
            isLoggedIn = true;
            activateMenus();
            closeLoginMenu();

            let signUpModal = bootstrap.Modal.getInstance(document.getElementById("signUpModal"));
            if (signUpModal) {
                signUpModal.hide();
            }
        } else {
            console.warn(getTranslation("sign-up-error") + ": " + data.error);
        }
    })
    .catch(error => console.error("❌ [Debug] Error en el fetch:", error));
}



// Lllamamos desde el switch del UI, opción de login con email.
function secureLoginWithEmail() {
    console.log("🟢 Abriendo modal de login con email...");
    let loginModal = new bootstrap.Modal(document.getElementById("loginEmailModal"));
    loginModal.show();
    // actualizamos la UI y la visualización
    loginModal._element.addEventListener("hidden.bs.modal", function () {
        checkSession();
    });
}

// Escucha el click de login con email
document.addEventListener("DOMContentLoaded", function () {
    console.log(getTranslation("debug-login-email-found"), document.getElementById("confirmLoginEmail"));

    document.getElementById("confirmLoginEmail").addEventListener("click", function () {
        const emailInput = document.getElementById("loginEmailInput");
        const passwordInput = document.getElementById("loginPasswordInput");
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Validación de email
        if (!isValidEmail(email)) {
            document.getElementById("loginEmailError").textContent = getTranslation("email-invalid");
            return;
        } else {
            document.getElementById("loginEmailError").textContent = "";
        }

        // Validación de password (mínimo 6 caracteres)
        if (password.length < 6) {
            document.getElementById("loginPasswordError").textContent = getTranslation("password-too-short");
            return;
        } else {
            document.getElementById("loginPasswordError").textContent = "";
        }

        console.log(getTranslation("sending-login-request"));
        sendSignInRequest(email, password);
    });
});


// 🔹 Función de autenticación con login y password, igual a la de que había en la versión de Kambou de script.js
function sendSignInRequest(email, password) {
    console.log(`🔵 Enviando Sign In: Login/Email: ${email}, Password: [OCULTO]`);

    fetch("https://arr4str2.relixr.io/backend/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: email, password: password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.access) {
            setCookie('access_token', data.access, 1);
            setCookie('refresh_token', data.refresh, 7);
            console.log("✅ Login successful!");
            isLoggedIn = true;
            activateMenus();
            closeLoginMenu();

            // 🔹 Verificar si el backend indica que se requiere 2FA
            const cookies = document.cookie.split(';');
            const twoFARequired = cookies.some(cookie => cookie.trim().startsWith('2fa_required=true'));

            if (twoFARequired) {
                console.log("⚠️ 2FA requerido. Redirigiendo a la verificación...");
                send2FARequest(); // Llama a la función que maneja la autenticación 2FA
                return;
            }
        } else {
            alert(getTranslation("invalid-credentials"));
        }
    })
    .catch(error => console.error("Error:", error));
}

// 🔹 Función para enviar el login con username al backend
function sendSignInUsernameRequest(username, password) {
    console.log(`🔵 Enviando Sign In con Username: ${username}, Password: [OCULTO]`);

    fetch("https://arr4str2.relixr.io/backend/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: username, password: password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.access) {
            setCookie('access_token', data.access, 1);
            setCookie('refresh_token', data.refresh, 7);
            console.log("✅ Login con username exitoso!");
            isLoggedIn = true;
            activateMenus();
            closeLoginMenu();
        } else {
            alert(getTranslation("invalid-credentials"));
        }
    })
    .catch(error => console.error("❌ Error en login con username:", error));
}

// Parael logincon user
function secureLoginWithUsername() {
    console.log("🟢 Abriendo modal de login con username...");
    let loginUsernameModal = new bootstrap.Modal(document.getElementById("loginUsernameModal"));
    loginUsernameModal.show();
    
    // Actualizar UI al cerrar el modal
    loginUsernameModal._element.addEventListener("hidden.bs.modal", function () {
        checkSession();
    });
}

//Lo pillamos y validamos
document.addEventListener("DOMContentLoaded", function () {
    console.log(getTranslation("debug-login-username-found"), document.getElementById("confirmLoginUsername"));

    document.getElementById("confirmLoginUsername").addEventListener("click", function () {
        const usernameInput = document.getElementById("loginUsernameInput");
        const passwordInput = document.getElementById("loginPasswordUsernameInput");
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Validación de username
        if (!username) {
            document.getElementById("loginUsernameError").textContent = getTranslation("username-empty");
            return;
        } else {
            document.getElementById("loginUsernameError").textContent = "";
        }

        // Validación de password (mínimo 6 caracteres)
        if (password.length < 6) {
            document.getElementById("loginPasswordUsernameError").textContent = getTranslation("password-too-short");
            return;
        } else {
            document.getElementById("loginPasswordUsernameError").textContent = "";
        }

        console.log(getTranslation("sending-login-request"));
        sendSignInRequestUsername(username, password);
    });
});

// Y ala intra
function sendSignInRequestUsername(username, password) {
    console.log(`🔵 Enviando Login con Username: ${username}, Password: [OCULTO]`);

    fetch("https://arr4str2.relixr.io/backend/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: username, password: password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.access) {
            setCookie('access_token', data.access, 1);
            setCookie('refresh_token', data.refresh, 7);
            console.log("✅ Login successful!");
            isLoggedIn = true;
            activateMenus();
            closeLoginMenu();

            // Verificar si el backend requiere 2FA
            const cookies = document.cookie.split(';');
            const twoFARequired = cookies.some(cookie => cookie.trim().startsWith('2fa_required=true'));

            if (twoFARequired) {
                console.log("⚠️ 2FA requerido. Redirigiendo a la verificación...");
                send2FARequest();
                return;
            }
        } else {
            alert(getTranslation("invalid-credentials"));
        }
    })
    .catch(error => console.error("Error:", error));
}



// 🔹 Enviar el 2fa
function send2FARequest() {
    const accessToken = getCookie('access_token');

    fetch("https://arr4str2.relixr.io/backend/api/2FA/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            window.location.href = 'https://arr4str2.relixr.io/2FA';
        } else {
            alert(`❌ ${data.error}`);
        }
    })
    .catch(error => console.error("Error:", error));
}

// 🔹 Desactivar Two-Factor Authentication (2FA)
function send2FADisable() {
    const accessToken = getCookie('access_token');

    fetch("https://arr4str2.relixr.io/backend/api/disable2FA/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert("✅ Two-Factor Authentication disabled.");
            window.location.href = 'https://arr4str2.relixr.io/';
            logoutUser(); // Cierra sesión después de desactivar 2FA
        } else {
            alert(`❌ ${data.error}`);
        }
    })
    .catch(error => console.error("Error:", error));
}


// 🔹 Password perdido, llama al modal
function secureForgotPassword() {
    console.log("🟢 Abriendo modal de recuperación de contraseña...");
    
    let forgotPasswordModal = new bootstrap.Modal(document.getElementById("forgotPasswordModal"));
    forgotPasswordModal.show();
}

// 🔹 Manejar recuperación de contraseña desde el modal
document.getElementById("confirmForgotPassword")?.addEventListener("click", () => {
    const email = document.getElementById("forgotPasswordEmail").value.trim();
    const errorText = document.getElementById("forgotPasswordError");

    // Validación del email antes de enviarlo
    if (!isValidEmail(email)) {
        errorText.textContent = getTranslation("email-invalid");
        return;
    } else {
        errorText.textContent = ""; // Limpiar errores previos
    }

    console.log("📩 Enviando solicitud de recuperación...");

    fetch("https://arr4str2.relixr.io/backend/api/recovery/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(getTranslation("password-reset-email-sent"));
            bootstrap.Modal.getInstance(document.getElementById("forgotPasswordModal")).hide();
        } else {
            errorText.textContent = `❌ ${data.error}`;
        }
    })
    .catch(error => {
        console.error("❌ Error:", error);
        errorText.textContent = getTranslation("password-reset-error");
    });
});


// 🔹 Cambiar perfil del usuario
document.getElementById("saveProfileChanges")?.addEventListener("click", () => {
    const newUsername = document.getElementById("profileUsername").value.trim();
    const errorText = document.getElementById("profileSettingsError");

    if (!newUsername) {
        errorText.textContent = getTranslation("username-empty");
        return;
    }
    if (newUsername.length < 3 || newUsername.length > 7) {
        errorText.textContent = getTranslation("username-range");
        return;
    }

    console.log(getTranslation("sending-profile-update"));

    fetch("https://arr4str2.relixr.io/backend/api/update-profile/", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getCookie("access_token")}`
        },
        body: JSON.stringify({ username: newUsername }), // 🔹 Solo enviamos el username
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(getTranslation("profile-updated"));
            document.getElementById("userNameDisplay").textContent = newUsername;
            bootstrap.Modal.getInstance(document.getElementById("profileSettingsModal")).hide();
        } else {
            errorText.textContent = `❌ ${getTranslation("backend-error")}: ${data.error}`;
        }
    })
    .catch(error => console.error(getTranslation("fetch-error"), error));
});


function secureEnable2FA() {
    console.log(getTranslation("activating-2fa"));
    const accessToken = getCookie('access_token');
    
    fetch("https://arr4str2.relixr.io/backend/api/2FA/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(getTranslation("2fa-enabled"));
        } else {
            alert(`❌ ${getTranslation("backend-error")}: ${data.error}`);
        }
    })
    .catch(error => console.error(getTranslation("fetch-error"), error));
}



// ✅ Cerrar sesión correctamente
function logoutUser() {
    console.log("🔴 Se ha hecho clic en Log out. Cerrando sesión...");

    isLoggedIn = false;
    eraseCookie('access_token');
    eraseCookie('refresh_token');
    eraseCookie('2fa_required');
    eraseCookieCert("csrftoken"); 
    eraseCookieSession("sessionid");

    // Cerrar todos los submenús abiertos antes de cerrar sesión
    document.querySelectorAll('.submenu').forEach(menu => {
        menu.classList.remove('visible');
        menu.style.opacity = "0";
        menu.style.visibility = "hidden";
        menu.style.pointerEvents = "none";
    });

    resetUI();
    history.replaceState(null, "", "#login");
    console.log("✅ Logout completado.");
}


// Activar los menús después del login
function activateMenus() {
    console.log("🟢 Activando menús...");

    updateUIBasedOnAuth(true);  // Ahora se encarga de mostrar los botones y menús correctos
    closeLoginMenu();           // Asegura que el menú de login se cierre

    console.log("✅ Usuario autenticado. No es necesario cambiar de vista.");
}



// Restaurar UI al cerrar sesión
function resetUI() {
    console.log("🔄 [resetUI] Restableciendo la interfaz...");
    isLoggedIn = false;


    
    setTimeout(() => {
        console.log("🔄 [resetUI] Llamando a updateUIBasedOnAuth(false)...");
        updateUIBasedOnAuth(false);
        // Evitar forzar `#login` en devMode
        if (!devMode) {
            history.replaceState(null, "", "#login");
        }
    }, 50);
}


// Cerrar el menú
function closeLoginMenu() {
    const loginMenu = document.getElementById("loginMenu");
    if (loginMenu) {
        loginMenu.style.transition = "opacity 0.3s ease-in-out, transform 0.3s ease-in-out";
        loginMenu.style.opacity = "0";
        loginMenu.style.transform = "translateX(-10px)";

        setTimeout(() => {
            loginMenu.classList.remove("visible");
            loginMenu.style.visibility = "hidden"; 
            loginMenu.style.pointerEvents = "none";
        }, 300);
    }
}

// ✅ Funciones auxiliares para cookies
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; secure; SameSite=None;`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let c of ca) {
        c = c.trim();
        if (c.startsWith(nameEQ)) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// ✅ Eliminar cookies de sesión desde el backend
function eraseCookieSession(name) {
    fetch('https://arr4str2.relixr.io/backend/api/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    }).then(() => {
        // Intentar eliminar cookies directamente
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; SameSite=None;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=arr4str2.relixr.io; secure; SameSite=None;`;
    }).catch(error => console.error("Error durante el logout:", error));
}

// ✅ Función auxiliar para eliminar cookies normales (según la versión anterior de script.js)
function eraseCookie(name) {
    document.cookie = `${name}=; Max-Age=-99999999; `;
}

function eraseCookieCert(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; SameSite=None;";
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=arr4str2.relixr.io; secure; SameSite=None;";
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/backend/; secure; SameSite=None;";
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/backend/; domain=arr4str2.relixr.io; secure; SameSite=None;";
}


document.addEventListener("DOMContentLoaded", function () {
    window.secureSignUp = function () {
        console.log("🟢 Abriendo modal de registro...");
        let signUpModal = new bootstrap.Modal(document.getElementById("signUpModal"));
        signUpModal.show();
    };
});