from typing import Dict, Any, List
from .base_verifier import BaseVerifier, VerificationResult
from datetime import datetime

class TravelVerifier(BaseVerifier):
    def verify(self, claim_data: Dict[str, Any], evidence_analysis: List[Dict[str, Any]]) -> VerificationResult:
        steps = []
        flags = []
        missing = []
        confidence = 1.0

        # Step 1: Document Check
        required_docs = ["Boarding Pass", "Booking Confirmation", "Delay Certificate"]
        missing = self.check_completeness(required_docs, evidence_analysis)
        
        steps.append({
            "name": "Document Completeness",
            "passed": len(missing) == 0,
            "details": f"Missing: {', '.join(missing)}" if missing else "All required documents present"
        })
        if missing:
             confidence -= 0.2 * len(missing)

        # Step 2: Date Verification
        incident_date_str = claim_data.get("incident_date", "") or claim_data.get("date_of_incident", "")
        extracted_date = None
        date_match = False

        for analysis in evidence_analysis:
            fields = analysis.get("key_fields", {})
            if "flight_date" in fields:
                extracted_date = fields["flight_date"]
            elif "date" in fields:
                extracted_date = fields["date"]
            
            if extracted_date and incident_date_str:
                # Simple string match or basic parsing
                if extracted_date in incident_date_str or incident_date_str in extracted_date:
                    date_match = True
        
        steps.append({
            "name": "Travel Dates Validation",
            "passed": date_match,
            "details": f"Incident date matches evidence date: {extracted_date}" if date_match else "Date mismatch or unverified"
        })
        if not date_match:
             confidence -= 0.25

        # Final Decision
        verified = confidence > 0.75
        
        return VerificationResult(
            verified=verified,
            confidence=max(0.0, min(1.0, confidence)),
            flags=flags,
            reasoning=f"Travel verification {'passed' if verified else 'flagged'}.",
            missing_documents=missing,
            verification_steps=steps
        )
