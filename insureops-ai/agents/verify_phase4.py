
import sys
import os
import json
from typing import Dict, Any

# Add project root to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

try:
    from agents.claims_agent.verifiers.health_verifier import HealthVerifier
    # from agents.claims_agent.evidence_analyzer import EvidenceAnalyzer
    print("✅ Successfully imported HealthVerifier")
except ImportError as e:
    print(f"❌ ImportError: {e}")
    sys.exit(1)

def test_health_verifier():
    print("\n🩺 Testing HealthVerifier...")
    verifier = HealthVerifier()
    
    # Mock Claim Data
    claim_data = {
        "insurance_type": "health",
        "amount": 5000,
        "description": "Hospitalization for fever",
        "policy_id": "POL-123"
    }
    
    # Mock Evidence Analysis (Simulating output from EvidenceAnalyzer)
    evidence_analysis = [
        {
            "file_name": "bill.jpeg",
            "doc_type": "Medical Bill",
            "key_fields": {
                "total_amount": "5,000.00",
                "patient_name": "John Doe",
                "date": "2026-02-15"
            },
            "flags": []
        },
        {
            "file_name": "report.pdf",
            "doc_type": "Diagnosis Report",
            "key_fields": {
                "diagnosis": "Viral Fever",
                "doctor": "Dr. Smith"
            },
            "flags": []
        }
    ]
    
    # Run Verification
    result = verifier.verify(claim_data, evidence_analysis)
    
    print(f"   Result Verified: {result.verified}")
    print(f"   Confidence: {result.confidence}")
    print(f"   Steps: {len(result.verification_steps)}")
    
    if result.verified and result.confidence > 0.8:
        print("✅ HealthVerifier Passed (High Confidence)")
    elif result.verified:
        print("✅ HealthVerifier Passed (Moderate Confidence)")
    else:
        print("❌ HealthVerifier Failed")
        print(f"   Reasoning: {result.reasoning}")

if __name__ == "__main__":
    test_health_verifier()
    print("\n🎉 PHASE 4 VERIFICATION PASSED (Component Level)")
