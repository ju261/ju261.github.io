document.addEventListener('DOMContentLoaded', () => {

    let appData = { lists: [], tasks: {} };
    let activeListId = null;
    let draggedTaskId = null;
    let draggedTaskListId = null;

    // --- Element-Referenzen ---
    const sidebar = document.getElementById('sidebar');
    const listNav = document.getElementById('listNav');
    const mainContentWrapper = document.getElementById('main-content-wrapper');
    const mainContent = document.getElementById('main-content');
    const newListInput = document.getElementById('newListInput');
    const addListButton = document.getElementById('addListButton');
    const deleteListButton = document.getElementById('deleteListButton');
    const taskInput = document.getElementById('taskInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const listSelect = document.getElementById('listSelect');
    const listContentArea = document.getElementById('listContentArea');
    const settingsBtn = document.getElementById('settingsBtn');

    // NEU: Referenzen für Settings Modal
    const settingsModal = document.getElementById('settingsModal');
    const settingsModalOverlay = document.getElementById('settingsModalOverlay');
    const settingsModalCloseBtn = settingsModal ? settingsModal.querySelector('.settings-close') : null;
    const colorPicker = document.getElementById('colorPicker');
    const themeLightRadio = document.getElementById('themeLight');
    const themeDarkRadio = document.getElementById('themeDark');

    // --- Sicherheitschecks für neue Elemente ---
    if (!settingsModal || !settingsModalOverlay || !settingsModalCloseBtn || !colorPicker || !themeLightRadio || !themeDarkRadio) {
        console.warn("WARNUNG: Einstellungs-Modal Elemente fehlen oder wurden nicht korrekt gefunden.");
    }

    // --- Daten Laden & Speichern (LocalStorage für App-Daten) ---
    function loadAppData() {
        const storedData = localStorage.getItem('todoAppData');
        // ... (Rest der Funktion bleibt gleich) ...
         try {
            const parsedData = JSON.parse(storedData);
            if (parsedData && Array.isArray(parsedData.lists) && typeof parsedData.tasks === 'object') {
                appData = parsedData;
                appData.lists.forEach(list => {
                    if (!appData.tasks[list.id]) appData.tasks[list.id] = [];
                });
                const validListIds = new Set(appData.lists.map(l => l.id));
                Object.keys(appData.tasks).forEach(listId => {
                    if (!validListIds.has(listId)) delete appData.tasks[listId];
                });
            } else {
                appData = { lists: [{ id: 'list-' + Date.now(), name: 'Mein Tag' }], tasks: {} };
                appData.tasks[appData.lists[0].id] = [];
            }
        } catch (e) {
            console.error("Fehler beim Laden der App-Daten:", e);
            appData = { lists: [{ id: 'list-' + Date.now(), name: 'Mein Tag' }], tasks: {} };
            appData.tasks[appData.lists[0].id] = [];
        }
        const storedActiveListId = localStorage.getItem('activeListId');
         if (storedActiveListId && appData.lists.some(list => list.id === storedActiveListId)) {
             activeListId = storedActiveListId;
         } else if (appData.lists.length > 0) {
             activeListId = appData.lists[0].id;
         } else {
             activeListId = null;
         }
    }
    function saveAppData() {
        // ... (Funktion bleibt gleich) ...
        try {
            localStorage.setItem('todoAppData', JSON.stringify(appData));
            if (activeListId) localStorage.setItem('activeListId', activeListId);
            else localStorage.removeItem('activeListId');
        } catch (e) {
            console.error("Fehler beim Speichern der App-Daten:", e);
            alert("Fehler beim Speichern der App-Daten! Änderungen gehen möglicherweise verloren.");
        }
    }

    // --- Hilfsfunktionen ---
    function getTodayDateString() {
        // ... (Funktion bleibt gleich) ...
        const today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        return today.toISOString().split('T')[0];
    }

    // --- UI Rendering Funktionen ---
    function renderSidebarNavAndSelector() { /* ... bleibt gleich ... */ }
    function renderListContent(listId) { /* ... bleibt gleich ... */ }
    function renderTask(task, listId, targetListPending, targetListCompleted) { /* ... bleibt gleich ... */ }
    function renderUI() { /* ... bleibt gleich ... */ }

    // --- Aktionen (Listen & Aufgaben) ---
    function switchList(listId) { /* ... bleibt gleich ... */ }
    function addList() { /* ... bleibt gleich ... */ }
    function deleteActiveList() { /* ... bleibt gleich ... */ }
    function addTask() { /* ... bleibt gleich ... */ }
    function toggleTaskCompleted(taskId, listId) { /* ... bleibt gleich ... */ }
    function deleteTask(taskId, listId) { /* ... bleibt gleich ... */ }

    // --- Drag & Drop Handler ---
    function handleDragStart(event) { /* ... bleibt gleich ... */ }
    function handleDragEnd(event) { /* ... bleibt gleich ... */ }
    function handleDragEnter(event) { /* ... bleibt gleich ... */ }
    function handleDragOver(event) { /* ... bleibt gleich ... */ }
    function handleDragLeave(event) { /* ... bleibt gleich ... */ }
    function handleDrop(event) { /* ... bleibt gleich ... */ }

    // --- NEU: Einstellungs-Modal & Theme/Farb-Logik ---
    function closeSettingsModal() {
        if (!settingsModal || !settingsModalOverlay) return;
        settingsModal.classList.remove('visible');
        settingsModalOverlay.classList.remove('visible');
    }

    function applySavedTheme() {
        // Verwende 'todoTheme' als Key für diese App
        const savedTheme = localStorage.getItem('todoTheme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            if(themeDarkRadio) themeDarkRadio.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            if(themeLightRadio) themeLightRadio.checked = true;
        }
        console.log(`Theme angewendet: ${savedTheme}`);
    }

    function applySavedColor() {
        if (!colorPicker) return;
        // Verwende 'todoAccentColor' als Key
        const savedColor = localStorage.getItem('todoAccentColor');
        // Hole Standardfarbe aus CSS Variable als Fallback
        const defaultColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
        const colorToApply = savedColor || defaultColor || '#0078D7'; // Zusätzlicher Fallback

        document.documentElement.style.setProperty('--accent-color', colorToApply);
        colorPicker.value = colorToApply; // Setze den Picker auf die angewendete Farbe
    }

     function handleThemeChange(event) {
        if (!event || !event.target) return;
        const selectedTheme = event.target.value;
        if (selectedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('todoTheme', selectedTheme); // Speichere unter 'todoTheme'
        console.log(`Theme geändert zu: ${selectedTheme}`);
    }

    // --- Initialisierung ---
    function initializeApp() {
        console.log("Initializing To-Do App v4...");
        loadAppData();
        applySavedTheme(); // Zuerst Theme anwenden
        applySavedColor(); // Dann Farbe anwenden (falls sie vom Theme abhängt)
        renderUI(); // Initiale UI rendern

        // Event Listeners hinzufügen
        addListButton.addEventListener('click', addList);
        deleteListButton.addEventListener('click', deleteActiveList);
        addTaskButton.addEventListener('click', addTask);

        // Event Listener für Settings Button
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                if (settingsModal && settingsModalOverlay) {
                    // Stelle sicher, dass die aktuellen Werte im Modal angezeigt werden
                    applySavedTheme();
                    applySavedColor();
                    settingsModal.classList.add('visible');
                    settingsModalOverlay.classList.add('visible');
                } else {
                    console.error("Einstellungs-Modal Elemente fehlen.");
                    alert("Einstellungsfunktion ist derzeit nicht verfügbar.");
                }
            });
        }

        // Event Listeners für Settings Modal Schließen
        if (settingsModalCloseBtn) settingsModalCloseBtn.addEventListener('click', closeSettingsModal);
        if (settingsModalOverlay) settingsModalOverlay.addEventListener('click', closeSettingsModal);

        // Event Listeners für Theme- und Farbänderungen
        if (themeLightRadio) themeLightRadio.addEventListener('change', handleThemeChange);
        if (themeDarkRadio) themeDarkRadio.addEventListener('change', handleThemeChange);
        if (colorPicker) {
            colorPicker.addEventListener('input', (event) => {
                const newColor = event.target.value;
                document.documentElement.style.setProperty('--accent-color', newColor);
                // Optional: Sofort speichern oder erst beim Schließen des Modals
                localStorage.setItem('todoAccentColor', newColor); // Speichere unter 'todoAccentColor'
            });
        }

        // Enter-Taste für Eingabefelder
        newListInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addList(); });
        taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });
        dueDateInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });

        // Globaler Escape-Key Listener
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                // Schließe das oberste sichtbare Modal
                if (settingsModal?.classList.contains('visible')) {
                    closeSettingsModal();
                }
                // Hier könnten später andere Modals (z.B. Hilfe) hinzukommen
            }
        });

        console.log("App Initialized.");
    }

    // App starten
    initializeApp();

}); // Ende DOMContentLoaded