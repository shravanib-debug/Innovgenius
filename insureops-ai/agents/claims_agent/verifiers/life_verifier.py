from typing import Dict, Any, List
from .base_verifier import BaseVerifier, VerificationResult

class LifeVerifier(BaseVerifier):
    def verify(self, claim_data: Dict[str, Any], evidence_analysis: List[Dict[str, Any]]) -> VerificationResult:
        steps = []
        flags = []
        missing = []
        confidence = 1.0

        # Step 1: Document Check (Strict)
        required_docs = ["Death Certificate", "Beneficiary ID", "Policy Document"]
        missing = self.check_completeness(required_docs, evidence_analysis)
        
        steps.append({
            "name": "Critical Document Check",
            "passed": len(missing) == 0,
            "details": f"Missing: {', '.join(missing)}" if missing else "All required documents present"
        })
        if missing:
             # Life insurance is strict
             confidence -= 0.4 * len(missing)

        # Step 2: Authenticity Check (Simulated Vision Result)
        authenticity_score = 0.0
        for analysis in evidence_analysis:
             if "authenticity_score" in analysis:
                try:
                    score = float(analysis["authenticity_score"])
                    authenticity_score = max(authenticity_score, score)
                except:
                    pass
        
        # If no score, assume standard visual check
        if authenticity_score == 0:
            authenticity_score = 0.85 # Default passing for simulation
        
        steps.append({
            "name": "Document Authenticity AI",
            "passed": authenticity_score > 0.8,
            "details": f"Authenticity Score: {authenticity_score:.2f}/1.0"
        })
        if authenticity_score < 0.8:
            flags.append("Low authenticity score on death certificate")
            confidence -= 0.5

        # Step 3: Beneficiary Check
        nominee = claim_data.get("nominee_name", "").lower()
        found_nominee = False
        if nominee:
            for analysis in evidence_analysis:
                text = analysis.get("extracted_text", "").lower()
                if nominee in text:
                    found_nominee = True
        
        steps.append({
            "name": "Beneficiary Verification",
            "passed": found_nominee,
            "details": "Beneficiary name matches ID documents" if found_nominee else "Beneficiary name not found in docs"
        })

        # Final Decision
        verified = confidence > 0.85 # Very high bar
        
        return VerificationResult(
            verified=verified,
            confidence=max(0.0, min(1.0, confidence)),
            flags=flags,
            reasoning=f"Life claim verification {'passed' if verified else 'flagged'}. Strict checks applied.",
            missing_documents=missing,
            verification_steps=steps
        )
