require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

const polyclinics = [
  { name: "Poli Umum", diseaseCategory: "General", description: "Layanan medis umum" },
  { name: "Poli Gigi", diseaseCategory: "Dental", description: "Kesehatan gigi dan mulut" },
  { name: "Poli KIA", diseaseCategory: "Maternal and Child", description: "Kesehatan ibu dan anak" },
  { name: "Poli Kandungan", diseaseCategory: "Obstetrics", description: "Kebidanan dan kandungan" },
  { name: "Poli Anak", diseaseCategory: "Pediatrics", description: "Kesehatan anak" },
  { name: "Poli Penyakit Dalam", diseaseCategory: "Internal Medicine", description: "Penyakit dalam" },
  { name: "Poli Bedah", diseaseCategory: "Surgery", description: "Layanan bedah umum" },
  { name: "Poli Mata", diseaseCategory: "Ophthalmology", description: "Kesehatan mata" },
  { name: "Poli THT", diseaseCategory: "ENT", description: "Telinga, Hidung, Tenggorokan" },
  { name: "Poli Saraf", diseaseCategory: "Neurology", description: "Penyakit saraf" },
  { name: "Poli Jantung", diseaseCategory: "Cardiology", description: "Kesehatan jantung" },
  { name: "Poli Paru", diseaseCategory: "Pulmonology", description: "Kesehatan paru-paru" },
  { name: "Poli Kulit & Kelamin", diseaseCategory: "Dermatology", description: "Penyakit kulit dan kelamin" },
  { name: "Poli Jiwa", diseaseCategory: "Psychiatry", description: "Kesehatan jiwa" },
  { name: "Poli Orthopedi", diseaseCategory: "Orthopedics", description: "Bedah tulang" },
  { name: "Poli Gizi", diseaseCategory: "Nutrition", description: "Konsultasi gizi" }
].map(p => ({ 
  ...p, 
  doctors: [
    { id: `doc-${p.diseaseCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-1`, name: `Dr. ${p.name.replace('Poli ', '')} Ahli 1` },
    { id: `doc-${p.diseaseCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-2`, name: `Dr. ${p.name.replace('Poli ', '')} Ahli 2` },
    { id: `doc-${p.diseaseCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-3`, name: `Dr. ${p.name.replace('Poli ', '')} Ahli 3` }
  ],
  createdAt: new Date(), 
  updatedAt: new Date() 
}));

async function seed() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/goklinik";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("goklinik");
    const coll = db.collection("polyclinics");
    // Clear existing
    await coll.deleteMany({});
    // Insert new
    await coll.insertMany(polyclinics);
    console.log("Seeded 16 Polyclinics!");
  } finally {
    await client.close();
  }
}

seed().catch(console.error);
