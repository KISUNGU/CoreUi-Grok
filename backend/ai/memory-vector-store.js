const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { Document } = require('@langchain/core/documents');
require('dotenv').config();

const UPLOADS_FOLDER = path.join(__dirname, '../uploads');

let memoryStore = null;

async function getDocumentsFromPDFs(folder) {
  const files = fs.readdirSync(folder);
  const docs = [];

  for (const file of files) {
    if (!file.toLowerCase().endsWith('.pdf')) continue;

    const filePath = path.join(folder, file);
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    docs.push(
      new Document({
        pageContent: pdfData.text,
        metadata: { source: file },
      })
    );
  }

  return docs;
}

async function buildMemoryStore() {
  const docs = await getDocumentsFromPDFs(UPLOADS_FOLDER);
  memoryStore = await MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings());
  console.log(`✅ ${docs.length} documents indexés en mémoire.`);
}

async function queryMemoryStore(query) {
  if (!memoryStore) {
    await buildMemoryStore();
  }
  const results = await memoryStore.similaritySearch(query, 3);
  return results.map((doc) => `Source: ${doc.metadata.source}\n${doc.pageContent}`).join('\n---\n');
}

module.exports = {
  queryMemoryStore,
  buildMemoryStore, // <--- ajoute ceci
}

