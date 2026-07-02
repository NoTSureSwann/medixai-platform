import { MongoClient, ServerApiVersion } from "mongodb";

import dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Missing MONGODB_URI in .env.local");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});



const knowledgeDocuments = [
  {
    title: "SOP Triage Demam",
    content: "Pasien dengan keluhan demam lebih dari 3 hari, suhu di atas 38 derajat celcius, dan disertai bintik merah harus segera diarahkan ke IGD atau Poli Umum prioritas tinggi. Lakukan tes darah lengkap (Dengue test) jika demam sudah hari ke-3 atau ke-4.",
    tags: ["triage", "demam", "igd", "umum"]
  },
  {
    title: "SOP Pendaftaran Pasien Baru",
    content: "Untuk pasien baru, pastikan staf pendaftaran meminta KTP dan BPJS (jika ada). Pasien baru harus mengisi form rekam medis awal. Jika mendaftar online, pasien dapat langsung menuju poli tujuan setelah melakukan konfirmasi kedatangan di mesin anjungan.",
    tags: ["pendaftaran", "operasional"]
  },
  {
    title: "Jam Operasional Farmasi",
    content: "Farmasi beroperasi 24 jam untuk melayani IGD. Namun, untuk pengambilan obat resep poli rawat jalan, layanan dibuka dari jam 08:00 hingga 20:00. Resep dari dokter di luar jam operasional rawat jalan akan diarahkan ke apotek IGD.",
    tags: ["farmasi", "jam operasional", "apotek"]
  },
  {
    title: "Alur Konsultasi Spesialis Jantung",
    content: "Konsultasi ke Poli Spesialis Jantung harus melalui rujukan dari Dokter Umum klinik, kecuali pasien sudah pernah berobat dalam waktu 3 bulan terakhir. Jadwal Poli Jantung adalah Senin, Rabu, Jumat pukul 14:00 - 17:00.",
    tags: ["spesialis", "jantung", "rujukan", "jadwal"]
  }
];

async function generateEmbedding(text: string): Promise<number[]> {
  const length = text.length;
  return new Array(768).fill(0).map((_, i) => (Math.sin(length + i) + 1) / 2);
}

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB.");
    
    const db = client.db(); // uses default DB from URI
    const collection = db.collection("knowledge_base");

    // Optional: Clear existing seed
    // await collection.deleteMany({});
    
    console.log("Generating embeddings and inserting knowledge documents...");
    
    for (const doc of knowledgeDocuments) {
      console.log(`Processing: ${doc.title}`);
      const textToEmbed = `Title: ${doc.title}\nContent: ${doc.content}`;
      const vector = await generateEmbedding(textToEmbed);
      
      await collection.insertOne({
        content: textToEmbed,
        embedding: vector,
        metadata: {
          title: doc.title,
          tags: doc.tags
        },
        createdAt: new Date(),
      });
    }

    console.log("Seeding completed successfully!");
    
    console.log(`
      IMPORTANT:
      To enable RAG search, please ensure you have created an Atlas Vector Search Index on the 'knowledge_base' collection.
      Name: vector_index
      Definition:
      {
        "fields": [
          {
            "numDimensions": 768,
            "path": "embedding",
            "similarity": "cosine",
            "type": "vector"
          }
        ]
      }
    `);
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await client.close();
  }
}

run();
