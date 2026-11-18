#  Galerie d'Art Numérique — Art Institute of Chicago

Projet réalisé en binôme dans le cadre de la formation **Concepteur Développeur d'Applications (CDA)**.

##  Équipe & Répartition du Binôme

- **MESTIRI Intissar** : Intégration de l'API REST (`api.js`), gestion des requêtes HTTP asynchrones (`fetch`), construction des URLs d'images IIIF et configuration Git.
- **BEN TMELIST Moataza** : Conception de l'interface galerie (`index.html`, `style.css`), grille responsive, gestion des événements DOM (`app.js`) et fenêtre modale détaillée.

##  Présentation du Projet

Cette application Web permet d'explorer gratuitement les collections publiques de l'**Art Institute of Chicago** :
- **Recherche dynamique** par artiste (*Van Gogh*, *Claude Monet*...) ou par thème (*Impressionnisme*, *Japon*, *Sculpture*).
- **Affichage en galerie responsive** avec image, titre, artiste et époque.
- **Détail complet au clic** via une fenêtre modale (image haute définition, origine, technique, dimensions et notice historique).

##  Documentation de l'API Utilisée

- **API :** Art Institute of Chicago API (Open Access — 100 % gratuite et sans clé API).
- **Endpoint de recherche :**
  `https://api.artic.edu/api/v1/artworks/search?q={terme}&limit=16&fields=id,title,artist_display,date_display,image_id,medium_display`
- **Endpoint de détail d'une œuvre :**
  `https://api.artic.edu/api/v1/artworks/{id}`
- **Serveur d'images IIIF :**
  `https://www.artic.edu/iiif/2/{image_id}/full/600,/0/default.jpg`

##  Lancement dans Antigravity IDE

>  **Important :** Comme le projet utilise les modules ES6 (`import` / `export`), il doit être ouvert via un serveur local (et non en double-cliquant sur le fichier HTML).

1. Ouvrir le dossier `galerie-art` dans **Antigravity IDE**.
2. Faire un clic droit sur `index.html` puis sélectionner **Open with Live Server** (ou lancer `npx serve` dans le terminal intégré).