document.addEventListener('DOMContentLoaded', () => {
    console.log("Script loaded.");

    // --- Gemeinsame Funktionen ---
    const getElement = (id) => document.getElementById(id);

    // --- Login Seiten Logik ---
    const loginForm = getElement('loginForm');
    const usernameInput = getElement('username');
    const passwordInput = getElement('password');
    const errorMessage = getElement('error-message');

    if (loginForm && usernameInput && passwordInput && errorMessage) {
        console.log("Login form elements found.");
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Verhindert Standard-Formularabsendung -> WICHTIG für single-page feeling
            const username = usernameInput.value;
            const password = passwordInput.value;

            console.log("Login attempt with username:", username); // Kein Passwort loggen!

            // --- !!! EXTREM UNSICHERE PRÜFUNG - NUR FÜR DEMO !!! ---
            if (username === "Julian" && password === "11_Ninjago") {
                console.log("Login successful (Demo). Redirecting in current tab...");
                errorMessage.textContent = '';
                // KORREKTUR: Weiterleitung im selben Tab, ersetzt aktuelle Seite in History
                window.location.replace('dashboard.html');
            } else {
                console.log("Login failed (Demo).");
                errorMessage.textContent = 'Benutzername oder Passwort falsch.';
                passwordInput.value = '';
            }
            // --- !!! ENDE UNSICHERE PRÜFUNG !!! ---
        });
    } else {
        // console.log("Login form elements not found on this page."); // Weniger verbose
    }


    // --- Dashboard & Settings Logik ---
    const settingsBtn = getElement('settingsBtn');
    const settingsModal = getElement('settingsModal');
    const settingsModalOverlay = getElement('settingsModalOverlay');
    const settingsModalCloseBtn = settingsModal ? settingsModal.querySelector('.settings-close') : null;
    const colorPicker = getElement('colorPicker');
    const themeLightRadio = getElement('themeLight');
    const themeDarkRadio = getElement('themeDark');
    const bodyElement = document.body;

    if (settingsBtn && settingsModal && settingsModalOverlay && settingsModalCloseBtn && colorPicker && themeLightRadio && themeDarkRadio && bodyElement) {
        console.log("Dashboard/Settings elements found.");

        const closeSettingsModal = () => {
            settingsModal.classList.remove('visible');
            settingsModalOverlay.classList.remove('visible');
        };

        const applySavedTheme = () => {
            const savedTheme = localStorage.getItem('dashboardTheme') || 'light';
            bodyElement.classList.toggle('dark-mode', savedTheme === 'dark'); // Effizienter
            if (savedTheme === 'dark') {
                themeDarkRadio.checked = true;
            } else {
                themeLightRadio.checked = true;
            }
            // console.log(`Dashboard Theme applied: ${savedTheme}`); // Weniger verbose
        };

        const applySavedColor = () => {
            const savedColor = localStorage.getItem('dashboardAccentColor');
            let colorToApply = '#0078D7'; // Sicherer Standardwert

            try {
                // Versuche, den Standardwert aus CSS zu lesen
                const defaultColorFromCSS = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
                if (defaultColorFromCSS) {
                     colorToApply = defaultColorFromCSS;
                }
            } catch (e) {
                console.warn("Konnte Standard-Akzentfarbe nicht aus CSS lesen.", e);
            }

            // Überschreibe mit gespeichertem Wert, falls vorhanden
            if (savedColor) {
                colorToApply = savedColor;
            }

            console.log(`Applying Accent Color: ${colorToApply} (Saved: ${savedColor})`); // DEBUG LOG
            document.documentElement.style.setProperty('--accent-color', colorToApply);
            colorPicker.value = colorToApply;
        };

         const handleThemeChange = (event) => {
            if (!event || !event.target) return;
            const selectedTheme = event.target.value;
            bodyElement.classList.toggle('dark-mode', selectedTheme === 'dark');
            localStorage.setItem('dashboardTheme', selectedTheme);
            console.log(`Dashboard Theme changed to: ${selectedTheme}`);
        };

        // --- Event Listeners Settings ---
        settingsBtn.addEventListener('click', () => {
            applySavedTheme();
            applySavedColor(); // Sicherstellen, dass Picker aktuell ist
            settingsModal.classList.add('visible');
            settingsModalOverlay.classList.add('visible');
        });

        settingsModalCloseBtn.addEventListener('click', closeSettingsModal);
        settingsModalOverlay.addEventListener('click', closeSettingsModal);

        themeLightRadio.addEventListener('change', handleThemeChange);
        themeDarkRadio.addEventListener('change', handleThemeChange);

        colorPicker.addEventListener('input', (event) => {
            const newColor = event.target.value;
            console.log("Color Picker changed:", newColor); // DEBUG LOG
            document.documentElement.style.setProperty('--accent-color', newColor);
            localStorage.setItem('dashboardAccentColor', newColor);
        });

        // Globaler Escape-Key Listener
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && settingsModal.classList.contains('visible')) {
                closeSettingsModal();
            }
        });

        // Initiales Anwenden von Theme und Farbe
        console.log("Initial Theme/Color Application..."); // DEBUG LOG
        applySavedTheme();
        applySavedColor();

    } else {
        // console.log("Dashboard/Settings elements not found on this page."); // Weniger verbose
    }

     // console.log("Script finished."); // Weniger verbose
}); // Ende DOMContentLoaded