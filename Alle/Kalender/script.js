document.addEventListener('DOMContentLoaded', () => {
    // DOM Elemente
    const body = document.body;
    const settingsButton = document.getElementById('settings-button');
    const settingsPanel = document.getElementById('settings-panel');
    const closeSettingsButton = document.getElementById('close-settings-button');
    const overlay = document.getElementById('overlay');
    const themeSelect = document.getElementById('theme-select');
    const viewButtons = document.querySelectorAll('.view-button');
    const calendarTitleEl = document.getElementById('calendar-title');
    const calendarSubtitleEl = document.getElementById('calendar-subtitle');
    const weekdaysHeaderEl = document.getElementById('weekdays-header');
    const daysGridEl = document.getElementById('days-grid');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const selectedDateDisplayEl = document.getElementById('selected-date-display');
    const eventListEl = document.getElementById('event-list');
    const addEventForm = document.getElementById('add-event-form');
    const eventTimeInput = document.getElementById('event-time-input');
    const eventDescInput = document.getElementById('event-desc-input');
    const addEventButton = document.getElementById('add-event-button');

    // Zustand
    let currentView = localStorage.getItem('calendarView') || 'month'; // month, week, workweek
    let currentDate = new Date(); // Referenzdatum für die aktuelle Ansicht
    let selectedDayElement = null;
    let selectedFullDate = null; // Format YYYY-MM-DD

    // Laden der Termine (neue Struktur!)
    // Format: { "YYYY-MM-DD": [{time: "HH:MM", desc: "Termin 1"}, ...] }
    let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};

    const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    const dayNamesShort = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]; // Sonntag=0

    // --- Initialisierung ---
    function init() {
        loadTheme();
        updateViewButtons();
        renderCalendar(); // Erste Anzeige basierend auf gespeichertem View & heutigem Datum
        setupEventListeners();
    }

    // --- Event Listeners Setup ---
    function setupEventListeners() {
        settingsButton.addEventListener('click', toggleSettingsPanel);
        closeSettingsButton.addEventListener('click', toggleSettingsPanel);
        overlay.addEventListener('click', toggleSettingsPanel);
        themeSelect.addEventListener('change', handleThemeChange);
        viewButtons.forEach(button => button.addEventListener('click', handleViewChange));
        prevButton.addEventListener('click', navigatePrevious);
        nextButton.addEventListener('click', navigateNext);
        addEventButton.addEventListener('click', addEvent);
        eventDescInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addEvent(); });
         // Event-Listener für Tage werden in renderCalendar hinzugefügt
    }

    // --- Settings & Theme ---
    function toggleSettingsPanel() {
        settingsPanel.classList.toggle('visible');
        overlay.classList.toggle('visible');
        settingsButton.classList.toggle('rotate'); // Icon drehen
    }

    function handleThemeChange() {
        const selectedTheme = themeSelect.value;
        applyTheme(selectedTheme);
        localStorage.setItem('calendarTheme', selectedTheme);
    }

    function applyTheme(theme) {
        body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
        themeSelect.value = theme; // Sicherstellen, dass Dropdown korrekt ist
    }

    function loadTheme() {
        const savedTheme = localStorage.getItem('calendarTheme') || 'light';
        applyTheme(savedTheme);
    }

    // --- View Management ---
     function handleViewChange(event) {
        const newView = event.target.dataset.view;
        if (newView !== currentView) {
            currentView = newView;
            localStorage.setItem('calendarView', currentView);
            updateViewButtons();
            currentDate = new Date(); // Zurück zum aktuellen Datum bei Ansichtswechsel
            renderCalendar();
            // Terminauswahl zurücksetzen
             resetEventSelection();
        }
        // Optional: Panel schließen nach Auswahl
        // toggleSettingsPanel();
    }

     function updateViewButtons() {
        viewButtons.forEach(button => {
            if (button.dataset.view === currentView) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

     function resetEventSelection() {
         if (selectedDayElement) {
            selectedDayElement.classList.remove('selected');
        }
        selectedDayElement = null;
        selectedFullDate = null;
        addEventForm.style.display = 'none';
        selectedDateDisplayEl.textContent = '--.--.----';
        eventListEl.innerHTML = '<li>Kein Tag ausgewählt</li>';
    }

    // --- Navigation ---
    function navigatePrevious() {
        if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() - 1);
        } else { // week or workweek
            currentDate.setDate(currentDate.getDate() - 7);
        }
        renderCalendar();
        resetEventSelection();
    }

    function navigateNext() {
        if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else { // week or workweek
            currentDate.setDate(currentDate.getDate() + 7);
        }
        renderCalendar();
        resetEventSelection();
    }

    // --- Kalender Rendering (Hauptlogik) ---
    function renderCalendar() {
        daysGridEl.innerHTML = ''; // Gitter immer leeren
        adjustWeekdaysHeader(); // Wochentage anpassen (Mo-Fr / Mo-So)

        if (currentView === 'month') {
            renderMonthView();
        } else if (currentView === 'week' || currentView === 'workweek') {
            renderWeekBasedView();
        }
    }

    function adjustWeekdaysHeader() {
         weekdaysHeaderEl.innerHTML = '';
         const daysToShow = (currentView === 'workweek') ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 0]; // Mo-Fr oder Mo-So (Sonntag=0)
         const dayNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
         const displayNames = (currentView === 'workweek') ? dayNames.slice(0,5) : dayNames;

         weekdaysHeaderEl.style.gridTemplateColumns = `repeat(${displayNames.length}, 1fr)`;

         displayNames.forEach(name => {
             const li = document.createElement('li');
             li.textContent = name;
             weekdaysHeaderEl.appendChild(li);
         });
    }


    function renderMonthView() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        calendarTitleEl.textContent = monthNames[month];
        calendarSubtitleEl.textContent = year;
        daysGridEl.style.gridTemplateColumns = `repeat(7, 1fr)`; // 7 Spalten für Monat

        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=So, 1=Mo...
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const displayFirstDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; // Korrektur für Wochenstart Mo

        // Tage des Vormonats
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        for (let i = displayFirstDay; i > 0; i--) {
            const day = daysInPrevMonth - i + 1;
            createDayElement(day, 'prev-date');
        }

        // Tage des aktuellen Monats
        for (let i = 1; i <= daysInMonth; i++) {
             const dayDate = new Date(year, month, i);
             createDayElement(i, 'current-month', dayDate);
        }

        // Tage des nächsten Monats
        const totalCells = displayFirstDay + daysInMonth;
        const remainingCells = totalCells <= 35 ? (35 - totalCells) : (42 - totalCells); // Fülle auf 5 oder 6 Zeilen
        for (let i = 1; i <= remainingCells; i++) {
             createDayElement(i, 'next-date');
        }
    }

    function renderWeekBasedView() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const day = currentDate.getDate();

        // Finde den Montag der aktuellen Woche
        const currentDayOfWeek = currentDate.getDay(); // 0=So, 1=Mo
        const diffToMonday = (currentDayOfWeek === 0) ? -6 : 1 - currentDayOfWeek;
        const mondayDate = new Date(year, month, day + diffToMonday);

        const daysToShow = (currentView === 'workweek') ? 5 : 7;
        daysGridEl.style.gridTemplateColumns = `repeat(${daysToShow}, 1fr)`; // 5 oder 7 Spalten

        const weekDates = [];
        for (let i = 0; i < daysToShow; i++) {
            const date = new Date(mondayDate);
            date.setDate(mondayDate.getDate() + i);
            weekDates.push(date);
            createDayElement(date.getDate(), 'current-month', date); // Alle Tage als 'current' behandeln
        }

        // Titel anpassen (z.B. "Woche 16: 15. Apr - 21. Apr 2025")
        const startOfWeek = weekDates[0];
        const endOfWeek = weekDates[weekDates.length - 1];
        const weekNumber = getWeekNumber(startOfWeek);

        calendarTitleEl.textContent = `Woche ${weekNumber}`;
        calendarSubtitleEl.textContent = `${formatDateShort(startOfWeek)} - ${formatDateShort(endOfWeek)} ${startOfWeek.getFullYear()}`;
    }


    // Hilfsfunktion zum Erstellen eines Tages-Elements
     function createDayElement(dayNumber, typeClass, dateObject = null) {
        const li = document.createElement('li');
        li.textContent = dayNumber;
        li.classList.add(typeClass);

        if (dateObject) {
            const fullDateStr = formatDateISO(dateObject);
            li.dataset.date = fullDateStr;

            // Heute markieren
            const today = new Date();
            if (dateObject.toDateString() === today.toDateString()) {
                li.classList.add('today');
            }

            // Event-Indikator
            if (events[fullDateStr] && events[fullDateStr].length > 0) {
                li.classList.add('event-day');
            }

            // Klickbar machen
            li.addEventListener('click', () => handleDayClick(li, fullDateStr));
        }

        daysGridEl.appendChild(li);
    }


    // --- Event Handling ---
    function handleDayClick(dayElement, fullDateStr) {
        if (selectedDayElement) {
            selectedDayElement.classList.remove('selected');
        }
        selectedDayElement = dayElement;
        selectedDayElement.classList.add('selected');
        selectedFullDate = fullDateStr;

        const displayDate = formatDateReadable(new Date(fullDateStr + 'T00:00:00')); // Korrekte Datumserzeugung
        selectedDateDisplayEl.textContent = displayDate;

        displayEvents(fullDateStr);
        addEventForm.style.display = 'flex'; // Formular anzeigen
        eventDescInput.focus();
    }

    function displayEvents(dateStr) {
        eventListEl.innerHTML = '';
        let dayEvents = events[dateStr] || [];

        // Termine nach Zeit sortieren
        dayEvents.sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));


        if (dayEvents.length === 0) {
            eventListEl.innerHTML = '<li class="no-events">Keine Termine an diesem Tag.</li>';
        } else {
            dayEvents.forEach((event, index) => {
                const li = document.createElement('li');

                const timeSpan = document.createElement('span');
                timeSpan.classList.add('event-time');
                timeSpan.textContent = event.time || "--:--"; // Zeige Zeit oder Platzhalter

                const descSpan = document.createElement('span');
                descSpan.classList.add('event-desc');
                descSpan.textContent = event.desc;

                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '&times;'; // 'x' Symbol
                deleteBtn.classList.add('delete-event-btn');
                deleteBtn.title = "Termin löschen";
                deleteBtn.onclick = () => deleteEvent(dateStr, index);

                li.appendChild(timeSpan);
                li.appendChild(descSpan);
                li.appendChild(deleteBtn);
                eventListEl.appendChild(li);
            });
        }
    }

    function addEvent() {
        const eventTime = eventTimeInput.value;
        const eventDesc = eventDescInput.value.trim();

        if (!eventDesc || !selectedFullDate) {
            alert("Bitte eine Beschreibung eingeben und einen Tag auswählen.");
            return;
        }

        if (!events[selectedFullDate]) {
            events[selectedFullDate] = [];
        }
        events[selectedFullDate].push({ time: eventTime, desc: eventDesc });

        saveEvents();
        displayEvents(selectedFullDate); // Liste aktualisieren

        // Eingabefelder leeren
        eventTimeInput.value = '';
        eventDescInput.value = '';
        eventDescInput.focus(); // Fokus auf Beschreibung für nächsten Termin

        // Event-Indikator hinzufügen/sicherstellen
        if (selectedDayElement && !selectedDayElement.classList.contains('event-day')) {
             selectedDayElement.classList.add('event-day');
        }
    }

     function deleteEvent(dateStr, index) {
        if (events[dateStr] && events[dateStr][index] !== undefined) {
            events[dateStr].splice(index, 1);

            if (events[dateStr].length === 0) {
                delete events[dateStr];
                 // Event-Indikator entfernen, wenn keine Events mehr da sind
                 const dayEl = daysGridEl.querySelector(`li[data-date="${dateStr}"]`);
                 if (dayEl) {
                     dayEl.classList.remove('event-day');
                 }
            }
            saveEvents();
            displayEvents(dateStr); // Liste aktualisieren
        }
    }

    function saveEvents() {
        localStorage.setItem('calendarEvents', JSON.stringify(events));
    }


    // --- Datums-Hilfsfunktionen ---
    function formatDateISO(date) { // YYYY-MM-DD
        return date.toISOString().split('T')[0];
    }
     function formatDateReadable(date) { // DD.MM.YYYY
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}.${m}.${y}`;
    }
    function formatDateShort(date) { // D. Mon (z.B. 15. Apr)
        const d = date.getDate();
        const m = monthNames[date.getMonth()].substring(0, 3);
        return `${d}. ${m}`;
    }

     // Gibt die ISO 8601 Wochennummer zurück
     function getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7)); // Donnerstag der Woche
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
        return weekNo;
    }

    // --- Start ---
    init();
});