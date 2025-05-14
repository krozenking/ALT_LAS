import os
import json
import re
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

# Configuration
MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
EMBEDDING_DIM = 384  # Dimension of embeddings for paraphrase-multilingual-MiniLM-L12-v2
FAISS_INDEX_PATH = "/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/AI_Yardimcilari/Dokuman_Embeddings/embeddings.index"
METADATA_PATH = "/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/AI_Yardimcilari/Dokuman_Embeddings/metadata.json"

TARGET_DOCUMENTS = [
    "/home/ubuntu/ALT_LAS_Organized/Planlama_Ofisi/ana_gorev_panosu.md",
    "/home/ubuntu/ALT_LAS_Organized/Planlama_Ofisi/hierarchical_task_structure_definition.md",
    "/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Genel_Belgeler/YONETICI_OFISI_KULLANIM_KILAVUZU.md",
    "/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Genel_Belgeler/standart_gorev_atama_sablonu.md",
    "/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/ofis_durumu.md",
    "/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/Yazilim_Mimari_Elif_Yilmaz_Ofisi/Calisma_Dosyalari/architect_detailed_cuda_tasks.md",
    "/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/Kidemli_Backend_Gelistirici_Ahmet_Celik_Ofisi/Calisma_Dosyalari/backend_developer_detailed_cuda_tasks.md",
    "/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/DevOps_Muhendisi_Can_Tekin_Ofisi/Calisma_Dosyalari/devops_engineer_detailed_cuda_tasks.md",
    "/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/Kidemli_Frontend_Gelistirici_Zeynep_Aydin_Ofisi/Calisma_Dosyalari/frontend_developer_detailed_cuda_tasks.md",
    "/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/QA_Muhendisi_Ayse_Kaya_Ofisi/Calisma_Dosyalari/qa_engineer_detailed_cuda_tasks.md",
    "/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/UI_UX_Tasarimcisi_Elif_Aydin_Ofisi/Calisma_Dosyalari/ui_ux_designer_detailed_cuda_tasks.md",
    "/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/Veri_Bilimcisi_Dr_Elif_Demir_Ofisi/Calisma_Dosyalari/data_scientist_detailed_cuda_tasks.md",
    "/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/Proje_Yoneticisi_Ofisi/Calisma_Dosyalari/project_manager_detailed_cuda_tasks.md",
    "/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Genel_Belgeler/license_analysis_summary.md",
    "/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Genel_Belgeler/license_recommendations_and_alternatives.md",
    "/home/ubuntu/ALT_LAS_Organized/Planlama_Ofisi/embedding_workflow_design.md" # Added the design doc itself for completeness
]

def chunk_markdown_by_paragraph(markdown_content):
    """Splits markdown content into paragraphs. Considers multiple newlines as a separator."""
    # Normalize newlines and split by one or more empty lines (effectively, two or more newlines)
    paragraphs = re.split(r'\n\s*\n+', markdown_content.strip())
    # Filter out any empty strings that might result from splitting
    return [p.strip() for p in paragraphs if p.strip()]

def main():
    print(f"Loading sentence transformer model: {MODEL_NAME}")
    model = SentenceTransformer(MODEL_NAME)
    print("Model loaded.")

    all_embeddings = []
    all_metadata = []
    doc_id_counter = 0

    for doc_path in TARGET_DOCUMENTS:
        if not os.path.exists(doc_path):
            print(f"Warning: Document not found at {doc_path}, skipping.")
            continue
        
        print(f"Processing document: {doc_path}")
        try:
            with open(doc_path, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading file {doc_path}: {e}")
            continue

        chunks = chunk_markdown_by_paragraph(content)
        if not chunks:
            print(f"No text chunks found in {doc_path}, skipping.")
            continue

        print(f"Generating embeddings for {len(chunks)} chunks from {doc_path}...")
        chunk_embeddings = model.encode(chunks, show_progress_bar=False) # Can set to True for long docs

        for i, chunk_text in enumerate(chunks):
            all_embeddings.append(chunk_embeddings[i])
            all_metadata.append({
                "doc_id": f"doc_{doc_id_counter}_{os.path.basename(doc_path)}_{i}",
                "source_file": doc_path,
                "chunk_index": i,
                "text": chunk_text
            })
        doc_id_counter += 1
        print(f"Finished processing {doc_path}")

    if not all_embeddings:
        print("No embeddings were generated. Exiting.")
        return

    embeddings_np = np.array(all_embeddings).astype("float32")
    
    print(f"Total embeddings generated: {embeddings_np.shape[0]}")
    print(f"Embedding dimension: {embeddings_np.shape[1]}")

    # Building FAISS index
    print("Building FAISS index...")
    index = faiss.IndexFlatL2(EMBEDDING_DIM)  # Using L2 distance
    index.add(embeddings_np)
    print(f"FAISS index built. Total vectors in index: {index.ntotal}")

    # Saving FAISS index and metadata
    print(f"Saving FAISS index to {FAISS_INDEX_PATH}")
    faiss.write_index(index, FAISS_INDEX_PATH)

    print(f"Saving metadata to {METADATA_PATH}")
    with open(METADATA_PATH, "w", encoding="utf-8") as f_meta:
        json.dump(all_metadata, f_meta, ensure_ascii=False, indent=4)

    print("Embedding generation and indexing complete.")

if __name__ == "__main__":
    main()

