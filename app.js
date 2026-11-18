const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const galerieHeading = document.getElementById('galerie-heading');
const galerieGrid = document.getElementById('galerie-grid');
const statusMessage = document.getElementById('status-message');
const modalDetail = document.getElementById('modal-detail');
const modalContent = document.getElementById('modal-content');
const closeModalBtn = document.getElementById('close-modal');
const tagButtons = document.querySelectorAll('.tag-btn');

let oeuvresActuelles = [];

// --- 1. APPEL API WIKIMEDIA COMMONS (100% compatible CORS, gratuit, sans clé API) ---
async function rechercherOeuvres(motCle) {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=filetype:bitmap+${encodeURIComponent(motCle + ' painting')}&gsrnamespace=6&gsrlimit=16&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=600&format=json&origin=*`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
    }

    const data = await response.json();
    const pages = Object.values(data.query?.pages || {});

    return pages
        .filter((p) => p.imageinfo && p.imageinfo[0]?.thumburl)
        .map((p) => {
            const info = p.imageinfo[0];
            const meta = info.extmetadata || {};

            // Nettoyage des balises HTML renvoyées par Wikimedia
            const nettoyer = (html) => (html ? html.replace(/<[^>]*>?/gm, '').trim() : '');

            const titrePropre = nettoyer(meta.ObjectName?.value) || p.title.replace('File:', '').replace(/\.[^/.]+$/, '');
            const artiste = nettoyer(meta.Artist?.value) || 'Artiste référencé Wikimedia';
            const epoque = nettoyer(meta.DateTimeOriginal?.value) || 'Époque historique';
            const description = nettoyer(meta.ImageDescription?.value) || 'Œuvre issue des collections publiques Wikimedia Commons.';
            const technique = nettoyer(meta.Medium?.value) || 'Peinture / Beaux-Arts';

            return {
                id: p.pageid,
                titre: titrePropre.slice(0, 80),
                artiste: artiste.slice(0, 70),
                epoque: epoque.slice(0, 40),
                origine: 'Collections Musées & Wikimedia Commons',
                technique,
                dimensions: `${info.width} × ${info.height} px (Numérisation HD)`,
                departement: 'Beaux-Arts & Patrimoine Mondial',
                description,
                imageUrl: info.thumburl,
                imageHdUrl: info.url || info.thumburl,
                lienMusee: info.descriptionurl
            };
        });
}

// --- 2. ÉVÉNEMENTS ---
document.addEventListener('DOMContentLoaded', () => {
    chargerGalerie('Impressionism', 'Impressionnisme');
});

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const terme = searchInput.value.trim();
    if (!terme) return;

    tagButtons.forEach((btn) => btn.classList.remove('active'));
    chargerGalerie(terme, terme);
});

tagButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        tagButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const query = btn.dataset.query;
        const label = btn.dataset.label || btn.textContent;
        searchInput.value = label;
        chargerGalerie(query, label);
    });
});

// --- 3. AFFICHAGE DE LA GALERIE ---
async function chargerGalerie(termeApi, titreAffiche) {
    galerieHeading.textContent = `🎨 Collection : ${titreAffiche}`;
    statusMessage.textContent = `⏳ Chargement des œuvres de "${titreAffiche}"...`;
    galerieGrid.innerHTML = '';

    try {
        oeuvresActuelles = await rechercherOeuvres(termeApi);

        if (oeuvresActuelles.length === 0) {
            statusMessage.textContent = `Aucune œuvre trouvée pour "${titreAffiche}".`;
            return;
        }

        statusMessage.textContent = `${oeuvresActuelles.length} œuvres affichées — Cliquez sur un tableau pour voir sa fiche complète.`;

        galerieGrid.innerHTML = oeuvresActuelles
            .map(
                (oeuvre) => `
                <article class="art-card" data-id="${oeuvre.id}" tabindex="0">
                    <img src="${oeuvre.imageUrl}" alt="${oeuvre.titre}" loading="lazy">
                    <div class="art-info">
                        <h3 class="art-title">${oeuvre.titre}</h3>
                        <p class="art-artist">${oeuvre.artiste}</p>
                        <p class="art-date">📅 ${oeuvre.epoque}</p>
                    </div>
                </article>
            `
            )
            .join('');

        document.querySelectorAll('.art-card').forEach((card) => {
            card.addEventListener('click', () => ouvrirDetail(Number(card.dataset.id)));
        });
    } catch (error) {
        statusMessage.textContent = `❌ Erreur : ${error.message}`;
    }
}

// --- 4. DÉTAIL AU CLIC (MODALE) ---
function ouvrirDetail(id) {
    const detail = oeuvresActuelles.find((o) => o.id === id);
    if (!detail) return;

    modalDetail.classList.remove('hidden');
    modalContent.innerHTML = `
        <div>
            <img src="${detail.imageHdUrl}" alt="${detail.titre}">
        </div>
        <div class="modal-details">
            <h2>${detail.titre}</h2>
            <p style="color: var(--accent); font-weight: 700; font-size: 1.05rem;">${detail.artiste}</p>

            <div class="detail-meta">
                <p><strong>📅 Époque :</strong> ${detail.epoque}</p>
                <p><strong>🌍 Source :</strong> ${detail.origine}</p>
                <p><strong>🎨 Technique :</strong> ${detail.technique}</p>
                <p><strong>📐 Résolution :</strong> ${detail.dimensions}</p>
            </div>

            <h3 style="margin-bottom: 0.4rem; font-size: 1rem;">À propos de l'œuvre</h3>
            <p class="detail-desc">${detail.description}</p>

            ${detail.lienMusee ? `<a href="${detail.lienMusee}" target="_blank" style="display:inline-block; margin-top:1rem; color:var(--accent); font-weight:700;">🔗 Voir la fiche originale sur Wikimedia Commons →</a>` : ''}
        </div>
    `;
}

closeModalBtn.addEventListener('click', () => modalDetail.classList.add('hidden'));

modalDetail.addEventListener('click', (e) => {
    if (e.target === modalDetail) {
        modalDetail.classList.add('hidden');
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalDetail.classList.contains('hidden')) {
        modalDetail.classList.add('hidden');
    }
});