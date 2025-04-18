// Warte, bis das gesamte HTML geladen ist
document.addEventListener('DOMContentLoaded', () => {

    // --- Code für die Bild-Galerie (Overlay beim Klick) ---
    // Finde alle Links innerhalb ALLER Bilder-Grids
    const galleryLinks = document.querySelectorAll('.image-grid a'); // Gilt für alle Grids mit dieser Struktur

    // Gehe jeden Link durch
    galleryLinks.forEach(link => {
        // Füge einen Event Listener für Klicks hinzu
        link.addEventListener('click', (event) => {
            // Verhindere, dass der Link normal geöffnet wird (wichtig bei # oder tatsächlichen Links)
            event.preventDefault();

            // Hole die URL des großen Bildes aus dem href des Links
            const imageUrl = link.href;

            // Erstelle das Overlay-Div
            const overlay = document.createElement('div');
            overlay.id = 'image-overlay'; // ID für CSS-Styling

            // Erstelle das img-Element für das große Bild
            const image = document.createElement('img');
            image.src = imageUrl;
            image.alt = 'Großansicht Bild'; // Alternativtext hinzufügen

            // Füge das Bild zum Overlay hinzu
            overlay.appendChild(image);

            // Füge das Overlay zum Body der Seite hinzu
            document.body.appendChild(overlay);

            // Füge einen Event Listener zum Overlay hinzu, um es beim Klick zu schließen
            // Klick auf den Hintergrund schließt das Overlay
            overlay.addEventListener('click', () => {
                overlay.remove(); // Entfernt das Overlay vom Body
            });

             // Verhindere, dass ein Klick auf das Bild selbst das Overlay schließt
             // (damit man nicht versehentlich schließt, wenn man z.B. das Bild verschieben will)
             image.addEventListener('click', (e) => {
                e.stopPropagation(); // Verhindert, dass der Klick zum Overlay "durchgereicht" wird
            });

            // Optional: Schließen des Overlays mit der Escape-Taste
            const closeOnEscape = (e) => {
                if (e.key === 'Escape') {
                    overlay.remove();
                    // Event Listener wieder entfernen, wenn das Overlay weg ist
                    document.removeEventListener('keydown', closeOnEscape);
                }
            };
            document.addEventListener('keydown', closeOnEscape);

             // Sicherstellen, dass der Keydown-Listener entfernt wird, wenn per Klick geschlossen wird
             overlay.addEventListener('click', () => {
                 document.removeEventListener('keydown', closeOnEscape);
                 // overlay.remove(); // wird schon vom Klick-Listener oben erledigt
             });


        });
    });
    // --- Ende Code für die Bild-Galerie ---


    // ===== Code für Smooth Scroll auf "Nach oben"-Button =====
    // Finde den Button
    const scrollToTopButton = document.querySelector('.scroll-to-top');

    // Prüfen, ob der Button auf der aktuellen Seite existiert
    if (scrollToTopButton) {
        // Event Listener für Klick auf den Button hinzufügen
        scrollToTopButton.addEventListener('click', (event) => {
            // Standard-Linkverhalten (Sprung nach #) verhindern
            event.preventDefault();

            // Sanft nach oben scrollen
            window.scrollTo({
                top: 0, // Zielposition: Ganz oben auf der Seite
                behavior: 'smooth' // Animation aktivieren ('smooth') oder 'auto' für sofortigen Sprung
            });
        });

        // Optional: Button nur anzeigen, wenn man etwas nach unten gescrollt hat
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { // Nach 300px Scrollen anzeigen
                scrollToTopButton.style.opacity = '1';
                scrollToTopButton.style.visibility = 'visible';
            } else {
                scrollToTopButton.style.opacity = '0';
                scrollToTopButton.style.visibility = 'hidden';
            }
        });

        // Initialen Status setzen (versteckt, falls ganz oben)
         if (window.scrollY <= 300) {
             scrollToTopButton.style.opacity = '0';
             scrollToTopButton.style.visibility = 'hidden';
         }

         // CSS für die Opacity/Visibility Transition hinzufügen (in style.css):
         /*
         .scroll-to-top {
             // ... (bestehende Stile)
             opacity: 0;
             visibility: hidden;
             transition: opacity 0.3s ease, visibility 0.3s ease;
         }
         .scroll-to-top:hover {
            // ... (bestehende Stile)
         }
         */


    }
    // ===== ENDE: Code für Smooth Scroll =====

});