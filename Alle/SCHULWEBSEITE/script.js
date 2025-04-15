// Warten, bis das gesamte HTML geladen ist
document.addEventListener('DOMContentLoaded', () => {

    console.log("EVENT: DOMContentLoaded - Skript startet Initialisierung.");

    // --- Globale Variablen & Konfiguration ---
    const faecherListe = [ // Wird für Sortierung der Noten verwendet
        "FU-IT", "IT-Tec(Hardware)", "IT-Tec(Sicherheit)", "IT-Tec(Beschaffung)",
        "BGWP", "Deutsch", "Englisch", "AEUP"
    ];

    // --- Seiten-spezifische Initialisierung mit Fehlerbehandlung ---
    // Versuch, die Homepage zu initialisieren
    if (document.getElementById('dashboard-container')) {
        console.log("INFO: Versuche Homepage-Widgets zu initialisieren...");
        try {
            initHomepage();
            console.log("SUCCESS: Homepage-Widgets erfolgreich initialisiert.");
        } catch (error) {
            console.error("FATAL ERROR bei Initialisierung der Homepage:", error);
            alert("Ein Fehler ist bei der Initialisierung der Homepage aufgetreten. Prüfe die Konsole (F12).");
        }
    }
    // Versuch, den Stundenplan zu initialisieren
    else if (document.getElementById('stundenplan-grid')) {
        console.log("INFO: Versuche Stundenplan-Seite zu initialisieren...");
        try {
            initStundenplan();
            console.log("SUCCESS: Stundenplan-Seite erfolgreich initialisiert.");
        } catch (error) {
            console.error("FATAL ERROR bei Initialisierung des Stundenplans:", error);
            alert("Ein Fehler ist bei der Initialisierung des Stundenplans aufgetreten. Prüfe die Konsole (F12).");
        }
    }
    // Versuch, die Notenseite zu initialisieren
    else if (document.getElementById('neue-note-form')) {
        console.log("INFO: Versuche Noten-Seite zu initialisieren...");
        try {
            initNoten();
            console.log("SUCCESS: Noten-Seite erfolgreich initialisiert.");
        } catch (error) {
            console.error("FATAL ERROR bei Initialisierung der Notenverwaltung:", error);
            alert("Ein Fehler ist bei der Initialisierung der Notenverwaltung aufgetreten. Prüfe die Konsole (F12).");
        }
    } else {
        console.warn("WARNUNG: Keine bekannten Haupt-Container-Elemente gefunden. Skript führt keine spezifische Seiteninitialisierung durch.");
    }

    // =========================================================================
    // --- Funktionen für die Homepage Widgets ---
    // =========================================================================
    function initHomepage() {
        // Rufe die Update-Funktionen für die einzelnen Widgets auf
        updateWochenFortschritt();
        updateGesamtDurchschnitt();
        updateHeuteInfo(); // Diese Funktion enthält die Logik für die Tagesnotiz
    }

    function updateWochenFortschritt() {
        console.log("FUNC: updateWochenFortschritt gestartet.");
        // ACHTUNG: Diese Werte sind aktuell fest im Code definiert!
        const aktuelleWoche = 8;
        const gesamtWochen = 12;

        // Elemente holen
        const aktuelleWocheElement = document.getElementById('aktuelle-woche');
        const gesamtWochenElement = document.getElementById('gesamt-wochen');
        const progressBarElement = document.getElementById('wochen-progress-bar');
        const prozentErledigtElement = document.getElementById('prozent-erledigt');

        // Prüfen, ob alle Elemente gefunden wurden
        if (!aktuelleWocheElement || !gesamtWochenElement || !progressBarElement || !prozentErledigtElement) {
            console.error("ERROR in updateWochenFortschritt: Mindestens ein DOM-Element nicht gefunden. IDs: aktuelle-woche, gesamt-wochen, wochen-progress-bar, prozent-erledigt");
            return; // Funktion abbrechen
        }

        // Berechnung und Anzeige
        if (gesamtWochen <= 0) {
             console.warn("WARNUNG in updateWochenFortschritt: Gesamtanzahl Wochen ist 0 oder negativ. Setze auf 0%.");
             aktuelleWocheElement.textContent = '0';
             gesamtWochenElement.textContent = '?';
             progressBarElement.style.width = '0%';
             prozentErledigtElement.textContent = '0';
             return;
        }

        // Sicherstellen, dass aktuelleWoche nicht außerhalb des Bereichs liegt
        const bereinigteAktuelleWoche = Math.max(0, Math.min(aktuelleWoche, gesamtWochen));
        const prozent = Math.round((bereinigteAktuelleWoche / gesamtWochen) * 100);

        // Werte in die HTML-Elemente schreiben
        aktuelleWocheElement.textContent = bereinigteAktuelleWoche;
        gesamtWochenElement.textContent = gesamtWochen;
        // WICHTIG: Setzt die Breite des Fortschrittsbalkens.
        // Die CSS-Transition sorgt für den visuellen Effekt des "Füllens".
        progressBarElement.style.width = `${prozent}%`;
        progressBarElement.textContent = `${prozent}%`; // Text im Balken anzeigen
        prozentErledigtElement.textContent = prozent; // Text unter dem Balken aktualisieren

        console.log(`SUCCESS: Wochenfortschritt aktualisiert: Woche ${bereinigteAktuelleWoche} von ${gesamtWochen} (${prozent}%)`);
    }

    function updateGesamtDurchschnitt() {
        console.log("FUNC: updateGesamtDurchschnitt gestartet.");
        const noten = loadNoten(); // Lädt Noten aus localStorage (gibt immer Array zurück)
        console.log(`INFO: ${noten.length} Noten für Durchschnittsberechnung geladen.`);

        const anzahlNoten = noten.length;
        const durchschnittWertElement = document.getElementById('durchschnitt-wert');
        const anzahlNotenInfoElement = document.getElementById('anzahl-noten-info');

        // Prüfen, ob die Anzeige-Elemente vorhanden sind
        if (!durchschnittWertElement || !anzahlNotenInfoElement) {
             console.error("ERROR in updateGesamtDurchschnitt: Anzeige-Elemente nicht gefunden (IDs: durchschnitt-wert, anzahl-noten-info).");
             return;
        }

        // Anzahl der Noten anzeigen
        anzahlNotenInfoElement.textContent = `(Basierend auf ${anzahlNoten} Noten)`;

        if (anzahlNoten === 0) {
            durchschnittWertElement.textContent = 'N/A'; // Keine Noten -> Kein Durchschnitt
            console.log("INFO: Keine Noten vorhanden, Durchschnitt ist N/A.");
            return;
        }

        // Durchschnittsberechnung (delegiert an calculateAverage)
        const gesamtDurchschnitt = calculateAverage(noten); // Nutzt die globale Hilfsfunktion

        if (gesamtDurchschnitt !== null) {
            durchschnittWertElement.textContent = gesamtDurchschnitt.toFixed(2); // Auf 2 Nachkommastellen runden
            console.log(`SUCCESS: Gesamtdurchschnitt berechnet: ${gesamtDurchschnitt.toFixed(2)}`);
        } else {
            durchschnittWertElement.textContent = 'Fehler'; // Sollte nicht passieren, wenn Noten da sind, aber sicher ist sicher
             console.error("ERROR in updateGesamtDurchschnitt: Konnte Durchschnitt nicht berechnen, obwohl Noten vorhanden sind.");
        }
    }

    function updateHeuteInfo() {
        console.log("FUNC: updateHeuteInfo gestartet.");
        const heuteDatumElement = document.getElementById('heute-datum');
        const notizForm = document.getElementById('neue-notiz-form');
        const notizInput = document.getElementById('neue-notiz-input');
        // Das Anzeigeelement für die Notiz wird in displayHeuteNotizText() geholt

        // Prüfen, ob kritische Elemente vorhanden sind
        if (!heuteDatumElement || !notizForm || !notizInput) {
             console.error("ERROR in updateHeuteInfo: Kritische Elemente nicht gefunden (IDs: heute-datum, neue-notiz-form, neue-notiz-input).");
             return; // Funktion abbrechen, da Kernfunktionalität nicht gegeben ist
        }

        // Aktuelles Datum anzeigen
        try {
            const heute = new Date();
            const wochentage = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
            heuteDatumElement.textContent = `${wochentage[heute.getDay()]}, ${heute.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
        } catch (e) {
             console.error("ERROR beim Formatieren des Datums:", e);
             heuteDatumElement.textContent = "Datum Fehler";
        }

        // Gespeicherte Notiz für heute laden und anzeigen (wird von displayHeuteNotizText erledigt)
        displayHeuteNotizText();

        // Event Listener für das Notiz-Formular hinzufügen
        notizForm.onsubmit = (event) => {
            console.log("EVENT: Notiz-Formular abgeschickt.");
            event.preventDefault(); // Standard-Formularabsendung verhindern

            const notizText = notizInput.value.trim(); // Text holen und Leerzeichen entfernen
            console.log("INFO: Eingegebener Notiztext:", `"${notizText}"`);

            if (notizText) {
                // Wenn Text vorhanden ist -> Speichern
                saveHeuteNotizText(notizText);
                notizInput.value = ''; // Eingabefeld leeren
                 console.log("INFO: Notiz gespeichert, Eingabefeld geleert.");
            } else {
                 // Wenn Text leer ist -> Gespeicherte Notiz löschen
                 console.log("INFO: Leere Eingabe -> Lösche gespeicherte Notiz für heute.");
                 saveHeuteNotizText(""); // Leeren String speichern (führt zum Löschen in saveHeuteNotizText)
            }

            // In beiden Fällen: Anzeige aktualisieren
            displayHeuteNotizText();
            console.log("--- Notiz-Formular Verarbeitung abgeschlossen ---");
        };
        console.log("INFO: Event Listener für Notizformular erfolgreich gesetzt.");
    }

    // --- NEUE/ANGEPASSTE Tagesnotiz Funktionen (Speichert nur EINE Notiz pro Tag) ---

    function getHeuteNotizKey() {
        const heute = new Date();
        // Erzeugt einen Schlüssel wie 'tagesnotiz_2025-04-14'
        const key = `tagesnotiz_${heute.getFullYear()}-${String(heute.getMonth() + 1).padStart(2, '0')}-${String(heute.getDate()).padStart(2, '0')}`;
        // console.log("DEBUG: Generierter Tagesnotiz-Schlüssel:", key); // Bei Bedarf einkommentieren
        return key;
    }

    function loadHeuteNotizText() {
        const key = getHeuteNotizKey();
        console.log(`FUNC: loadHeuteNotizText für Key '${key}'`);
        try {
            const gespeicherterText = localStorage.getItem(key);
            if (gespeicherterText === null) {
                console.log("INFO: Kein Eintrag für diesen Schlüssel im localStorage gefunden.");
                return ""; // Wichtig: Leeren String zurückgeben, nicht null
            } else {
                console.log(`INFO: Text aus localStorage geladen: "${gespeicherterText}"`);
                return gespeicherterText;
            }
        } catch (error) {
            console.error(`ERROR beim Laden der Tagesnotiz (Key: ${key}) aus localStorage:`, error);
            alert(`Fehler beim Laden der Notiz für heute. Grund: ${error.message}`);
            return ""; // Im Fehlerfall leeren String zurückgeben
        }
    }

    function saveHeuteNotizText(text) {
        const key = getHeuteNotizKey();
        console.log(`FUNC: saveHeuteNotizText für Key '${key}' mit Text: "${text}"`);
        try {
            const textToStore = text.trim(); // Nur getrimmten Text speichern
            if (textToStore.length > 0) {
                localStorage.setItem(key, textToStore);
                 console.log(`SUCCESS: Tagesnotiz für Key '${key}' erfolgreich gespeichert.`);
            } else {
                // Wenn der (getrimmte) Text leer ist, den Eintrag entfernen
                localStorage.removeItem(key);
                 console.log(`INFO: Tagesnotiz für Key '${key}' wurde gelöscht (Text war leer).`);
            }
        } catch (error) {
            console.error(`ERROR beim Speichern/Löschen der Tagesnotiz (Key: ${key}) in localStorage:`, error);
            // Informiere den Benutzer über den Fehler
            alert(`Fehler: Die Notiz konnte nicht gespeichert werden.\nGrund: ${error.message}\nMöglicherweise ist der Speicher voll oder der Zugriff wurde verweigert.`);
        }
    }

    function displayHeuteNotizText() {
        console.log("FUNC: displayHeuteNotizText gestartet.");
        const anzeigeElement = document.getElementById('heute-notiz-anzeige');

        if (!anzeigeElement) {
            console.error("FATAL ERROR in displayHeuteNotizText: Notiz-Anzeigeelement 'heute-notiz-anzeige' NICHT im DOM gefunden!");
            return; // Abbruch, da Anzeige nicht möglich
        }
        console.log("INFO: Notiz-Anzeigeelement gefunden.");

        const notizText = loadHeuteNotizText(); // Lädt den Text (oder leeren String)

        if (notizText) {
            anzeigeElement.textContent = notizText; // Zeige den gespeicherten Text an
            anzeigeElement.classList.remove('placeholder'); // Entferne evtl. Platzhalter-Styling
             console.log("INFO: Gespeicherte Notiz wird angezeigt.");
        } else {
            anzeigeElement.textContent = "Keine Notiz für heute eingetragen."; // Standardtext
            anzeigeElement.classList.add('placeholder'); // Füge Platzhalter-Styling hinzu (siehe CSS)
             console.log("INFO: Keine Notiz vorhanden, zeige Standardtext an.");
        }
         console.log("SUCCESS: Anzeige der Tagesnotiz abgeschlossen.");
    }


    // =========================================================================
    // --- Funktionen für den Stundenplan ---
    // =========================================================================
    function initStundenplan() {
        console.log("FUNC: initStundenplan gestartet.");
        const stundenplanBody = document.getElementById('stundenplan-body');
        const faecherElemente = document.querySelectorAll('#faecher-liste .fach');

        if (!stundenplanBody || faecherElemente.length === 0) {
            console.error("ERROR in initStundenplan: Stundenplan-Body oder Fächer-Elemente nicht gefunden.");
            return;
        }

        try {
             console.log("INFO: Generiere Stundenplan-Grid...");
            generateStundenplanGrid(stundenplanBody); // Grid aufbauen
             console.log("INFO: Stundenplan-Grid generiert.");

            // Zellen erst holen, NACHDEM sie generiert wurden!
            const stundenZellen = Array.from(document.querySelectorAll('#stundenplan-grid td.stunde'));
            if(stundenZellen.length === 0) {
                 console.warn("WARNUNG in initStundenplan: Keine Stundenplan-Zellen (td.stunde) nach Generierung gefunden.");
                 // Evtl. trotzdem weitermachen, falls Drag&Drop nur auf Fächer angewendet wird?
            }

             console.log(`INFO: Füge Drag & Drop Listener für ${faecherElemente.length} Fächer und ${stundenZellen.length} Zellen hinzu...`);
            addDragDropListeners(faecherElemente, stundenZellen); // Drag&Drop aktivieren
             console.log("INFO: Drag & Drop Listener hinzugefügt.");

             console.log("INFO: Lade gespeicherten Stundenplan...");
            loadStundenplan(stundenZellen); // Gespeicherten Plan laden
             console.log("INFO: Gespeicherter Stundenplan geladen (falls vorhanden).");

        } catch (error) {
             console.error("ERROR während der Stundenplan-Initialisierung:", error);
             alert("Fehler beim Initialisieren des Stundenplans. Prüfe die Konsole.");
        }
    }

    function generateStundenplanGrid(tbody) {
        tbody.innerHTML = ''; // Bestehendes Grid leeren
        const zeiten = ["07:45 - 08:30", "08:30 - 09:15", "09:15 - 10:00", /* Pause */ "10:00 - 10:20", "10:20 - 11:05", "11:05 - 11:50", "11:50 - 12:35", /* Mittag */ "12:35 - 13:30", "13:30 - 14:15", "14:15 - 15:00"];
        const tage = ["Mo", "Di", "Mi", "Do", "Fr"];
        // Definiert, bis zur wievielten Stunde (Index 1-basiert) der Tag geht
        const maxStundenProTag = { Mo: 6, Di: 8, Mi: 8, Do: 6, Fr: 5 }; // Angepasst an die 8 Stunden Di/Mi
        const pausenZeiten = ["10:00 - 10:20", "12:35 - 13:30"]; // Zeiten, die als Pause formatiert werden

        let stundenIndex = 0; // Zählt die "echten" Unterrichtsstunden (1-basiert)

        zeiten.forEach((zeit) => {
            const row = tbody.insertRow();
            const zeitZelle = row.insertCell();
            zeitZelle.textContent = zeit;

            if (pausenZeiten.includes(zeit)) {
                 // Pausenzeile: Zelle über alle Tage spannen
                 row.classList.add('pause-row');
                 zeitZelle.colSpan = tage.length + 1; // Zeit + alle Tage
                 zeitZelle.style.textAlign = 'center';
                 zeitZelle.style.fontStyle = 'italic';
                 // Kein Stundenindex-Inkrement hier
            } else {
                 // Normale Unterrichtsstunde oder Zeitblock
                 stundenIndex++; // Nächste Stunde
                 tage.forEach(tag => {
                     const zelle = row.insertCell();
                     if (stundenIndex <= maxStundenProTag[tag]) {
                         // Gültige Stunde für diesen Tag
                         zelle.classList.add('stunde'); // Klasse für Drag&Drop und Styling
                         zelle.dataset.tag = tag;        // Tag speichern für Identifizierung
                         zelle.dataset.stunde = stundenIndex; // Stundenindex speichern
                     } else {
                         // Ungültige/leere Stunde für diesen Tag
                         zelle.classList.add('inactive'); // Styling für inaktive Zellen
                     }
                 });
            }
        });
         console.log(`DEBUG: Stundenplan-Grid mit ${stundenIndex} Zeitblöcken (inkl. Pausen) generiert.`);
    }

    function addDragDropListeners(draggableElements, droppableElements) {
        let draggedItem = null; // Hält das Element, das gerade gezogen wird

        // Listener für die Fächer (draggable)
        draggableElements.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItem = item; // Element merken
                // Daten für den Drop setzen (Fachname oder leer für 'Leer'-Element)
                const fachData = item.dataset.fach !== undefined ? item.dataset.fach : item.textContent;
                e.dataTransfer.setData('text/plain', fachData);
                e.dataTransfer.effectAllowed = 'move'; // Erlaubter Effekt
                 console.log(`DRAG START: Ziehe Fach "${fachData}"`);
                // Leichte Verzögerung, um das Styling anzuwenden, nachdem der Browser den "Drag Ghost" erstellt hat
                setTimeout(() => item.classList.add('dragging'), 0); // Visuelles Feedback
            });

            item.addEventListener('dragend', () => {
                console.log(`DRAG END: Loslassen von Fach.`);
                if(draggedItem) {
                    draggedItem.classList.remove('dragging'); // Visuelles Feedback entfernen
                    draggedItem = null; // Gezogenes Element zurücksetzen
                }
            });
        });

        // Listener für die Stundenplan-Zellen (droppable)
        droppableElements.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault(); // Notwendig, um 'drop' zu erlauben
                e.dataTransfer.dropEffect = 'move'; // Visuelles Feedback (Mauszeiger)
                zone.classList.add('drag-over'); // Visuelles Feedback für die Zelle
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over'); // Feedback entfernen, wenn Maus Zelle verlässt
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault(); // Standard-Drop-Verhalten verhindern
                zone.classList.remove('drag-over'); // Feedback entfernen

                const fachName = e.dataTransfer.getData('text/plain'); // Gezogene Daten holen
                 console.log(`DROP: Fach "${fachName}" auf Zelle (Tag: ${zone.dataset.tag}, Stunde: ${zone.dataset.stunde})`);

                if (fachName !== null && fachName !== undefined) { // Sicherstellen, dass Daten vorhanden sind
                    // Zelle aktualisieren
                    if (fachName === "Leer" || fachName === "") {
                        zone.textContent = ''; // Leeren
                        zone.style.backgroundColor = ''; // Standardhintergrund
                        zone.style.color = ''; // Standardfarbe
                    } else if (fachName === "Pause") {
                         zone.textContent = 'Pause';
                         zone.style.backgroundColor = '#f0f0f0'; // Pausenfarbe (wie in CSS)
                         zone.style.color = '#666';
                    } else {
                         zone.textContent = fachName; // Fachnamen eintragen
                         zone.style.backgroundColor = ''; // Standardhintergrund
                         zone.style.color = ''; // Standardfarbe
                    }
                    // Stundenplan nach JEDEM Drop speichern
                    saveStundenplan(droppableElements);
                } else {
                     console.warn("WARNUNG: Drop-Event ohne gültige Daten empfangen.");
                }
            });
        });
    }

    function saveStundenplan(zellen) {
        console.log("FUNC: saveStundenplan gestartet.");
        const stundenplanDaten = {};
        zellen.forEach(zelle => {
            // Nur Zellen speichern, die tatsächlich Stunden sind
            if (zelle.classList.contains('stunde') && zelle.dataset.tag && zelle.dataset.stunde) {
                const tag = zelle.dataset.tag;
                const stunde = zelle.dataset.stunde;
                if (!stundenplanDaten[tag]) {
                    stundenplanDaten[tag] = {}; // Objekt für den Tag erstellen, falls nicht vorhanden
                }
                // Fachnamen (oder leeren String) speichern
                stundenplanDaten[tag][stunde] = zelle.textContent.trim();
            }
        });
        try {
            const dataString = JSON.stringify(stundenplanDaten);
            localStorage.setItem('stundenplan', dataString);
             console.log(`SUCCESS: Stundenplan im localStorage gespeichert (${dataString.length} Zeichen).`);
        } catch (error) {
             console.error("ERROR beim Speichern des Stundenplans im localStorage:", error);
             alert(`Fehler beim Speichern des Stundenplans: ${error.message}`);
        }
    }

    function loadStundenplan(zellen) {
        console.log("FUNC: loadStundenplan gestartet.");
        try {
            const gespeicherteDaten = localStorage.getItem('stundenplan');
            if (gespeicherteDaten) {
                 console.log("INFO: Gespeicherte Stundenplandaten gefunden. Verarbeite...");
                const stundenplanDaten = JSON.parse(gespeicherteDaten);

                zellen.forEach(zelle => {
                    if (zelle.classList.contains('stunde') && zelle.dataset.tag && zelle.dataset.stunde) {
                        const tag = zelle.dataset.tag;
                        const stunde = zelle.dataset.stunde;
                        // Hole Fachnamen aus den geladenen Daten, Standard ist leerer String
                        const fachName = stundenplanDaten[tag]?.[stunde] || '';
                        zelle.textContent = fachName;

                        // Setze Hintergrund für spezielle Fälle (Pause)
                        if (fachName === 'Pause') {
                            zelle.style.backgroundColor = '#f0f0f0';
                            zelle.style.color = '#666';
                        } else {
                            zelle.style.backgroundColor = ''; // Standardhintergrund
                            zelle.style.color = '';
                        }
                    }
                });
                 console.log("SUCCESS: Stundenplan erfolgreich aus localStorage geladen und angewendet.");
            } else {
                 console.log("INFO: Kein gespeicherter Stundenplan im localStorage gefunden.");
            }
        } catch (error) {
             console.error("ERROR beim Laden oder Parsen des Stundenplans aus localStorage:", error);
             alert(`Fehler beim Laden des Stundenplans: ${error.message}. Der gespeicherte Plan könnte ungültig sein.`);
        }
    }

    // =========================================================================
    // --- Funktionen für die Notenverwaltung ---
    // =========================================================================
    function initNoten() {
        console.log("FUNC: initNoten gestartet.");
        const notenForm = document.getElementById('neue-note-form');
        const notenListeDiv = document.getElementById('noten-liste');

        if (!notenForm || !notenListeDiv) {
            console.error("ERROR in initNoten: Noten-Formular oder Noten-Liste nicht gefunden.");
            return;
        }

        // Event Listener für das Absenden des Formulars
        notenForm.addEventListener('submit', (e) => {
            console.log("EVENT: Noten-Formular abgeschickt.");
            e.preventDefault(); // Standardverhalten verhindern
            if(saveNote(notenForm)) { // Nur zurücksetzen, wenn Speichern erfolgreich war (oder zumindest versucht wurde)
                notenForm.reset(); // Formularfelder leeren
                console.log("INFO: Noten-Formular zurückgesetzt.");
            }
            displayNoten(notenListeDiv); // Notenanzeige aktualisieren
            // Wenn wir auf der Homepage sind, auch dort den Durchschnitt aktualisieren
            if (document.getElementById('dashboard-container')) {
                updateGesamtDurchschnitt();
            }
        });

        // Beim Laden der Seite die Noten initial anzeigen
        displayNoten(notenListeDiv);
        console.log("INFO: Notenverwaltung initialisiert und Event Listener gesetzt.");
    }

    function saveNote(form) {
         console.log("FUNC: saveNote gestartet.");
         const formData = new FormData(form);
         let success = false; // Flag für Erfolg

         // Daten aus dem Formular extrahieren und validieren
         const neueNote = {
             id: Date.now(), // Eindeutige ID basierend auf Zeitstempel
             fach: formData.get('fach'),
             note: parseInt(formData.get('note'), 10), // Als Ganzzahl parsen
             typ: formData.get('typ'),
             gewichtung: parseFloat(formData.get('gewichtung')), // Als Fließkommazahl parsen
             datum: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) // Datum hinzufügen
         };

         console.log("INFO: Versuch, folgende Note zu speichern:", neueNote);

         // Validierung
         let validationError = "";
         if (!neueNote.fach) validationError += "Fach fehlt. ";
         if (isNaN(neueNote.note) || neueNote.note < 1 || neueNote.note > 6) validationError += "Note muss zwischen 1 und 6 sein. ";
         if (!neueNote.typ) validationError += "Typ fehlt. ";
         if (isNaN(neueNote.gewichtung) || neueNote.gewichtung <= 0) validationError += "Gewichtung muss größer als 0 sein. ";

         if (validationError) {
             console.error("ERROR in saveNote: Validierung fehlgeschlagen -", validationError);
             alert(`Fehler bei der Eingabe:\n${validationError}`);
             return success; // false zurückgeben
         }

         // Speichern im localStorage
         try {
             let noten = loadNoten(); // Bestehende Noten laden (gibt immer Array zurück)
             noten.push(neueNote); // Neue Note hinzufügen
             localStorage.setItem('noten', JSON.stringify(noten));
             console.log("SUCCESS: Note erfolgreich im localStorage gespeichert.");
             success = true; // Erfolg markieren
         } catch (error) {
             console.error("ERROR beim Speichern der Note im localStorage:", error);
             alert(`Fehler beim Speichern der Note: ${error.message}`);
             // success bleibt false
         }
         return success; // Gibt true zurück, wenn Speichern erfolgreich war
    }

    function displayNoten(container) {
        console.log("FUNC: displayNoten gestartet.");
        if (!container) {
            console.error("ERROR in displayNoten: Container-Element wurde nicht übergeben.");
            return;
        }

        container.innerHTML = '<p>Lade Noten...</p>'; // Platzhalter während des Ladens

        const noten = loadNoten(); // Gibt immer ein Array zurück
        console.log(`INFO: ${noten.length} Noten zum Anzeigen geladen.`);

        if (noten.length === 0) {
            container.innerHTML = '<p>Noch keine Noten eingetragen.</p>';
            return;
        }

        // Noten nach Fach gruppieren
        const notenNachFach = noten.reduce((acc, note) => {
            // Stelle sicher, dass note ein gültiges Objekt ist
            if(typeof note === 'object' && note !== null && note.fach) {
                (acc[note.fach] = acc[note.fach] || []).push(note);
            } else {
                console.warn("WARNUNG: Ungültiges Notenobjekt beim Gruppieren übersprungen:", note);
            }
            return acc;
        }, {});
        console.log("INFO: Noten nach Fächern gruppiert:", notenNachFach);

        // Fächer sortieren (basierend auf faecherListe, dann alphabetisch)
        const sortierteFaecher = Object.keys(notenNachFach).sort((a, b) => {
            const indexA = faecherListe.indexOf(a);
            const indexB = faecherListe.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB; // Beide in Liste -> nach Liste sortieren
            if (indexA !== -1) return -1; // Nur A in Liste -> A kommt zuerst
            if (indexB !== -1) return 1;  // Nur B in Liste -> B kommt zuerst
            return a.localeCompare(b); // Keines in Liste -> alphabetisch sortieren
        });
         console.log("INFO: Fächer sortiert:", sortierteFaecher);

        // HTML für die Anzeige generieren
        let htmlOutput = '';
        sortierteFaecher.forEach(fach => {
            const fachNoten = notenNachFach[fach];
            // Noten innerhalb des Fachs sortieren (z.B. nach Datum/ID - hier nach ID absteigend = neueste zuerst)
            fachNoten.sort((a, b) => b.id - a.id);

            htmlOutput += `<div class="fach-noten"><h4>${escapeHtml(fach)}</h4><ul>`; // Fach-Titel

            fachNoten.forEach(note => {
                // Zusätzliche Prüfung für jedes Notenobjekt
                if(typeof note === 'object' && note !== null && note.note !== undefined && note.typ && note.gewichtung !== undefined && note.datum) {
                    htmlOutput += `<li>
                        <span class="note-details">Note: <strong>${note.note}</strong> (${escapeHtml(note.typ)}, Gew: ${note.gewichtung}) - ${escapeHtml(note.datum)}</span>
                        <button class="delete-note-btn" data-note-id="${note.id}">Löschen</button>
                      </li>`;
                } else {
                    console.warn("WARNUNG: Ungültiges Notenobjekt beim Anzeigen übersprungen:", note);
                }
            });

            htmlOutput += '</ul>'; // Ende der Notenliste für das Fach

            // Durchschnitt für das Fach berechnen und hinzufügen
            const durchschnitt = calculateAverage(fachNoten);
            htmlOutput += `<p class="durchschnitt">Durchschnitt (${escapeHtml(fach)}): <strong>${durchschnitt !== null ? durchschnitt.toFixed(2) : 'N/A'}</strong></p>`;

            htmlOutput += '</div>'; // Ende des Fach-Containers
        });

        container.innerHTML = htmlOutput; // Generiertes HTML einfügen

        // Event Listener für die Löschen-Buttons hinzufügen (NACHDEM sie im DOM sind)
        container.querySelectorAll('.delete-note-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const noteId = parseInt(e.target.dataset.noteId, 10);
                if (!isNaN(noteId)) {
                    deleteNote(noteId, container); // Rufe Löschfunktion auf
                } else {
                     console.error("ERROR: Konnte noteId aus data-Attribut nicht lesen oder parsen:", e.target.dataset.noteId);
                }
            });
        });
         console.log("SUCCESS: Notenanzeige aktualisiert.");
    }

     function deleteNote(noteId, container) {
         console.log(`FUNC: deleteNote für ID ${noteId} gestartet.`);
         // Sicherheitsabfrage
         if (!confirm(`Möchtest du die Note mit ID ${noteId} wirklich löschen?`)) {
              console.log("INFO: Löschvorgang abgebrochen.");
              return;
         }

         try {
             let noten = loadNoten(); // Aktuelle Noten laden
             const anzahlVorher = noten.length;
             // Filtere die Note mit der gegebenen ID heraus
             const neueNotenListe = noten.filter(note => note.id !== noteId);
             const anzahlNachher = neueNotenListe.length;

             if (anzahlVorher === anzahlNachher) {
                 console.warn(`WARNUNG: Keine Note mit ID ${noteId} zum Löschen gefunden. Eventuell wurde sie bereits gelöscht?`);
                 // Optional: Hier keine Aktion oder nur Anzeige neu laden
             } else {
                 // Speichere die neue Liste (ohne die gelöschte Note)
                 localStorage.setItem('noten', JSON.stringify(neueNotenListe));
                 console.log(`SUCCESS: Note mit ID ${noteId} erfolgreich aus localStorage gelöscht.`);
             }

             // Aktualisiere die Anzeige auf der Notenseite
             displayNoten(container);
             // Wenn wir auf der Homepage sind, auch dort den Durchschnitt aktualisieren
             if (document.getElementById('dashboard-container')) {
                 updateGesamtDurchschnitt();
             }

         } catch (error) {
             console.error(`ERROR beim Löschen der Note (ID: ${noteId}) aus localStorage:`, error);
             alert(`Fehler beim Löschen der Note: ${error.message}`);
         }
     }

    // =========================================================================
    // --- Globale Hilfsfunktionen ---
    // =========================================================================

    // Lädt Noten sicher aus dem localStorage und gibt IMMER ein Array zurück.
    function loadNoten() {
        // console.log("FUNC: loadNoten aufgerufen."); // Kann sehr häufig aufgerufen werden, daher standardmäßig auskommentiert
        try {
            const gespeicherteNoten = localStorage.getItem('noten');
            if (gespeicherteNoten) {
                const noten = JSON.parse(gespeicherteNoten);
                // Stelle sicher, dass es ein Array ist
                if (Array.isArray(noten)) {
                    // Optional: Tiefere Prüfung, ob die Elemente im Array auch Objekte sind
                    return noten.filter(n => typeof n === 'object' && n !== null);
                } else {
                    console.warn("WARNUNG in loadNoten: Gespeicherte Daten sind kein Array. Gebe leeres Array zurück.", gespeicherteNoten);
                    return [];
                }
            } else {
                // console.log("INFO in loadNoten: Kein Eintrag 'noten' im localStorage gefunden.");
                return []; // Kein Eintrag -> leeres Array
            }
        } catch (error) {
            console.error("ERROR beim Laden oder Parsen der Noten aus localStorage:", error);
            // Bei Fehler leeres Array zurückgeben, um Folgefehler zu vermeiden
            return [];
        }
    }

    // Berechnet den gewichteten Durchschnitt für eine gegebene Liste von Noten-Objekten.
    function calculateAverage(notenListe) {
         // console.log("FUNC: calculateAverage aufgerufen für", notenListe); // Bei Bedarf einkommentieren
         if (!Array.isArray(notenListe) || notenListe.length === 0) {
             return null; // Kein Durchschnitt bei leerer Liste oder keinem Array
         }

         let summeNotenGewichtet = 0;
         let summeGewichtungen = 0;

         notenListe.forEach(note => {
             // Prüfe, ob note ein gültiges Objekt mit notwendigen Eigenschaften ist
             if (typeof note === 'object' && note !== null && !isNaN(parseFloat(note.note)) && !isNaN(parseFloat(note.gewichtung))) {
                 const noteVal = parseFloat(note.note);
                 const gewichtungVal = parseFloat(note.gewichtung);

                 // Nur gültige Noten und positive Gewichtungen berücksichtigen
                 if (noteVal >= 1 && noteVal <= 6 && gewichtungVal > 0) {
                     summeNotenGewichtet += noteVal * gewichtungVal;
                     summeGewichtungen += gewichtungVal;
                 } else {
                      console.warn("WARNUNG in calculateAverage: Note oder Gewichtung ungültig, wird ignoriert:", note);
                 }
             } else {
                  console.warn("WARNUNG in calculateAverage: Ungültiges Notenobjekt oder fehlende Werte, wird ignoriert:", note);
             }
         });

         if (summeGewichtungen > 0) {
             return summeNotenGewichtet / summeGewichtungen;
         } else {
             return null; // Kein Durchschnitt, wenn Gesamtgewichtung 0 ist
         }
    }

    // Kleine Hilfsfunktion, um HTML-Injection zu verhindern, wenn Text angezeigt wird
    function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') {
            // Versuche, es sicher in einen String umzuwandeln, falls es kein String ist
            try {
                unsafe = String(unsafe);
            } catch (e) {
                console.warn("escapeHtml: Konnte Wert nicht in String umwandeln:", unsafe);
                return ''; // Gib leeren String zurück bei Konvertierungsfehler
            }
        }
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
     }

}); // Ende von DOMContentLoaded