require("dotenv").config();
const express = require("express");
const { Client } = require("@notionhq/client");
const { generatePdfFromEntry } = require("./pdfGenerator");

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

const app = express();

/**
 * 1) Route pour afficher la liste des entrées
 */
app.get("/list", async (req, res) => {
  try {
    const response = await notion.databases.query({ database_id: databaseId });
    const entries = response.results;

    let html = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Liste des entrées Notion</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 80%; margin: 0 auto; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          a.button {
            display: inline-block;
            padding: 6px 12px;
            margin: 4px 0;
            text-decoration: none;
            color: #fff;
            background-color: #007BFF;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <h1>Profil Shidouhim</h1>
        <table>
          <tr>
            <th>Nom / Prénom</th>
            <th>Action</th>
          </tr>
    `;

    for (const entry of entries) {
        // Utilise exactement la même méthode que dans le template pour récupérer "Nom Prénom"
        const titleText = entry.properties["Nom"]?.title?.[0]?.plain_text || "Sans titre";
        const pageId = entry.id;

      // Lien vers /generate-pdf?entryId=xxx
      html += `
        <tr>
          <td>${titleText}</td>
          <td>
            <a class="button" href="/generate-pdf?entryId=${pageId}" target="_blank">
              Générer PDF
            </a>
          </td>
        </tr>
      `;
    }

    html += `
        </table>
      </body>
    </html>
    `;

    res.send(html);
  } catch (error) {
    console.error("Erreur /list :", error);
    res.status(500).send("Erreur serveur");
  }
});

/**
 * 2) Route pour générer le PDF d'une entrée précise
 */
app.get("/generate-pdf", async (req, res) => {
  try {
    const entryId = req.query.entryId;
    if (!entryId) {
      return res.status(400).send("Paramètre 'entryId' manquant");
    }

    // Récupère la page Notion
    const page = await notion.pages.retrieve({ page_id: entryId });

    // Génère le PDF
    const pdfBuffer = await generatePdfFromEntry(page);

    // Renvoie le PDF
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Erreur /generate-pdf :", error);
    res.status(500).send("Erreur serveur");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}...`);
});
