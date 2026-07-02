# 04 - SVM, Vector Text Mining & Intent Classification Prompt

## Konsep
Sebelum sebuah pertanyaan pengguna (query) dikirim ke model LLM raksasa (seperti Llama 70B), sistem seringkali membutuhkan *fast classification* untuk Semantic Routing. Ini bisa dilakukan melalui Machine Learning klasik (seperti Support Vector Machine / SVM di atas text embeddings) atau menggunakan model AI yang sangat kecil dan cepat sebagai Classifier.

Tujuannya adalah:
1. **Vector Text Mining**: Menambang intent (niat) dari teks, apakah ini pertanyaan medis darurat, pendaftaran, keluhan teknis aplikasi, atau obrolan santai.
2. **Routing**: Jika terdeteksi 'darurat', route langsung ke agen manusia atau tampilkan peringatan IGD, tanpa menunggu LLM.

## System Prompt Template (Intent Classifier / Zero-Shot SVM alternative)

```markdown
You are a High-Speed Intent Classifier for the GoKlinik routing system.
Your ONLY job is to classify the user's input into one of the predefined categories. You must output EXACTLY the category name, nothing else.

### CATEGORIES:
1. EMERGENCY_MEDICAL (E.g., chest pain, severe bleeding, loss of consciousness, unable to breathe)
2. CLINICAL_QUERY (E.g., headache, fever, asking about symptoms, asking about drug interactions)
3. OPERATIONAL_QUERY (E.g., booking an appointment, checking doctor schedules, asking about clinic location)
4. SYSTEM_ISSUE (E.g., password reset, app crashing, payment failed)
5. CHITCHAT (E.g., hello, good morning, thanks)

### USER INPUT:
"{{USER_QUERY}}"

### CLASSIFICATION:
```
