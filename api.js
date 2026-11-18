const BASE_URL = 'https://api.artic.edu/api/v1';

/**
 * Recherche des œuvres d'art par artiste, thème ou mot-clé
 */
export async function rechercherOeuvres(motCle) {
    const champs = 'id,title,artist_display,date_display,image_id,medium_display';
    const url = `${BASE_URL}/artworks/search?q=${encodeURIComponent(motCle)}&limit=16&fields=${champs}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status} lors de la recherche.`);
    }

    const json = await response.json();
    const iiifBaseUrl = json.config?.iiif_url || 'https://www.artic.edu/iiif/2';

    // On filtre les œuvres qui possèdent bien une image
    return (json.data || [])
        .filter((oeuvre) => oeuvre.image_id)
        .map((oeuvre) => ({
            id: oeuvre.id,
            titre: oeuvre.title || 'Sans titre',
            artiste: oeuvre.artist_display || 'Artiste inconnu',
            epoque: oeuvre.date_display || 'Date inconnue',
            technique: oeuvre.medium_display || 'Technique non précisée',
            imageUrl: `${iiifBaseUrl}/${oeuvre.image_id}/full/600,/0/default.jpg`
        }));
}

/**
 * Récupère les détails complets d'une œuvre précise au clic
 */
export async function getDetailOeuvre(id) {
    const url = `${BASE_URL}/artworks/${id}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Impossible de charger les détails de l'œuvre #${id}.`);
    }

    const json = await response.json();
    const item = json.data;
    const iiifBaseUrl = json.config?.iiif_url || 'https://www.artic.edu/iiif/2';

    // Nettoyage des éventuelles balises HTML dans la description
    const descriptionBrute = item.description || item.thumbnail?.alt_text || 'Aucune description historique disponible pour cette œuvre.';
    const descriptionPropre = descriptionBrute.replace(/<[^>]*>?/gm, '');

    return {
        id: item.id,
        titre: item.title || 'Sans titre',
        artiste: item.artist_display || 'Artiste inconnu',
        epoque: item.date_display || 'Époque non renseignée',
        origine: item.place_of_origin || 'Origine non renseignée',
        technique: item.medium_display || 'Non précisée',
        dimensions: item.dimensions || 'Dimensions non communiquées',
        departement: item.department_title || 'Collection générale',
        description: descriptionPropre,
        imageHdUrl: item.image_id
            ? `${iiifBaseUrl}/${item.image_id}/full/843,/0/default.jpg`
            : ''
    };
}