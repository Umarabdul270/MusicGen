from typing import Any
from .base import UserContext, Action, PolicyDecision, MaterialContext
from .material import check_material_policy

def evaluate(user_context: UserContext, action: Action, resource_context: Any) -> PolicyDecision:
    """
    Main entry point for authorization evaluation.
    Determines if a user is allowed to perform an action on a resource.
    """
    
    # Material policies
    if isinstance(resource_context, MaterialContext):
        return check_material_policy(user_context, action, resource_context)
    
    # Add other resource type evaluations here as the system grows
    
    return PolicyDecision(allowed=False, reason="Unknown resource type or unhandled policy.")
