# GoKlinik Fine-Tuning Training Data

This folder is designated for preparing your Medical AI training datasets. The standard format for fine-tuning modern LLMs (like Llama, GPT, or PaLM/Gemini) is `.jsonl` (JSON Lines).

## File Format Requirements
A `.jsonl` file must contain exactly one valid JSON object per line. Do not add commas at the end of the line, and do not wrap the objects in a JSON array.

### Example Schema (Conversational / Chat Format)
Most modern chat models use a conversational format:

```jsonl
{"messages": [{"role": "system", "content": "You are GoKlinik Parameter 1, a medical assistant."}, {"role": "user", "content": "Pasien mengeluh demam dan bintik merah."}, {"role": "assistant", "content": "Berdasarkan gejala, ini indikasi Demam Berdarah Dengue (DBD). Lakukan cek darah rutin."}]}
{"messages": [{"role": "system", "content": "You are GoKlinik Parameter 2, a hospital assistant."}, {"role": "user", "content": "Berapa antrian poli penyakit dalam?"}, {"role": "assistant", "content": "Saat ini terdapat 12 antrian aktif di Poli Penyakit Dalam dengan estimasi tunggu 45 menit."}]}
```

## How to Use
1. Add your medical protocols, SOPs, and historical data into `.jsonl` files in this folder.
2. Use Python scripts or Node.js to upload these files to your AI provider (e.g., OpenAI API, Google Vertex AI) for fine-tuning.
3. Once fine-tuned, update your `src/infrastructure/ai-gateway/LLMClient.ts` to point to the newly fine-tuned model ID.
