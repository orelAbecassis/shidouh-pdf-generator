const fs = require("fs");
const path = require("path");
const pdf = require("html-pdf");

/**
 * Construit le HTML à partir du template et des données Notion
 */
function generateHtmlFromTemplate(page) {
  const props = page.properties;

  // Récupération des propriétés (en faisant attention aux espaces et types)
  const nom = props["Nom"]?.title?.[0]?.plain_text || "N/A";
  const telephone = props["Téléphone "]?.phone_number || "N/A";
  const ville = props["Ville d'habitation"]?.rich_text?.[0]?.plain_text || "N/A";
  const age = props["Age "]?.rich_text?.[0]?.plain_text || "N/A";
  const religFam = props["Niveau de religion de ma famille "]?.rich_text?.[0]?.plain_text || "N/A";
  const faireAlya = props["Faire L’Alya"]?.multi_select?.map(opt => opt.name).join(", ") || "N/A";
  const religPerso = props["Niveau de religion "]?.rich_text?.[0]?.plain_text || "N/A";

  // Pour la photo (champ "Ma photo"), on récupère l'URL du premier fichier s'il existe
  let photo = "N/A";
  if (props["Ma photo"]?.files?.length) {
    const fileObj = props["Ma photo"].files[0];
    // Selon si c'est un file ou un external
    photo = fileObj.file?.url || fileObj.external?.url || "N/A";
  }

  const parcours = props["Parcours"]?.rich_text?.[0]?.plain_text || "N/A";
  const genre = props["Genre"]?.select?.name || "N/A";
  const communaute = props["Communauté Fréquenté"]?.rich_text?.[0]?.plain_text || "N/A";
  const taille = props["Taille"]?.rich_text?.[0]?.plain_text || "N/A";
  const qualitesRech = props["Qualités recherchés"]?.rich_text?.[0]?.plain_text || "N/A";
  const profession = props["Profession"]?.rich_text?.[0]?.plain_text || "N/A";
  const monStatus = props["Mon Status"]?.multi_select?.map(opt => opt.name).join(", ") || "N/A";
  const contact = props["Numéro à contacter"]?.rich_text?.[0]?.plain_text || "N/A";
  const description = props["Description "]?.rich_text?.[0]?.plain_text || "N/A";

  // Charger le template HTML
  const templatePath = path.join(__dirname, "templates", "pdfTemplate.html");
  let html = fs.readFileSync(templatePath, "utf-8");

  // Remplacer les placeholders {{...}} par les valeurs récupérées
  html = html
    .replace(/{{nom}}/g, nom)
    .replace(/{{telephone}}/g, telephone)
    .replace(/{{ville}}/g, ville)
    .replace(/{{age}}/g, age)
    .replace(/{{religFam}}/g, religFam)
    .replace(/{{faireAlya}}/g, faireAlya)
    .replace(/{{religPerso}}/g, religPerso)
    .replace(/{{photo}}/g, photo)
    .replace(/{{parcours}}/g, parcours)
    .replace(/{{genre}}/g, genre)
    .replace(/{{communaute}}/g, communaute)
    .replace(/{{taille}}/g, taille)
    .replace(/{{qualitesRech}}/g, qualitesRech)
    .replace(/{{profession}}/g, profession)
    .replace(/{{monStatus}}/g, monStatus)
    .replace(/{{contact}}/g, contact)
    .replace(/{{description}}/g, description);

  return html;
}

/**
 * Génére le PDF en buffer depuis la page Notion
 * avec un footer répété sur chaque page (pagination, etc.).
 */
async function generatePdfFromEntry(page) {
  const htmlContent = generateHtmlFromTemplate(page);

  // Options pour wkhtmltopdf (via html-pdf)
  // Ici, on ajoute un footer qui se répète sur chaque page avec Page [page]/[topage].
  const options = {
    format: 'A4',
    border: {
      top: "1cm",
      right: "1cm",
      bottom: "1cm",
      left: "1cm"
    },
    // Amélioration du rendu
    quality: "100",
    printBackground: true, // Important pour les couleurs de fond
    preferCSSPageSize: true,
  };

  return new Promise((resolve, reject) => {
    pdf.create(htmlContent, options).toBuffer((err, buffer) => {
      if (err) return reject(err);
      resolve(buffer);
    });
  });
}

module.exports = { generatePdfFromEntry };


