# Schütz Digital – Website

Statische Onepage-Website (HTML/CSS/JS, ohne Build-Schritt, ohne Libraries) im Framer-Stil für
**Schütz Digital – Foto, Video, Web & IT**. Typografie nach dem Logo (fette, enge Grotesk: Inter Tight),
Hintergrund #f2f2f2. Leistungen: Fotografie, Videoproduktion, Websites, IT-Beratung, PC & Netzwerke.

Animationen (alle in `script.js`, eine requestAnimationFrame-Schleife, nur transform/opacity):
Wort-für-Wort-Blur-Reveal der Überschriften, Bento-Kacheln im Hero (Sucher mit Fokus, REC-Timecode, Browser, Netzwerk mit Datenpaketen), Arbeiten-Filter, gestaffelte Einblendungen, Hero-Visual skaliert beim Scrollen,
Parallax in Projektbildern, Sticky-Stacking-Cards (Ablauf), Text-Fill beim Scrollen (Über mich),
Marquee mit Scroll-Geschwindigkeit, Magnet-Buttons mit Text-Roll, Cursor-Bubble über Projekten,
Nav blendet beim Runterscrollen aus, Vollbild-Menü auf Mobile, weiches FAQ-Akkordeon.
`prefers-reduced-motion` schaltet alle Bewegungen ab.

```
npx serve .   # oder index.html direkt im Browser öffnen
```

**Offen:** Alle Texte mit `data-placeholder` sind Platzhalter und müssen durch die Inhalte
von schuetz-digital.de ersetzt werden (Hero, Leistungen, Projekte, Über mich, Kundenstimmen,
FAQ, Kontakt-E-Mail, Impressum/Datenschutz-Links).
