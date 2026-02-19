"""
Seed Claims v2 — Populate claims and traces with realistic demo data.
Generates 50+ claims across all 5 insurance types with varied statuses,
evidence counts, completeness scores, and linked traces.

Usage:
    python simulator/seed_claims_v2.py

Connects to the backend API to insert data (no direct DB dependency).
"""

import json
import random
import urllib.request
from datetime import datetime, timedelta

BACKEND_URL = "http://localhost:5000"
INSURANCE_TYPES = ["health", "vehicle", "travel", "property", "life"]

# ── Claim templates per insurance type ──

CLAIM_TEMPLATES = {
    "health": {
        "descriptions": [
            "Emergency room visit — severe abdominal pain",
            "Outpatient surgery — knee arthroscopy",
            "Specialist consultation — cardiology follow-up",
            "Prescription drug coverage — insulin supplies",
            "Physical therapy — post-surgery rehabilitation",
            "Mental health therapy — weekly CBT sessions",
            "Dental procedure — root canal treatment",
            "Lab tests — comprehensive blood panel",
            "Ambulance transport — cardiac event response",
            "Hospitalization — pneumonia treatment 4-day stay",
        ],
        "amount_range": (500, 25000),
    },
    "vehicle": {
        "descriptions": [
            "Rear-end collision at intersection — bumper and trunk damage",
            "Hail damage — multiple dents across hood and roof",
            "Windshield replacement — crack from road debris",
            "Theft of vehicle — Toyota Camry 2022",
            "Side-swipe accident — driver door panel replacement",
            "Parking lot incident — rear quarter panel scratch",
            "Deer collision — front-end damage and airbag deployment",
            "Flood damage — electrical system failure after storm",
            "Hit-and-run — broken side mirror and scratched fender",
            "Multi-vehicle accident — front bumper and headlight repair",
        ],
        "amount_range": (1000, 35000),
    },
    "travel": {
        "descriptions": [
            "Flight cancellation — missed connection due to weather delay",
            "Lost luggage — international flight baggage not delivered",
            "Medical emergency abroad — food poisoning treatment in Mexico",
            "Trip interruption — family emergency return flight",
            "Hotel booking cancellation — natural disaster at destination",
            "Passport stolen — replacement costs and delayed departure",
            "Delayed baggage — essential items purchased during 3-day wait",
            "Missed cruise departure — connecting flight delay",
            "Emergency evacuation — volcanic activity in region",
            "Travel accident — broken arm during hiking excursion",
        ],
        "amount_range": (200, 8000),
    },
    "property": {
        "descriptions": [
            "Water damage — burst pipe in basement flooding 3 rooms",
            "Fire damage — kitchen fire spreading to dining area",
            "Storm damage — fallen tree crushing garage roof",
            "Burglary — electronics and jewelry stolen from residence",
            "Vandalism — spray paint on exterior and broken windows",
            "Lightning strike — electrical surge damaging appliances",
            "Foundation crack — structural assessment and repair needed",
            "Roof damage — shingles torn off during windstorm",
            "Mold remediation — bathroom and bedroom affected",
            "Frozen pipes — water damage in kitchen and laundry room",
        ],
        "amount_range": (2000, 50000),
    },
    "life": {
        "descriptions": [
            "Term life payout — policyholder deceased natural causes",
            "Accidental death benefit — workplace accident claim",
            "Critical illness rider — stage 2 cancer diagnosis",
            "Disability benefit — permanent disability from car accident",
            "Terminal illness acceleration — ALS diagnosis",
            "Accidental death and dismemberment — loss of limb",
            "Child rider benefit — serious illness of dependent",
            "Survivorship benefit — second death of joint policy",
            "Double indemnity claim — accidental death verification",
            "Waiver of premium — total disability filing",
        ],
        "amount_range": (10000, 250000),
    },
}

STATUSES = ["submitted", "under_review", "verified", "approved", "rejected", "escalated"]
STATUS_WEIGHTS = [15, 20, 15, 30, 10, 10]  # More approved/under_review

DECISIONS = ["approved", "rejected", "escalated", "flagged"]
DECISION_WEIGHTS = [50, 20, 20, 10]


def random_date(days_back=30):
    """Generate a random date within the last N days."""
    delta = timedelta(days=random.randint(0, days_back), hours=random.randint(0, 23))
    return (datetime.utcnow() - delta).isoformat()


def generate_claim(insurance_type):
    """Generate a single claim payload."""
    template = CLAIM_TEMPLATES[insurance_type]
    amount = random.randint(*template["amount_range"])
    status = random.choices(STATUSES, weights=STATUS_WEIGHTS, k=1)[0]

    return {
        "insurance_type": insurance_type,
        "claim_type": f"{insurance_type}_general",
        "description": random.choice(template["descriptions"]),
        "claim_amount": amount,
        "status": status,
        "policy_id": f"POL-{insurance_type[:3].upper()}-{random.randint(10000, 99999)}",
        "incident_date": random_date(60),
        "evidence_completeness_score": round(random.uniform(0.3, 1.0), 2),
    }


def post_json(endpoint, data):
    """POST JSON to the backend API."""
    url = f"{BACKEND_URL}{endpoint}"
    payload = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            return resp.status, body
    except urllib.error.HTTPError as e:
        return e.code, {"error": e.read().decode("utf-8")}
    except Exception as e:
        return 0, {"error": str(e)}


def seed_claims(count=50):
    """Seed the database with claims via the API."""
    print(f"\n🌱 Seeding {count} claims across {len(INSURANCE_TYPES)} types...\n")

    results = {"success": 0, "failed": 0, "by_type": {t: 0 for t in INSURANCE_TYPES}}

    # Distribute evenly, +/- random variance
    per_type = count // len(INSURANCE_TYPES)
    remainder = count % len(INSURANCE_TYPES)

    for i, ins_type in enumerate(INSURANCE_TYPES):
        type_count = per_type + (1 if i < remainder else 0)
        for j in range(type_count):
            claim = generate_claim(ins_type)
            status, resp = post_json("/api/claims", claim)

            if status in (200, 201):
                results["success"] += 1
                results["by_type"][ins_type] += 1
                claim_id = resp.get("id") or resp.get("claim", {}).get("id", "?")
                print(f"  ✅ [{ins_type:>8}] Claim #{claim_id} — ${claim['claim_amount']:,} — {claim['status']}")
            else:
                results["failed"] += 1
                print(f"  ❌ [{ins_type:>8}] Failed: {resp.get('error', 'Unknown error')[:60]}")

    # Summary
    print(f"\n{'=' * 50}")
    print(f"📊 Seeding Complete!")
    print(f"   ✅ Success: {results['success']}")
    print(f"   ❌ Failed:  {results['failed']}")
    print(f"\n   By Type:")
    for t, c in results["by_type"].items():
        print(f"   {'🏥🚗✈️🏠❤️'[INSURANCE_TYPES.index(t)]}  {t:>10}: {c}")
    print(f"{'=' * 50}\n")

    return results


if __name__ == "__main__":
    seed_claims(50)
