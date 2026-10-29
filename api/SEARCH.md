# Hybrid search (draft)
1. Keyword: `ts_rank_cd(search_tsv, websearch_to_tsquery('simple', q))`, top 100.
2. Semantic: `embedding <=> query_embedding`, top 100 (HNSW).
3. Filter both by license flags (join `licenses`), `NOT hidden`.
4. Merge with Reciprocal Rank Fusion (k=60); optional graph boost for tracks linked to a seed track via `track_edges`.
5. Optional cross-encoder rerank of top 50 before returning.
