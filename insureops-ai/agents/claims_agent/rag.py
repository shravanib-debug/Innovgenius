"""
Claims Processing Agent — RAG Pipeline (PDF + FAISS)
Loads the sample policy document (PDF or TXT), chunks it, embeds with
sentence-transformers, and retrieves relevant context via FAISS vector search.
Falls back to keyword matching if FAISS/transformers are not available.
"""

import os
import re
from typing import Optional
from agents.base_agent import get_data_path

# ─── Optional imports (graceful fallback) ────────────────

_FAISS_AVAILABLE = False
try:
    import numpy as np
    import faiss
    from sentence_transformers import SentenceTransformer
    _FAISS_AVAILABLE = True
except ImportError:
    pass

_PDF_AVAILABLE = False
try:
    import fitz  # PyMuPDF
    _PDF_AVAILABLE = True
except ImportError:
    pass

# ─── Embedding model (lazy-loaded singleton) ─────────────

_embed_model = None
_EMBED_MODEL_NAME = "all-MiniLM-L6-v2"  # 384-dim, fast, ~80MB


def _get_embed_model():
    """Lazy-load the sentence-transformer model."""
    global _embed_model
    if _embed_model is None:
        print(f"📦 Loading embedding model: {_EMBED_MODEL_NAME}...")
        _embed_model = SentenceTransformer(_EMBED_MODEL_NAME)
        print(f"✅ Embedding model loaded ({_EMBED_MODEL_NAME})")
    return _embed_model


class PolicyRAG:
    """
    RAG pipeline for policy document context retrieval.
    Supports PDF and TXT sources. Uses FAISS vector search when available,
    falls back to keyword matching otherwise.
    """

    def __init__(self, policy_path: Optional[str] = None):
        # Prefer PDF, fall back to TXT
        if policy_path:
            self.policy_path = policy_path
        else:
            pdf_path = get_data_path("sample_policy.pdf")
            txt_path = get_data_path("sample_policy.txt")
            self.policy_path = pdf_path if os.path.exists(pdf_path) else txt_path

        self.chunks: list[dict] = []
        self.faiss_index = None
        self.chunk_embeddings = None

        self._load_and_chunk()

        if _FAISS_AVAILABLE:
            self._build_faiss_index()
        else:
            print("⚠️ FAISS/sentence-transformers not available, using keyword fallback")
            self._build_keyword_index()

    # ─── Text Extraction ─────────────────────────────

    def _extract_text(self) -> str:
        """Extract text from PDF or TXT file."""
        if not os.path.exists(self.policy_path):
            print(f"⚠️ Policy document not found at {self.policy_path}")
            return ""

        ext = os.path.splitext(self.policy_path)[1].lower()

        if ext == ".pdf" and _PDF_AVAILABLE:
            return self._extract_from_pdf()
        else:
            return self._extract_from_txt()

    def _extract_from_pdf(self) -> str:
        """Extract text from PDF using PyMuPDF."""
        doc = fitz.open(self.policy_path)
        pages_text = []
        for page_num, page in enumerate(doc):
            text = page.get_text("text")
            pages_text.append(text)
        doc.close()
        print(f"📄 Extracted text from PDF: {len(pages_text)} pages")
        return "\n".join(pages_text)

    def _extract_from_txt(self) -> str:
        """Extract text from plain text file."""
        with open(self.policy_path, "r", encoding="utf-8") as f:
            return f.read()

    # ─── Chunking ────────────────────────────────────

    def _load_and_chunk(self):
        """Load the policy document and split into searchable chunks."""
        content = self._extract_text()
        if not content:
            return

        # Split by major section headers (=== lines)
        sections = re.split(r'\n={3,}\n', content)

        for section in sections:
            section = section.strip()
            if not section or len(section) < 20:
                continue

            # Extract section title (first non-empty line)
            lines = [l.strip() for l in section.split('\n') if l.strip()]
            title = lines[0] if lines else "Unknown Section"

            # Split into sub-sections by numbered headers (e.g., "1.1 DWELLING")
            sub_parts = re.split(r'\n(\d+\.\d+\s+[A-Z])', section)

            current_chunk = ""
            current_title = title

            for part in sub_parts:
                # Detect sub-section header start
                if re.match(r'\d+\.\d+\s+[A-Z]', part):
                    if current_chunk and len(current_chunk.strip()) > 30:
                        self.chunks.append({
                            "title": current_title,
                            "content": current_chunk.strip()
                        })
                    current_title = f"{title} > {part.strip()}"
                    current_chunk = part
                else:
                    current_chunk += part

            # Add the last chunk
            if current_chunk and len(current_chunk.strip()) > 30:
                self.chunks.append({
                    "title": current_title,
                    "content": current_chunk.strip()
                })

        print(f"📋 Chunked policy document into {len(self.chunks)} sections")

    # ─── FAISS Vector Index ──────────────────────────

    def _build_faiss_index(self):
        """Embed all chunks and build a FAISS index."""
        if not self.chunks:
            return

        model = _get_embed_model()

        # Create embeddings for all chunks (use title + content for richer embedding)
        texts = [f"{c['title']}\n{c['content']}" for c in self.chunks]
        embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
        self.chunk_embeddings = np.array(embeddings, dtype=np.float32)

        # Build FAISS index (Inner Product = cosine similarity on normalized vectors)
        dim = self.chunk_embeddings.shape[1]
        self.faiss_index = faiss.IndexFlatIP(dim)
        self.faiss_index.add(self.chunk_embeddings)

        print(f"🔍 FAISS index built: {self.faiss_index.ntotal} vectors, {dim}-dim")

    # ─── Keyword Fallback Index ──────────────────────

    def _build_keyword_index(self):
        """Build keyword index as fallback when FAISS is not available."""
        self.section_index = {}
        for i, chunk in enumerate(self.chunks):
            keywords = self._extract_keywords(chunk["content"])
            chunk["keywords"] = keywords
            for kw in keywords:
                if kw not in self.section_index:
                    self.section_index[kw] = []
                self.section_index[kw].append(i)

    def _extract_keywords(self, text: str) -> list[str]:
        """Extract insurance-domain keywords from text."""
        terms = [
            "fire", "water", "flood", "theft", "vandalism", "wind", "hail",
            "lightning", "explosion", "liability", "medical", "collision",
            "coverage", "deductible", "exclusion", "payout", "claim",
            "dwelling", "personal property", "loss of use", "structural",
            "earthquake", "mold", "maintenance", "fraud", "arson",
            "glass", "windshield", "auto", "vehicle", "storm",
            "burst pipe", "plumbing", "appliance", "jewelry", "electronics"
        ]
        text_lower = text.lower()
        return [t for t in terms if t in text_lower]

    # ─── Retrieval ───────────────────────────────────

    def retrieve_context(self, claim_type: str, description: str = "", top_k: int = 3) -> str:
        """
        Retrieve relevant policy sections for a given claim.
        Uses FAISS semantic search when available, keyword matching otherwise.
        """
        if not self.chunks:
            return "Policy document not available for context."

        if _FAISS_AVAILABLE and self.faiss_index is not None:
            return self._retrieve_faiss(claim_type, description, top_k)
        else:
            return self._retrieve_keywords(claim_type, description, top_k)

    def _retrieve_faiss(self, claim_type: str, description: str, top_k: int) -> str:
        """Semantic retrieval using FAISS cosine similarity."""
        model = _get_embed_model()

        # Build query from claim type + description
        query = f"{claim_type.replace('_', ' ')} {description}".strip()
        query_vec = model.encode([query], normalize_embeddings=True)
        query_vec = np.array(query_vec, dtype=np.float32)

        # Search FAISS index
        scores, indices = self.faiss_index.search(query_vec, min(top_k, len(self.chunks)))

        context_parts = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or score < 0.1:  # Skip low-relevance results
                continue
            chunk = self.chunks[idx]
            context_parts.append(
                f"--- {chunk['title']} (relevance: {score:.2f}) ---\n"
                f"{chunk['content'][:600]}"
            )

        if not context_parts:
            return "No specific policy sections found for this claim type."

        return "\n\n".join(context_parts)

    def _retrieve_keywords(self, claim_type: str, description: str, top_k: int) -> str:
        """Keyword-based retrieval (fallback)."""
        query_text = f"{claim_type} {description}".lower()
        query_keywords = self._extract_keywords(query_text)
        claim_keywords = claim_type.lower().replace("_", " ").split()
        query_keywords.extend(claim_keywords)

        scored = []
        for i, chunk in enumerate(self.chunks):
            score = 0
            for kw in query_keywords:
                if kw in chunk.get("keywords", []):
                    score += 2
                if kw in chunk["content"].lower():
                    score += 1
            if score > 0:
                scored.append((score, i, chunk))

        scored.sort(key=lambda x: x[0], reverse=True)

        if not scored:
            return "No specific policy sections found for this claim type."

        context_parts = []
        for score, idx, chunk in scored[:top_k]:
            context_parts.append(f"--- {chunk['title']} ---\n{chunk['content'][:600]}")

        return "\n\n".join(context_parts)


# ─── Singleton ───────────────────────────────────────

_rag_instance = None


def get_policy_rag() -> PolicyRAG:
    """Get or create the singleton PolicyRAG instance."""
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = PolicyRAG()
    return _rag_instance
