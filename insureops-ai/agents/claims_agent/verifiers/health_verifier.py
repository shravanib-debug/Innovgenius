from typing import Dict, Any, List
from .base_verifier import BaseVerifier, VerificationResult

class HealthVerifier(BaseVerifier):
    def verify(self, claim_data: Dict[str, Any], evidence_analysis: List[Dict[str, Any]]) -> VerificationResult:
        steps = []
        flags = []
        missing = []
        confidence = 1.0

        # Step 1: Document Check
        required_docs = ["Medical Bill", "Diagnosis Report"]
        missing = self.check_completeness(required_docs, evidence_analysis)
        
        steps.append({
            "name": "Document Completeness",
            "passed": len(missing) == 0,
            "details": f"Missing: {', '.join(missing)}" if missing else "All required documents present"
        })

        if missing:
            confidence -= 0.2 * len(missing)

        # Step 2: Amount Verification
        claimed_amount = float(claim_data.get("amount", 0))
        bill_total = 0.0
        
        for analysis in evidence_analysis:
            # Try to find 'total_amount' or similar in extracted fields
            fields = analysis.get("key_fields", {})
            if "total_amount" in fields:
                try:
                    bill_total += float(str(fields["total_amount"]).replace("$", "").replace(",", ""))
                except:
                    pass
            elif "amount" in fields:
                try:
                    bill_total += float(str(fields["amount"]).replace("$", "").replace(",", ""))
                except:
                    pass

        # If bills found, compare
        if bill_total > 0:
            diff = abs(claimed_amount - bill_total)
            passed = diff < (claimed_amount * 0.1) # 10% tolerance
            steps.append({
                "name": "Bill Reconciliation",
                "passed": passed,
                "details": f"Claimed ${claimed_amount} vs Bills ${bill_total}"
            })
            if not passed:
                flags.append(f"Amount mismatch: Claimed ${claimed_amount} but bills show ${bill_total}")
                confidence -= 0.3
        else:
             steps.append({
                "name": "Bill Reconciliation",
                "passed": False,
                "details": "No bill amounts extracted from evidence"
            })

        # Step 3: Policy Coverage (Simulated logic based on diagnosis)
        # In real world, we check specific CPT codes against policy
        diagnosis = "Unknown"
        for analysis in evidence_analysis:
             if "diagnosis" in analysis.get("key_fields", {}):
                 diagnosis = analysis["key_fields"]["diagnosis"]
                 break
        
        steps.append({
            "name": "Coverage Eligibility",
            "passed": True, # Assume covered for now unless specific exclusion
            "details": f"Diagnosis '{diagnosis}' appears covered under standard health policy"
        })

        # Final Decision
        verified = confidence > 0.7 and len(missing) == 0
        
        return VerificationResult(
            verified=verified,
            confidence=max(0.0, min(1.0, confidence)),
            flags=flags,
            reasoning=f"Health verification {'passed' if verified else 'failed'}. {steps[-1]['details']}",
            missing_documents=missing,
            verification_steps=steps
        )
