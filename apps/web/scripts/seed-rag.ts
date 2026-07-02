import { config } from 'dotenv';
import path from 'path';

// Load .env.local BEFORE any module evaluation
config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

async function seed() {
  try {
    const { EmbeddingsClient } = await import('../src/infrastructure/ai-gateway/EmbeddingsClient');
    const { MongoKnowledgeRepository } = await import('../src/infrastructure/database/repositories/MongoKnowledgeRepository');
    const { default: clientPromise } = await import('../src/infrastructure/database/mongodb');

    const embeddingsClient = new EmbeddingsClient();
    const repo = new MongoKnowledgeRepository();

    console.log('Generating embedding for sample document...');
    const content = 'DBD (Demam Berdarah Dengue) adalah penyakit yang disebabkan virus dengue yang ditularkan melalui gigitan nyamuk Aedes aegypti. Gejala utama: demam tinggi mendadak, sakit kepala hebat, nyeri otot dan sendi, mual, muntah, ruam kulit, dan perdarahan ringan.';
    
    const embedding = await embeddingsClient.generateEmbedding(content);
    console.log(`Generated embedding vector with ${embedding.length} dimensions!`);
    
    console.log('Inserting document into MongoDB...');
    await repo.addDocument(content, embedding, {
      title: 'Panduan DBD (Demam Berdarah Dengue)',
      source: 'WHO',
      category: 'penyakit_menular'
    });

    console.log('✅ RAG Seeding complete! Document successfully inserted into "knowledge_base" collection.');
  } catch (error) {
    console.error('❌ Error seeding RAG:', error);
  } finally {
    const { default: clientPromise } = await import('../src/infrastructure/database/mongodb');
    const client = await clientPromise;
    await client.close();
    process.exit(0);
  }
}

seed();
