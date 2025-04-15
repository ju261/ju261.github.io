// ========================================================================
// == Modernes Kanban Board - Komplettes JavaScript (V6 - Mit Modal-Transitions) ==
// ========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- Globale Variablen und Element-Referenzen ---
    const kanbanBoard = document.getElementById('kanbanBoard');
    // Beschreibungs-Modal
    const modal = document.getElementById('descriptionModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const descriptionDisplay = document.getElementById('modalDescriptionDisplay');
    const descriptionInput = document.getElementById('modalDescriptionInput');
    const editDescriptionBtn = document.getElementById('editDescriptionBtn');
    const saveDescriptionBtn = document.getElementById('saveDescriptionBtn');
    const descModalCloseBtn = modal ? modal.querySelector('.desc-close') : null;
    // Hilfe-Modal
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const helpModalOverlay = document.getElementById('helpModalOverlay');
    const helpModalCloseBtn = helpModal ? helpModal.querySelector('.help-close') : null;
    // Einstellungen-Modal
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const settingsModalOverlay = document.getElementById('settingsModalOverlay');
    const settingsModalCloseBtn = settingsModal ? settingsModal.querySelector('.settings-close') : null;
    const colorPicker = document.getElementById('colorPicker');
    const themeLightRadio = document.getElementById('themeLight');
    const themeDarkRadio = document.getElementById('themeDark');

    let draggedCard = null;
    let currentCardId = null;

    // --- Sicherheitschecks ---
    if (!kanbanBoard) console.error("FEHLER: 'kanbanBoard' nicht gefunden!");
    if (!modal || !modalOverlay || !descriptionDisplay || !descriptionInput || !editDescriptionBtn || !saveDescriptionBtn || !descModalCloseBtn) console.error("FEHLER: Elemente des Beschreibungs-Modals fehlen!");
    if (!helpBtn || !helpModal || !helpModalOverlay || !helpModalCloseBtn) console.warn("WARNUNG: Hilfe-Elemente fehlen.");
    if (!settingsBtn || !settingsModal || !settingsModalOverlay || !settingsModalCloseBtn || !colorPicker || !themeLightRadio || !themeDarkRadio) console.warn("WARNUNG: Einstellungs-Elemente fehlen.");


    // ====================================================================
    // == Drag & Drop Funktionalität                                     ==
    // ====================================================================
    function addDragDropListeners(card) { if (!card) return; card.addEventListener('dragstart', handleDragStart); card.addEventListener('dragend', handleDragEnd); }
    function handleDragStart(event) { if (!event.target.classList?.contains('card')) return; draggedCard = event.target; setTimeout(() => { if (draggedCard) draggedCard.classList.add('dragging'); }, 0); event.dataTransfer.setData('text/plain', event.target.id); event.dataTransfer.effectAllowed = 'move'; }
    function handleDragEnd(event) { if (event.target.classList?.contains('card')) { event.target.classList.remove('dragging'); } if (draggedCard) { draggedCard.classList.remove('dragging'); } draggedCard = null; document.querySelectorAll('.cards.drag-over').forEach(c => c.classList.remove('drag-over')); }
    if (kanbanBoard) {
        kanbanBoard.addEventListener('dragover', (event) => { const targetColumn = event.target.closest('.cards'); if (targetColumn && draggedCard) { event.preventDefault(); targetColumn.classList.add('drag-over'); event.dataTransfer.dropEffect = 'move'; } });
        kanbanBoard.addEventListener('dragenter', (event) => { const targetColumn = event.target.closest('.cards'); if (targetColumn && draggedCard) event.preventDefault(); });
        kanbanBoard.addEventListener('dragleave', (event) => { const targetColumn = event.target.closest('.cards'); const relatedTargetIsOutside = !event.relatedTarget || !targetColumn?.contains(event.relatedTarget); if (targetColumn && relatedTargetIsOutside) { targetColumn.classList.remove('drag-over'); } });
        kanbanBoard.addEventListener('drop', (event) => { event.preventDefault(); const targetColumn = event.target.closest('.cards'); if (targetColumn && draggedCard) { targetColumn.classList.remove('drag-over'); if (targetColumn !== draggedCard.parentElement) { targetColumn.appendChild(draggedCard); console.log(`Karte ${draggedCard.id} nach ${targetColumn.id} verschoben.`); } } });
    }
    document.querySelectorAll('.card').forEach(addDragDropListeners);


    // ====================================================================
    // == Aufgaben hinzufügen / löschen                                  ==
    // ====================================================================
    function createCardElement(id, title, description = '') { const card = document.createElement('div'); card.classList.add('card'); card.id = id; card.draggable = true; card.dataset.description = description || title; const cardTitle = document.createElement('span'); cardTitle.classList.add('card-title'); cardTitle.textContent = title; const deleteBtn = document.createElement('button'); deleteBtn.classList.add('delete-card-btn'); deleteBtn.innerHTML = '&times;'; deleteBtn.setAttribute('aria-label', 'Aufgabe löschen'); card.appendChild(cardTitle); card.appendChild(deleteBtn); addDragDropListeners(card); return card; }
    if (kanbanBoard) {
        kanbanBoard.addEventListener('click', (event) => {
            if (event.target.classList.contains('add-card-btn')) { const targetColumnId = event.target.dataset.column; const targetColumnElement = document.getElementById(targetColumnId); if (targetColumnElement) { const cardTitle = prompt("Titel der neuen Aufgabe:"); if (cardTitle && cardTitle.trim() !== "") { const newCardId = `card-${Date.now()}`; const newCard = createCardElement(newCardId, cardTitle.trim()); targetColumnElement.appendChild(newCard); console.log(`Karte ${newCardId} zur Spalte ${targetColumnId} hinzugefügt.`); } } else { console.error(`FEHLER: Zielspalte mit ID '${targetColumnId}' nicht gefunden.`); } }
            if (event.target.classList.contains('delete-card-btn')) { const cardToDelete = event.target.closest('.card'); if (cardToDelete) { const cardTitleText = cardToDelete.querySelector('.card-title')?.textContent || 'diese Aufgabe'; if (confirm(`Möchtest du "${cardTitleText}" wirklich löschen?`)) { const cardId = cardToDelete.id; cardToDelete.remove(); console.log(`Karte ${cardId} gelöscht.`); } } }
        });
    }


    // ====================================================================
    // == Beschreibungs-Modal (Anzeigen / Bearbeiten)                    ==
    // ====================================================================
    function setModalToViewMode(description) { if (!descriptionDisplay || !descriptionInput || !editDescriptionBtn || !saveDescriptionBtn || !modal) return; descriptionDisplay.textContent = description || 'Keine Beschreibung vorhanden.'; descriptionDisplay.style.display = 'block'; descriptionInput.style.display = 'none'; editDescriptionBtn.style.display = 'inline-block'; saveDescriptionBtn.style.display = 'none'; modal.dataset.mode = 'view'; }
    function setModalToEditMode() { if (!descriptionDisplay || !descriptionInput || !editDescriptionBtn || !saveDescriptionBtn || !modal) return; const currentDescription = descriptionDisplay.textContent === 'Keine Beschreibung vorhanden.' ? '' : descriptionDisplay.textContent; descriptionInput.value = currentDescription; descriptionDisplay.style.display = 'none'; descriptionInput.style.display = 'block'; editDescriptionBtn.style.display = 'none'; saveDescriptionBtn.style.display = 'inline-block'; modal.dataset.mode = 'edit'; descriptionInput.focus(); }
    function closeDescriptionModal() { if (!modal || !modalOverlay) return; modal.classList.remove('visible'); modalOverlay.classList.remove('visible'); setTimeout(() => { if (modal.dataset.mode !== 'view') setModalToViewMode(''); currentCardId = null; }, 300); /* Reset nach Transition */ } // Reset leicht verzögert
    if (kanbanBoard) { kanbanBoard.addEventListener('dblclick', (event) => { const clickedCard = event.target.closest('.card'); if (clickedCard) { if (!modal || !modalOverlay) { console.error("Beschreibungs-Modal Elemente fehlen."); return; } currentCardId = clickedCard.id; const currentDescription = clickedCard.dataset.description || ''; setModalToViewMode(currentDescription); modal.classList.add('visible'); modalOverlay.classList.add('visible'); } }); }
    if (editDescriptionBtn) editDescriptionBtn.addEventListener('click', setModalToEditMode);
    if (saveDescriptionBtn) { saveDescriptionBtn.addEventListener('click', () => { if (currentCardId) { const cardToUpdate = document.getElementById(currentCardId); if (cardToUpdate && descriptionInput) { const newDescription = descriptionInput.value.trim(); cardToUpdate.dataset.description = newDescription; console.log(`Beschreibung für ${currentCardId} gespeichert.`); } } closeDescriptionModal(); }); }
    if (descModalCloseBtn) descModalCloseBtn.addEventListener('click', closeDescriptionModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeDescriptionModal);


    // ====================================================================
    // == Hilfe-Modal Funktionalität                                     ==
    // ====================================================================
    function closeHelpModal() { if (!helpModal || !helpModalOverlay) return; helpModal.classList.remove('visible'); helpModalOverlay.classList.remove('visible'); }
    if (helpBtn) { helpBtn.addEventListener('click', () => { closeDescriptionModal(); closeSettingsModal(); if (helpModal && helpModalOverlay) { helpModal.classList.add('visible'); helpModalOverlay.classList.add('visible'); } else { console.error("Hilfe-Modal Elemente fehlen."); } }); }
    if (helpModalCloseBtn) helpModalCloseBtn.addEventListener('click', closeHelpModal);
    if (helpModalOverlay) helpModalOverlay.addEventListener('click', closeHelpModal);


    // ====================================================================
    // == Einstellungs-Modal & Theme/Farb-Logik                          ==
    // ====================================================================
    function closeSettingsModal() { if (!settingsModal || !settingsModalOverlay) return; settingsModal.classList.remove('visible'); settingsModalOverlay.classList.remove('visible'); }
    function applySavedTheme() { const savedTheme = localStorage.getItem('kanbanTheme') || 'light'; if (savedTheme === 'dark') { document.body.classList.add('dark-mode'); if(themeDarkRadio) themeDarkRadio.checked = true; } else { document.body.classList.remove('dark-mode'); if(themeLightRadio) themeLightRadio.checked = true; } console.log(`Theme angewendet: ${savedTheme}`); }
    function applySavedColor() { if (!colorPicker) return; const savedColor = localStorage.getItem('kanbanAccentColor'); const defaultColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(); const colorToApply = savedColor || defaultColor; document.documentElement.style.setProperty('--accent-color', colorToApply); colorPicker.value = colorToApply; }
    if (settingsBtn) { settingsBtn.addEventListener('click', () => { closeDescriptionModal(); closeHelpModal(); if (settingsModal && settingsModalOverlay) { applySavedTheme(); applySavedColor(); /* Farben/Theme aktualisieren vor Anzeige */ settingsModal.classList.add('visible'); settingsModalOverlay.classList.add('visible'); } else { console.error("Einstellungs-Modal Elemente fehlen."); } }); }
    if (settingsModalCloseBtn) settingsModalCloseBtn.addEventListener('click', closeSettingsModal);
    if (settingsModalOverlay) settingsModalOverlay.addEventListener('click', closeSettingsModal);
    function handleThemeChange(event) { const selectedTheme = event.target.value; if (selectedTheme === 'dark') { document.body.classList.add('dark-mode'); } else { document.body.classList.remove('dark-mode'); } localStorage.setItem('kanbanTheme', selectedTheme); console.log(`Theme geändert zu: ${selectedTheme}`); }
    if (themeLightRadio) themeLightRadio.addEventListener('change', handleThemeChange);
    if (themeDarkRadio) themeDarkRadio.addEventListener('change', handleThemeChange);
    if (colorPicker) { colorPicker.addEventListener('input', (event) => { const newColor = event.target.value; document.documentElement.style.setProperty('--accent-color', newColor); localStorage.setItem('kanbanAccentColor', newColor); }); }
    applySavedTheme(); applySavedColor(); // Beim Start ausführen


    // ====================================================================
    // == Globaler Escape-Key Listener (Schließt oberstes Modal/Panel)  ==
    // ====================================================================
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (settingsModal?.classList.contains('visible')) { closeSettingsModal(); }
            else if (helpModal?.classList.contains('visible')) { closeHelpModal(); }
            else if (modal?.classList.contains('visible') && document.activeElement !== descriptionInput) { closeDescriptionModal(); }
        }
    });

    console.log("Kanban Board Script V6 (mit Modal-Transitions) geladen.");

}); // Ende DOMContentLoaded