from qdrant_client.models import Filter, FieldCondition, MatchValue
from app.rag.embedder import client, model, COLLECTION_NAME


def retrieve(
    query: str,
    project_id: str,
    user_id: str,
    top_k: int = 5,
) -> list:
    query_vector = model.encode(query).tolist()

    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=top_k,
        query_filter=Filter(
            must=[
                FieldCondition(key="project_id", match=MatchValue(value=project_id)),
                FieldCondition(key="user_id", match=MatchValue(value=user_id)),
            ]
        ),
        with_payload=True,
    )

    return [
        {
            "text": r.payload["text"],
            "document_id": r.payload["document_id"],
            "chunk_index": r.payload["chunk_index"],
            "score": r.score,
        }
        for r in results
    ]