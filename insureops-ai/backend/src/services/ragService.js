require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '..', '.env') });
const { OpenAIEmbeddings } = require("@langchain/openai");
const { HNSWLib } = require("@langchain/community/vectorstores/hnswlib");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const pdf = require('pdf-parse'); // Direct usage
const path = require('path');
const fs = require('fs');

const VECTOR_STORE_PATH = path.join(__dirname, '..', '..', 'data', 'vector_store');
const DOCS_PATH = path.join(__dirname, '..', '..', 'docs', 'Sample_Insurance_Policy.pdf');

class RAGService {
    constructor() {
        if (!process.env.OPENROUTER_API_KEY) {
            console.error('ERROR: OPENROUTER_API_KEY is missing from environment variables.');
        } else {
            console.log('DEBUG: OPENROUTER_API_KEY loaded (length: ' + process.env.OPENROUTER_API_KEY.length + ')');
            // Force OpenAI client to accept this key
            process.env.OPENAI_API_KEY = process.env.OPENROUTER_API_KEY;
        }

        this.vectorStore = null;
        this.embeddings = new OpenAIEmbeddings({
            modelName: "text-embedding-3-small",
            openAIApiKey: process.env.OPENROUTER_API_KEY,
            configuration: {
                baseURL: 'https://openrouter.ai/api/v1',
                apiKey: process.env.OPENROUTER_API_KEY
            }
        });
    }

    async initialize() {
        if (this.vectorStore) return;

        try {
            if (fs.existsSync(VECTOR_STORE_PATH)) {
                console.log('Loading existing vector store...');
                this.vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, this.embeddings);
            } else {
                console.log('Creating new vector store from policy documents...');
                await this.ingestDocuments();
            }
        } catch (error) {
            console.error('Failed to initialize RAG service:', error);
        }
    }

    async ingestDocuments() {
        if (!fs.existsSync(DOCS_PATH)) {
            console.warn(`Policy document not found at ${DOCS_PATH}. RAG will be empty.`);
            return;
        }

        console.log('Parsing PDF...');
        console.log('Parsing PDF...');
        const dataBuffer = fs.readFileSync(DOCS_PATH);
        const data = await pdf(dataBuffer);
        const text = data.text;

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const splitDocs = await splitter.createDocuments([text]);

        console.log(`Created ${splitDocs.length} chunks. Embedding...`);
        this.vectorStore = await HNSWLib.fromDocuments(splitDocs, this.embeddings);
        await this.vectorStore.save(VECTOR_STORE_PATH);
        console.log('Vector store saved.');
    }

    async query(text, k = 3) {
        if (!this.vectorStore) {
            await this.initialize();
        }
        if (!this.vectorStore) return "RAG Service not initialized.";

        const results = await this.vectorStore.similaritySearch(text, k);

        if (results.length === 0) return "No relevant policy sections found.";

        return results.map(doc => doc.pageContent).join('\n\n---\n\n');
    }

    // Add document manually if needed
    async addDocument(text, metadata = {}) {
        if (!this.vectorStore) await this.initialize();
        await this.vectorStore.addDocuments([{ pageContent: text, metadata }]);
        await this.vectorStore.save(VECTOR_STORE_PATH);
    }
}

const ragService = new RAGService();
module.exports = ragService;
