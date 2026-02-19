"""
Claims Processing Agent — RAG Pipeline
Loads the sample policy document, chunks it, and provides context retrieval
for claim analysis. Uses simple keyword-based retrieval for portability,
with optional FAISS upgrade when sentence-transformers is available.
"""

import os
import re
from typing import Optional
from agents.base_agent import get_data_path


class PolicyRAG:
    """Simple RAG pipeline for policy document context retrieval."""

    def __init__(self, policy_path: Optional[str] = None):
        self.policy_path = policy_path or get_data_path("sample_policy.txt")
        self.chunks = []
        self.section_index = {}
        self._load_and_chunk()

    def get_full_policy_text(self) -> str:
        """Return the full raw policy document text."""
        if not os.path.exists(self.policy_path):
            return ""
        with open(self.policy_path, "r", encoding="utf-8") as f:
            return f.read()

    def _load_and_chunk(self):
        """Load the policy document and split into searchable chunks."""
        if not os.path.exists(self.policy_path):
            print(f"⚠️ Policy document not found at {self.policy_path}")
            return

        with open(self.policy_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Split by section headers (lines with === or section numbers)
        sections = re.split(r'\n={3,}\n', content)

        for section in sections:
            section = section.strip()
            if not section:
                continue

            # Extract section title (first non-empty line)
            lines = section.split('\n')
            title = lines[0].strip() if lines else "Unknown Section"

            # Further split large sections into sub-chunks (~500 chars each)
            sub_sections = re.split(r'\n(\d+\.\d+\s)', section)

            current_chunk = ""
            current_title = title

            for part in sub_sections:
                if re.match(r'\d+\.\d+\s', part):
                    # This is a sub-section header
                    if current_chunk:
                        self.chunks.append({
                            "title": current_title,
                            "content": current_chunk.strip(),
                            "keywords": self._extract_keywords(current_chunk)
                        })
                    current_title = f"{title} > {part.strip()}"
                    current_chunk = part
                else:
                    current_chunk += part

            # Add the last chunk
            if current_chunk:
                self.chunks.append({
                    "title": current_title,
                    "content": current_chunk.strip(),
                    "keywords": self._extract_keywords(current_chunk)
                })

        # Build section index for quick lookup
        for i, chunk in enumerate(self.chunks):
            for keyword in chunk["keywords"]:
                if keyword not in self.section_index:
                    self.section_index[keyword] = []
                self.section_index[keyword].append(i)

    def _extract_keywords(self, text: str) -> list[str]:
        """Extract important keywords from a text chunk."""
        # Insurance-specific keywords
        important_terms = [
            "fire", "water", "flood", "theft", "vandalism", "wind", "hail",
            "lightning", "explosion", "liability", "medical", "collision",
            "coverage", "deductible", "exclusion", "payout", "claim",
            "dwelling", "personal property", "loss of use", "structural",
            "earthquake", "mold", "maintenance", "fraud", "arson",
            "glass", "windshield", "auto", "vehicle", "storm",
            "burst pipe", "plumbing", "appliance", "jewelry", "electronics"
        ]

        text_lower = text.lower()
        found = [term for term in important_terms if term in text_lower]
        return found

    def retrieve_context(self, claim_type: str, description: str = "", top_k: int = 3) -> str:
        """
        Retrieve relevant policy sections for a given claim type.
        Uses keyword matching to find the most relevant chunks.
        """
        if not self.chunks:
            return "Policy document not available for context."

        query_text = f"{claim_type} {description}".lower()
        query_keywords = self._extract_keywords(query_text)

        # Also add the claim type directly
        claim_keywords = claim_type.lower().replace("_", " ").split()
        query_keywords.extend(claim_keywords)

        # Score each chunk
        scored_chunks = []
        for i, chunk in enumerate(self.chunks):
            score = 0
            for kw in query_keywords:
                if kw in chunk["keywords"]:
                    score += 2
                if kw in chunk["content"].lower():
                    score += 1
            if score > 0:
                scored_chunks.append((score, i, chunk))

        # Sort by score, take top_k
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top_chunks = scored_chunks[:top_k]

        if not top_chunks:
            return "No specific policy sections found for this claim type."

        context_parts = []
        for score, idx, chunk in top_chunks:
            context_parts.append(f"--- {chunk['title']} ---\n{chunk['content'][:600]}")

        return "\n\n".join(context_parts)


# Singleton instance
_rag_instance = None

def get_policy_rag() -> PolicyRAG:
    """Get or create the singleton PolicyRAG instance."""
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = PolicyRAG()
    return _rag_instance
