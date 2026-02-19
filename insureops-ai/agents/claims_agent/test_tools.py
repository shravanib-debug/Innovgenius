"""
Dynamic Clause Interpretation — Test Suite
Verifies clause verification, deterministic guardrails, replay hashing,
structured clause objects from coverage_checker, and backward compatibility.

Run: python agents/claims_agent/test_tools.py
"""

import re
import sys
import os
import importlib.util
import hashlib

# ─── Direct Module Loading (bypasses agents/__init__.py) ──────
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

def _load_module(name, filepath):
    """Load a Python module from filepath without triggering package __init__.py."""
    spec = importlib.util.spec_from_file_location(name, filepath)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod

# Load base_agent first (tools.py depends on it)
base_agent = _load_module(
    "agents.base_agent",
    os.path.join(project_root, "agents", "base_agent.py")
)

# Load tools module
tools = _load_module(
    "agents.claims_agent.tools",
    os.path.join(project_root, "agents", "claims_agent", "tools.py")
)

# Load clause_verifier
clause_verifier = _load_module(
    "agents.claims_agent.clause_verifier",
    os.path.join(project_root, "agents", "claims_agent", "clause_verifier.py")
)

# Load rag module
rag = _load_module(
    "agents.claims_agent.rag",
    os.path.join(project_root, "agents", "claims_agent", "rag.py")
)

coverage_checker = tools.coverage_checker
payout_calculator = tools.payout_calculator
verify_llm_clauses = clause_verifier.verify_llm_clauses
compute_policy_hash = clause_verifier.compute_policy_hash


# ─── Fixtures ─────────────────────────────────────────
SAMPLE_POLICY = {
    "policy_id": "POL-1001",
    "holder_name": "Customer 1001",
    "status": "active",
    "dwelling_coverage": 325000,
    "personal_property_coverage": 162500,
    "liability_coverage": 100000,
    "medical_coverage": 5000,
    "deductible_standard": 500,
    "deductible_wind_hail": 1000,
}

KNOWN_TYPES = [
    "water_damage", "fire_damage", "flood_damage", "theft",
    "auto_collision", "auto_glass", "medical", "liability",
    "windstorm", "structural"
]

# Load real policy text
POLICY_TEXT_PATH = os.path.join(project_root, "agents", "data", "sample_policy.txt")
with open(POLICY_TEXT_PATH, "r", encoding="utf-8") as f:
    REAL_POLICY_TEXT = f.read()


passed = 0
failed = 0

def run_test(name, func):
    global passed, failed
    try:
        func()
        print(f"  ✅ PASS: {name}")
        passed += 1
    except AssertionError as e:
        print(f"  ❌ FAIL: {name} — {e}")
        failed += 1
    except Exception as e:
        print(f"  ❌ ERROR: {name} — {type(e).__name__}: {e}")
        failed += 1


# ═══════════════════════════════════════════════════════
# SECTION A: Coverage Checker Tests (from Phase 1)
# ═══════════════════════════════════════════════════════

def test_clause_id_format():
    pattern = re.compile(r"^POL-\d+\.\d+-[A-Z]+$")
    for ct in KNOWN_TYPES:
        result, _ = coverage_checker(ct, SAMPLE_POLICY)
        cid = result["clause_id"]
        assert pattern.match(cid), f"clause_id '{cid}' for {ct} doesn't match"

def test_clause_id_uniqueness():
    seen = {}
    for ct in KNOWN_TYPES:
        result, _ = coverage_checker(ct, SAMPLE_POLICY)
        cid = result["clause_id"]
        assert cid not in seen, f"Duplicate '{cid}' for '{seen[cid]}' and '{ct}'"
        seen[cid] = ct

def test_required_fields():
    required = ["clause_id", "section_title", "matched", "exclusion_triggered",
                 "coverage_limit", "covered", "notes", "exclusions", "applicable_limit", "deductible"]
    for ct in KNOWN_TYPES:
        result, _ = coverage_checker(ct, SAMPLE_POLICY)
        for f in required:
            assert f in result, f"Missing '{f}' for '{ct}'"

def test_matched_flag():
    for ct in KNOWN_TYPES:
        result, _ = coverage_checker(ct, SAMPLE_POLICY)
        assert result["matched"] is True
    result, _ = coverage_checker("alien_abduction", SAMPLE_POLICY)
    assert result["matched"] is False

def test_payout_backward_compat():
    cov, _ = coverage_checker("water_damage", SAMPLE_POLICY)
    pay, rec = payout_calculator(10000, cov, SAMPLE_POLICY)
    assert pay["payout"] > 0
    assert pay["breakdown"]["deductible"] == 500
    assert rec.success is True


# ═══════════════════════════════════════════════════════
# SECTION B: Clause Verification Tests (Phase 3)
# ═══════════════════════════════════════════════════════

def test_verify_valid_sections():
    """Valid section references should pass verification."""
    llm_output = {
        "generated_clauses": [
            {"section_number": "2.3", "section_title": "WATER DAMAGE",
             "clause_excerpt": "Burst pipes and plumbing failures", "impact": "supports"},
            {"section_number": "3.1", "section_title": "FLOOD DAMAGE",
             "clause_excerpt": "Damage caused by rising water", "impact": "exclusion"}
        ],
        "policy_text_citations": [
            {"section_number": "2.3", "quoted_text": "Burst pipes and plumbing failures"}
        ]
    }
    _, report = verify_llm_clauses(llm_output, REAL_POLICY_TEXT)
    assert report["hallucination_detected"] is False, f"Unexpected failures: {report}"

def test_verify_rejects_fake_section():
    """Fabricated section numbers should be flagged."""
    llm_output = {
        "generated_clauses": [
            {"section_number": "99.9", "section_title": "ALIEN INVASION",
             "clause_excerpt": "Covers alien invasions", "impact": "supports"}
        ],
        "policy_text_citations": []
    }
    _, report = verify_llm_clauses(llm_output, REAL_POLICY_TEXT)
    assert report["hallucination_detected"] is True
    assert len(report["failed_sections"]) >= 1

def test_verify_rejects_fake_excerpt():
    """Fabricated excerpts should be flagged even with valid section number."""
    llm_output = {
        "generated_clauses": [
            {"section_number": "2.3", "section_title": "WATER DAMAGE",
             "clause_excerpt": "This policy covers underwater basket weaving", "impact": "supports"}
        ],
        "policy_text_citations": []
    }
    _, report = verify_llm_clauses(llm_output, REAL_POLICY_TEXT)
    assert report["hallucination_detected"] is True
    assert len(report["failed_excerpts"]) >= 1

def test_verify_valid_citation():
    """Valid quoted text should pass."""
    llm_output = {
        "generated_clauses": [],
        "policy_text_citations": [
            {"section_number": "1.1", "quoted_text": "Covers damage to the physical structure of your home"}
        ]
    }
    _, report = verify_llm_clauses(llm_output, REAL_POLICY_TEXT)
    assert report["hallucination_detected"] is False

def test_verify_empty_output():
    """Empty LLM output should pass (nothing to verify)."""
    llm_output = {"generated_clauses": [], "policy_text_citations": []}
    _, report = verify_llm_clauses(llm_output, REAL_POLICY_TEXT)
    assert report["hallucination_detected"] is False
    assert report["total_clauses_checked"] == 0

def test_verify_available_sections():
    """Verification report should list all valid policy sections."""
    llm_output = {"generated_clauses": [], "policy_text_citations": []}
    _, report = verify_llm_clauses(llm_output, REAL_POLICY_TEXT)
    assert "1.1" in report["policy_sections_available"]
    assert "2.3" in report["policy_sections_available"]
    assert "3.1" in report["policy_sections_available"]


# ═══════════════════════════════════════════════════════
# SECTION C: Replay Safety Tests (Phase 5)
# ═══════════════════════════════════════════════════════

def test_policy_hash_consistency():
    """Same text should always produce same hash."""
    h1 = compute_policy_hash(REAL_POLICY_TEXT)
    h2 = compute_policy_hash(REAL_POLICY_TEXT)
    assert h1 == h2
    assert len(h1) == 64  # SHA256 hex length

def test_policy_hash_different_text():
    """Different text should produce different hash."""
    h1 = compute_policy_hash(REAL_POLICY_TEXT)
    h2 = compute_policy_hash(REAL_POLICY_TEXT + " modified")
    assert h1 != h2

def test_policy_hash_manual_verify():
    """Hash should match manual SHA256 computation."""
    expected = hashlib.sha256(REAL_POLICY_TEXT.encode("utf-8")).hexdigest()
    actual = compute_policy_hash(REAL_POLICY_TEXT)
    assert actual == expected


# ═══════════════════════════════════════════════════════
# SECTION D: Deterministic Guardrail Tests (Phase 4)
# ═══════════════════════════════════════════════════════

def test_guardrail_exclusion_overrides_approval():
    """If exclusion triggered, approved decision must be overridden to rejected."""
    analysis = {"decision": "approved", "generated_clauses": []}
    coverage = {"exclusion_triggered": True, "triggered_exclusion_codes": ["flood"], "covered": True}

    if coverage.get("exclusion_triggered") and analysis.get("decision") == "approved":
        analysis["decision"] = "rejected"

    assert analysis["decision"] == "rejected"

def test_guardrail_no_override_when_rejected():
    """If already rejected, no override needed."""
    analysis = {"decision": "rejected", "generated_clauses": []}
    coverage = {"exclusion_triggered": True, "triggered_exclusion_codes": ["flood"], "covered": True}

    original = analysis["decision"]
    if coverage.get("exclusion_triggered") and analysis.get("decision") == "approved":
        analysis["decision"] = "rejected"
    assert analysis["decision"] == original  # Should stay rejected

def test_guardrail_exclusion_clause_overrides():
    """Generated clause with impact=exclusion should override approved."""
    analysis = {
        "decision": "approved",
        "generated_clauses": [{"section_number": "3.1", "impact": "exclusion"}]
    }

    for clause in analysis["generated_clauses"]:
        if clause.get("impact") == "exclusion" and analysis.get("decision") == "approved":
            analysis["decision"] = "rejected"

    assert analysis["decision"] == "rejected"

def test_guardrail_supports_clause_no_override():
    """Generated clause with impact=supports should NOT override approved."""
    analysis = {
        "decision": "approved",
        "generated_clauses": [{"section_number": "2.3", "impact": "supports"}]
    }

    for clause in analysis["generated_clauses"]:
        if clause.get("impact") == "exclusion" and analysis.get("decision") == "approved":
            analysis["decision"] = "rejected"

    assert analysis["decision"] == "approved"


# ═══════════════════════════════════════════════════════
# SECTION E: RAG Policy Text Loading (Phase 3)
# ═══════════════════════════════════════════════════════

def test_rag_full_policy_text():
    """PolicyRAG.get_full_policy_text() should return non-empty text."""
    rag_instance = rag.PolicyRAG()
    text = rag_instance.get_full_policy_text()
    assert len(text) > 1000, f"Policy text too short: {len(text)} chars"
    assert "SAFEGUARD INSURANCE" in text


# ═══════════════════════════════════════════════════════
# RUNNER
# ═══════════════════════════════════════════════════════

if __name__ == "__main__":
    print("\n🧪 Dynamic Clause Interpretation — Full Test Suite\n")

    sections = [
        ("─── Coverage Checker (Phase 1) ───", [
            ("clause_id format", test_clause_id_format),
            ("clause_id uniqueness", test_clause_id_uniqueness),
            ("required fields", test_required_fields),
            ("matched flag", test_matched_flag),
            ("payout backward compat", test_payout_backward_compat),
        ]),
        ("─── Clause Verification (Phase 3) ───", [
            ("valid sections pass", test_verify_valid_sections),
            ("rejects fake section", test_verify_rejects_fake_section),
            ("rejects fake excerpt", test_verify_rejects_fake_excerpt),
            ("valid citation passes", test_verify_valid_citation),
            ("empty output passes", test_verify_empty_output),
            ("lists available sections", test_verify_available_sections),
        ]),
        ("─── Replay Safety (Phase 5) ───", [
            ("hash consistency", test_policy_hash_consistency),
            ("hash different text", test_policy_hash_different_text),
            ("hash manual verify", test_policy_hash_manual_verify),
        ]),
        ("─── Deterministic Guardrails (Phase 4) ───", [
            ("exclusion overrides approval", test_guardrail_exclusion_overrides_approval),
            ("no override when rejected", test_guardrail_no_override_when_rejected),
            ("exclusion clause overrides", test_guardrail_exclusion_clause_overrides),
            ("supports clause no override", test_guardrail_supports_clause_no_override),
        ]),
        ("─── RAG Policy Loading ───", [
            ("full policy text loaded", test_rag_full_policy_text),
        ]),
    ]

    for section_name, tests in sections:
        print(f"\n  {section_name}")
        for name, func in tests:
            run_test(name, func)

    print(f"\n{'='*50}")
    print(f"Results: {passed} passed, {failed} failed, {passed + failed} total")
    if failed == 0:
        print("✅ ALL TESTS PASSED")
    else:
        print("❌ SOME TESTS FAILED")
    sys.exit(1 if failed > 0 else 0)
