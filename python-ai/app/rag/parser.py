import base64
import io
import fitz  # pymupdf
import pandas as pd
from docx import Document as DocxDocument


def parse_file(file_base64: str, file_type: str) -> str:
    file_bytes = base64.b64decode(file_base64)

    if file_type == "pdf":
        return _parse_pdf(file_bytes)
    elif file_type == "docx":
        return _parse_docx(file_bytes)
    elif file_type == "csv":
        return _parse_csv(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")


def _parse_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    texts = []
    for page in doc:
        text = page.get_text("text")
        if text.strip():
            texts.append(text)
    doc.close()
    return "\n\n".join(texts)


def _parse_docx(file_bytes: bytes) -> str:
    doc = DocxDocument(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n\n".join(paragraphs)


def _parse_csv(file_bytes: bytes) -> str:
    df = pd.read_csv(io.BytesIO(file_bytes))
    return df.to_markdown(index=False)