from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod
from pydantic import BaseModel

class VerificationResult(BaseModel):
    verified: bool
    confidence: float
    flags: List[str]
    reasoning: str
    missing_documents: List[str]
    verification_steps: List[Dict[str, Any]]

class BaseVerifier(ABC):
    """
    Abstract base class for insurance type-specific verifiers.
    """

    def __init__(self):
        pass

    @abstractmethod
    def verify(self, claim_data: Dict[str, Any], evidence_analysis: List[Dict[str, Any]]) -> VerificationResult:
        """
        Execute the verification pipeline for a specific claim type.
        
        Args:
            claim_data: The claim input data (amount, description, etc.)
            evidence_analysis: List of analysis results from EvidenceAnalyzer
            
        Returns:
            VerificationResult object
        """
        pass

    def check_completeness(self, required_docs: List[str], evidence_analysis: List[Dict[str, Any]]) -> List[str]:
        """
        Check if all required document types are present in the evidence analysis.
        This is a simple heuristic based on 'document_type' or inferred content.
        """
        missing = []
        # Gather detected types from analysis
        detected_types = []
        for analysis in evidence_analysis:
            # Check LLM extracted type
            dtype = analysis.get("doc_type", analysis.get("document_type", "")).lower()
            detected_types.append(dtype)
        
        for req in required_docs:
            # Check if any detected type matches loosely
            if not any(req.lower() in d for d in detected_types):
                missing.append(req)
        
        return missing
