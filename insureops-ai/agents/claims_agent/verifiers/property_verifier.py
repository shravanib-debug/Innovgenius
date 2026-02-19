from typing import Dict, Any, List
from .base_verifier import BaseVerifier, VerificationResult

class PropertyVerifier(BaseVerifier):
    def verify(self, claim_data: Dict[str, Any], evidence_analysis: List[Dict[str, Any]]) -> VerificationResult:
        steps = []
        flags = []
        missing = []
        confidence = 1.0

        # Step 1: Document Check
        required_docs = ["Property Photo", "Repair Quote", "Proof of Ownership"]
        missing = self.check_completeness(required_docs, evidence_analysis)
        
        steps.append({
            "name": "Document Completeness",
            "passed": len(missing) == 0,
            "details": f"Missing: {', '.join(missing)}" if missing else "All required documents present"
        })
        if missing:
             confidence -= 0.15 * len(missing)

        # Step 2: Ownership Check
        owner_name_found = False
        claimant_name = claim_data.get("claimant_name", "").lower()
        
        for analysis in evidence_analysis:
            text = analysis.get("extracted_text", "").lower() + str(analysis.get("key_fields", "")).lower()
            if "owner" in text or "deed" in text or "tax" in text:
                owner_name_found = True
        
        steps.append({
            "name": "Ownership Validation",
            "passed": owner_name_found,
            "details": "Property ownership document detected" if owner_name_found else "Ownership proof unclear"
        })
        if not owner_name_found:
             confidence -= 0.2

        # Step 3: Damage Assessment
        max_severity = 0.0
        for analysis in evidence_analysis:
             if "damage_severity" in analysis:
                try:
                    sev = float(analysis["damage_severity"])
                    max_severity = max(max_severity, sev)
                except:
                    pass
        
        steps.append({
            "name": "Damage Assessment",
            "passed": True,
            "details": f"AI property damage severity: {max_severity:.2f}/1.0"
        })

        # Final Decision
        verified = confidence > 0.70
        
        return VerificationResult(
            verified=verified,
            confidence=max(0.0, min(1.0, confidence)),
            flags=flags,
            reasoning=f"Property verification {'passed' if verified else 'flagged'}. Severity: {max_severity:.2f}",
            missing_documents=missing,
            verification_steps=steps
        )
