"""
Historical Data Seeder
Generates and seeds historical trace data into the backend
by running all agents on sample data and sending telemetry.
"""

import json
import random
import sys
import os
import time
from datetime import datetime, timedelta

# Ensure agents package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from agents.claims_agent.agent import run_claims_agent
from agents.underwriting_agent.agent import run_underwriting_agent
from agents.fraud_agent.agent import run_fraud_agent
from simulator.customer_support_sim import run_support_simulator
from agents.base_agent import load_json_data


def seed_all_agents(
    claims_count: int = 5,
    underwriting_count: int = 3,
    fraud_count: int = 3,
    support_count: int = 5,
    send_telemetry: bool = True
):
    """
    Run all agents on sample data to seed the database with traces.

    Args:
        claims_count: Number of claims to process
        underwriting_count: Number of applicants to assess
        fraud_count: Number of claims to analyze for fraud
        support_count: Number of support interactions to simulate
        send_telemetry: Whether to send telemetry to the backend
    """
    print("=" * 60)
    print("  InsureOps AI — Historical Data Seeder")
    print("=" * 60)

    all_results = {
        "claims": [],
        "underwriting": [],
        "fraud": [],
        "support": []
    }

    # ─── Claims Agent ────────────────────────────
    claims = load_json_data("sample_claims.json")
    selected_claims = claims[:claims_count]

    print(f"\n{'─' * 40}")
    print(f"📁 Running Claims Agent on {len(selected_claims)} claims...")
    print(f"{'─' * 40}")

    for claim in selected_claims:
        try:
            result = run_claims_agent(claim, send_telemetry=send_telemetry)
            all_results["claims"].append({
                "claim_id": claim["id"],
                "decision": result["decision"].get("decision_type"),
                "trace_id": result["trace_id"]
            })
        except Exception as e:
            print(f"   ❌ Error processing {claim['id']}: {e}")
        time.sleep(0.5)  # Spacing between traces

    # ─── Underwriting Agent ──────────────────────
    applicants = load_json_data("sample_applicants.json")
    selected_applicants = applicants[:underwriting_count]

    print(f"\n{'─' * 40}")
    print(f"📋 Running Underwriting Agent on {len(selected_applicants)} applicants...")
    print(f"{'─' * 40}")

    for applicant in selected_applicants:
        try:
            result = run_underwriting_agent(applicant, send_telemetry=send_telemetry)
            all_results["underwriting"].append({
                "applicant_id": applicant["id"],
                "decision": result["decision"].get("decision_type"),
                "trace_id": result["trace_id"]
            })
        except Exception as e:
            print(f"   ❌ Error processing {applicant['id']}: {e}")
        time.sleep(0.5)

    # ─── Fraud Detection Agent ───────────────────
    # Pick claims that are interesting for fraud analysis
    fraud_claims = [c for c in claims if c.get("fraud_indicators")] + \
                   [c for c in claims if not c.get("fraud_indicators")]
    selected_fraud = fraud_claims[:fraud_count]

    print(f"\n{'─' * 40}")
    print(f"🔎 Running Fraud Agent on {len(selected_fraud)} claims...")
    print(f"{'─' * 40}")

    for claim in selected_fraud:
        try:
            result = run_fraud_agent(claim, send_telemetry=send_telemetry)
            all_results["fraud"].append({
                "claim_id": claim["id"],
                "decision": result["decision"].get("decision_type"),
                "trace_id": result["trace_id"]
            })
        except Exception as e:
            print(f"   ❌ Error processing {claim['id']}: {e}")
        time.sleep(0.5)

    # ─── Customer Support Simulator ──────────────
    print(f"\n{'─' * 40}")
    print(f"💬 Running Support Simulator ({support_count} interactions)...")
    print(f"{'─' * 40}")

    support_results = run_support_simulator(
        count=support_count,
        send_telemetry=send_telemetry
    )
    all_results["support"] = support_results

    # ─── Summary ─────────────────────────────────
    print(f"\n{'=' * 60}")
    print("  Seeding Complete!")
    print(f"{'=' * 60}")
    print(f"  Claims:       {len(all_results['claims'])} traces")
    print(f"  Underwriting: {len(all_results['underwriting'])} traces")
    print(f"  Fraud:        {len(all_results['fraud'])} traces")
    print(f"  Support:      {len(all_results['support'])} traces")
    total = sum(len(v) for v in all_results.values())
    print(f"  Total:        {total} traces generated")
    print(f"{'=' * 60}\n")

    return all_results


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Seed InsureOps AI with historical data")
    parser.add_argument("--claims", type=int, default=5, help="Number of claims to process")
    parser.add_argument("--underwriting", type=int, default=3, help="Number of underwriting assessments")
    parser.add_argument("--fraud", type=int, default=3, help="Number of fraud analyses")
    parser.add_argument("--support", type=int, default=5, help="Number of support interactions")
    parser.add_argument("--no-telemetry", action="store_true", help="Skip sending telemetry to backend")

    args = parser.parse_args()

    seed_all_agents(
        claims_count=args.claims,
        underwriting_count=args.underwriting,
        fraud_count=args.fraud,
        support_count=args.support,
        send_telemetry=not args.no_telemetry
    )
