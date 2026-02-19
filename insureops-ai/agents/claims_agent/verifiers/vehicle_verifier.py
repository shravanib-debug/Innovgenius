from typing import Dict, Any, List
from .base_verifier import BaseVerifier, VerificationResult

class VehicleVerifier(BaseVerifier):
    def verify(self, claim_data: Dict[str, Any], evidence_analysis: List[Dict[str, Any]]) -> VerificationResult:
        steps = []
        flags = []
        missing = []
        confidence = 1.0

        # Step 1: Document Check
        required_docs = ["Damage Photo", "Repair Estimate", "License"]
        missing = self.check_completeness(required_docs, evidence_analysis)
        
        steps.append({
            "name": "Document Completeness",
            "passed": len(missing) == 0,
            "details": f"Missing: {', '.join(missing)}" if missing else "All required documents present"
        })
        
        if missing:
            confidence -= 0.2 * len(missing)

        # Step 2: Damage Analysis (Vision)
        max_severity = 0.0
        damage_found = False
        for analysis in evidence_analysis:
            if "damage_severity" in analysis:
                try:
                    sev = float(analysis["damage_severity"])
                    max_severity = max(max_severity, sev)
                    damage_found = True
                except:
                    pass

        if damage_found:
            steps.append({
                "name": "AI Damage Assessment",
                "passed": True,
                "details": f"Max damage severity detected: {max_severity:.2f}/1.0"
            })
            
            # Cross check amount vs severity
            amount = float(claim_data.get("amount", 0))
            # Heuristic: High severity should match high amount
            if max_severity > 0.8 and amount < 1000:
                flags.append("High severity damage but low claim amount (Suspicious?)")
            elif max_severity < 0.2 and amount > 5000:
                flags.append("Low visible damage but high claim amount ($5000+)")
                confidence -= 0.4
        else:
            steps.append({
                "name": "AI Damage Assessment",
                "passed": False, # Warning
                "details": "No damage severity score returned from vision analysis"
            })

        # Step 3: Registration/License Check
        # Uses OCR text to find license plate or DL number
        license_found = False
        for analysis in evidence_analysis:
            text = analysis.get("extracted_text", "") + str(analysis.get("key_fields", ""))
            if "License" in text or "Registration" in text or "DL" in text:
                license_found = True
        
        steps.append({
            "name": "ID Verification",
            "passed": license_found,
            "details": "Driver License/Registration details found in evidence" if license_found else "ID documents illegible or missing key fields"
        })
        if not license_found:
             confidence -= 0.1

        # Final Decision
        verified = confidence > 0.65
        
        return VerificationResult(
            verified=verified,
            confidence=max(0.0, min(1.0, confidence)),
            flags=flags,
            reasoning=f"Vehicle verification {'passed' if verified else 'flagged'}. Severity: {max_severity:.2f}",
            missing_documents=missing,
            verification_steps=steps
        )
