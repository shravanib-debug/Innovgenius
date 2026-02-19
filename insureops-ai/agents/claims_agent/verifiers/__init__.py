from .health_verifier import HealthVerifier
from .vehicle_verifier import VehicleVerifier
from .travel_verifier import TravelVerifier
from .property_verifier import PropertyVerifier
from .life_verifier import LifeVerifier

def get_verifier(insurance_type: str):
    """Factory to return the correct verifier instance."""
    types = {
        "health": HealthVerifier,
        "vehicle": VehicleVerifier,
        "travel": TravelVerifier,
        "property": PropertyVerifier,
        "life": LifeVerifier
    }
    
    verifier_class = types.get(insurance_type.lower())
    if verifier_class:
        return verifier_class()
    return None
