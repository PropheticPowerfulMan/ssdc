import json
from pathlib import Path

def test_identity_provider_configures_temporary_three_failure_lockout():
    realm=json.loads((Path(__file__).resolve().parents[3]/"infrastructure/keycloak/ssdc-realm.json").read_text(encoding="utf-8"))
    assert realm["bruteForceProtected"] is True
    assert realm["permanentLockout"] is False
    assert realm["failureFactor"] == 3
    assert realm["waitIncrementSeconds"] == 300
    assert realm["maxFailureWaitSeconds"] == 900
    assert realm["maxDeltaTimeSeconds"] > realm["maxFailureWaitSeconds"]
    assert realm["quickLoginCheckMilliSeconds"] == 0
