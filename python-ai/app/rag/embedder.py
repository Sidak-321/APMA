import os
import uuid
from fastembed import TextEmbedding
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

VECTOR_DIM = 384
COLLECTION_NAME = "apma_documents"
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")

# fastembed — no PyTorch, pure ONNX, CPU only
model = TextEmbedding("sentence-transformers/all-MiniLM-L6-v2")
client = QdrantClient(url=QDRANT_URL)


def ensure_collection():
    existing = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME not in existing:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_DIM, distance=Distance.COSINE),
        )


def embed_and_store(chunks: list, document_id: str, project_id: str, user_id: str) -> int:
    ensure_collection()

    # fastembed returns a generator — convert to list
    embeddings = list(model.embed(chunks))

    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=embedding.tolist(),
            payload={
                "text": chunk,
                "document_id": document_id,
                "project_id": project_id,
                "user_id": user_id,
                "chunk_index": i,
            },
        )
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
    ]

    client.upsert(collection_name=COLLECTION_NAME, points=points)
    return len(points)