import fitz  # pymupdf
import pandas as pd
from docx import Document as DocxDocument


def parse_file(file_path: str, file_type: str) -> str:
    if file_type == "pdf":
        return _parse_pdf(file_path)
    elif file_type == "docx":
        return _parse_docx(file_path)
    elif file_type == "csv":
        return _parse_csv(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")


def _parse_pdf(file_path: str) -> str:
    doc = fitz.open(file_path)
    texts = []
    for page in doc:
        text = page.get_text("text")
        if text.strip():
            texts.append(text)
    doc.close()
    return "\n\n".join(texts)


def _parse_docx(file_path: str) -> str:
    doc = DocxDocument(file_path)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n\n".join(paragraphs)


def _parse_csv(file_path: str) -> str:
    df = pd.read_csv(file_path)
    return df.to_markdown(index=False)