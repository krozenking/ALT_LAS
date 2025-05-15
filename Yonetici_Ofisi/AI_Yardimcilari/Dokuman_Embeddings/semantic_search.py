import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import re

# Configuration
MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
FAISS_INDEX_PATH = "/Yonetici_Ofisi/AI_Yardimcilari/Dokuman_Embeddings/embeddings.index"
METADATA_PATH = "/Yonetici_Ofisi/AI_Yardimcilari/Dokuman_Embeddings/metadata.json"
TOP_K_RESULTS = 5 # Number of results to return for searches

# Load resources once
print(f"Loading sentence transformer model: {MODEL_NAME}")
model = SentenceTransformer(MODEL_NAME)
print("Model loaded.")

print(f"Loading FAISS index from {FAISS_INDEX_PATH}")
index = faiss.read_index(FAISS_INDEX_PATH)
print(f"FAISS index loaded. Total vectors: {index.ntotal}")

print(f"Loading metadata from {METADATA_PATH}")
with open(METADATA_PATH, "r", encoding="utf-8") as f_meta:
    metadata = json.load(f_meta)
print(f"Metadata loaded. Total entries: {len(metadata)}")

def semantic_search(query_text, k=TOP_K_RESULTS):
    """Performs semantic search for a given query text."""
    if not query_text:
        return []
    
    print(f"Performing semantic search for query: ", query_text)
    query_embedding = model.encode([query_text])
    distances, indices = index.search(query_embedding.astype("float32"), k)
    
    results = []
    for i in range(len(indices[0])):
        idx = indices[0][i]
        dist = distances[0][i]
        if idx < len(metadata):
            results.append({
                "score": 1 - dist,  # Convert L2 distance to a similarity score (0-1, higher is better)
                "id": metadata[idx]["doc_id"],
                "source_file": metadata[idx]["source_file"],
                "chunk_index": metadata[idx]["chunk_index"],
                "text": metadata[idx]["text"]
            })
        else:
            print(f"Warning: Index {idx} out of bounds for metadata.")
    return results

def keyword_search(query_text, k=TOP_K_RESULTS):
    """Performs a simple case-insensitive keyword search."""
    if not query_text:
        return []
    print(f"Performing keyword search for query: ", query_text)
    query_terms = set(query_text.lower().split())
    
    # Score based on number of matching terms, then by original order
    scored_results = []
    for i, item in enumerate(metadata):
        item_terms = set(item["text"].lower().split())
        common_terms = query_terms.intersection(item_terms)
        if common_terms:
            score = len(common_terms)
            scored_results.append({
                "score": score, 
                "id": item["doc_id"],
                "source_file": item["source_file"],
                "chunk_index": item["chunk_index"],
                "text": item["text"],
                "original_order": i # To maintain some order if scores are tied
            })
            
    # Sort by score (desc) then by original order (asc)
    scored_results.sort(key=lambda x: (x["score"], -x["original_order"]), reverse=True)
    return scored_results[:k]

def hybrid_search(query_text, k=TOP_K_RESULTS, semantic_weight=0.7, keyword_weight=0.3):
    """Combines semantic and keyword search results."""
    if not query_text:
        return []

    print(f"Performing hybrid search for query: ", query_text)
    semantic_results = semantic_search(query_text, k * 2) # Get more results to allow for re-ranking
    keyword_results = keyword_search(query_text, k * 2)

    # Combine and re-rank. For simplicity, we'll use a weighted sum of normalized scores.
    # A more sophisticated approach might involve reciprocal rank fusion or other methods.
    
    # Normalize scores (0-1) for keyword results (semantic scores are already somewhat normalized)
    max_kw_score = max(res["score"] for res in keyword_results) if keyword_results else 1
    for res in keyword_results:
        res["normalized_score"] = res["score"] / max_kw_score if max_kw_score > 0 else 0

    combined_results_map = {}

    for res in semantic_results:
        if res["id"] not in combined_results_map:
            combined_results_map[res["id"]] = {"semantic_score": 0, "keyword_score": 0, "data": res}
        combined_results_map[res["id"]]["semantic_score"] = res["score"] # Already 0-1 like

    for res in keyword_results:
        if res["id"] not in combined_results_map:
            combined_results_map[res["id"]] = {"semantic_score": 0, "keyword_score": 0, "data": res}
        combined_results_map[res["id"]]["keyword_score"] = res["normalized_score"]
    
    final_ranked_results = []
    for doc_id, scores_data in combined_results_map.items():
        combined_score = (scores_data["semantic_score"] * semantic_weight) + \
                           (scores_data["keyword_score"] * keyword_weight)
        final_ranked_results.append({
            "score": combined_score,
            "id": doc_id,
            "source_file": scores_data["data"]["source_file"],
            "chunk_index": scores_data["data"]["chunk_index"],
            "text": scores_data["data"]["text"]
        })
        
    final_ranked_results.sort(key=lambda x: x["score"], reverse=True)
    return final_ranked_results[:k]

def get_contextual_assistance_for_task(task_description, k=TOP_K_RESULTS):
    """Provides contextual assistance for a given task description using semantic search."""
    print(f"Getting contextual assistance for task: ", task_description)
    # For task assistance, semantic search is usually more appropriate
    return semantic_search(task_description, k)

# Example Usage (for testing)
if __name__ == "__main__":
    print("\n--- Testing Semantic Search ---")
    test_query_semantic = "Yönetici Ofisi görevleri nasıl takip edilir?"
    results_semantic = semantic_search(test_query_semantic)
    for res in results_semantic:
        print(f"  Score: {res['score']:.4f}, Source: {res['source_file']}, Chunk: {res['chunk_index']}")
        print(f"    Text: {res['text'][:150]}...")

    print("\n--- Testing Keyword Search ---")
    test_query_keyword = "ana görev panosu öncelik"
    results_keyword = keyword_search(test_query_keyword)
    for res in results_keyword:
        print(f"  Score: {res['score']}, Source: {res['source_file']}, Chunk: {res['chunk_index']}")
        print(f"    Text: {res['text'][:150]}...")

    print("\n--- Testing Hybrid Search ---")
    test_query_hybrid = "Yönetici Ofisi görev panosu önceliklendirme"
    results_hybrid = hybrid_search(test_query_hybrid)
    for res in results_hybrid:
        print(f"  Score: {res['score']:.4f}, Source: {res['source_file']}, Chunk: {res['chunk_index']}")
        print(f"    Text: {res['text'][:150]}...")

    print("\n--- Testing Contextual Assistance ---")
    task_desc = "CUDA PoC Raporunu İncele ve mimari açıdan değerlendir."
    # Let's find a relevant task description from the ana_gorev_panosu.md
    # For example, from ÖRN-002: "Örnek Görev 2: CUDA PoC Raporu İncelemesi ... Backend PoC raporunun mimari açıdan değerlendirilmesi."
    # We'll use a part of this as a task description.
    task_example_from_board = "CUDA PoC Raporu İncelemesi, Backend PoC raporunun mimari açıdan değerlendirilmesi"
    results_context = get_contextual_assistance_for_task(task_example_from_board)
    print(f"Contextual assistance for: {task_example_from_board}")
    for res in results_context:
        print(f"  Score: {res['score']:.4f}, Source: {res['source_file']}, Chunk: {res['chunk_index']}")
        print(f"    Text: {res['text'][:150]}...")

    print("\n--- Testing with a more specific task from a persona file ---")
    # Example from architect_detailed_cuda_tasks.md
    # Atlas Görevi AG-MIM-PLANREVIEW-001: ...ana_gorev_panosu.md, hierarchical_task_structure_definition.md, ve YONETICI_OFISI_KULLANIM_KILAVUZU.md dosyalarının gözden geçirilmesi...
    task_from_persona = "ana_gorev_panosu.md dosyasını gözden geçir"
    results_context_persona = get_contextual_assistance_for_task(task_from_persona)
    print(f"Contextual assistance for: {task_from_persona}")
    for res in results_context_persona:
        print(f"  Score: {res['score']:.4f}, Source: {res['source_file']}, Chunk: {res['chunk_index']}")
        print(f"    Text: {res['text'][:150]}...")

