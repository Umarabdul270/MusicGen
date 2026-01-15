from .base import UserContext, MaterialContext, Action, Role, PolicyDecision, VisibilityScope

def check_material_policy(user: UserContext, action: Action, material: MaterialContext) -> PolicyDecision:
    # Deny by default
    decision = PolicyDecision(allowed=False, reason="Action not permitted by default.")

    # Rule: UPLOAD
    if action == Action.UPLOAD:
        if user.role in [Role.STUDENT, Role.LIBRARIAN] and material.department_id == user.department_id:
            return PolicyDecision(allowed=True, reason="Upload allowed for students and librarians within their department.")
        return PolicyDecision(allowed=False, reason="Upload restricted to department students and librarians.")

    # Rule: VIEW_METADATA
    # Note: Handled as a single action, applying the broader "Department Library" rule if applicable, 
    # but the prompt lists them separately. I will allow if department matches for general metadata view.
    if action == Action.VIEW_METADATA:
        if material.department_id == user.department_id:
             return PolicyDecision(allowed=True, reason="Metadata view allowed within department.")
        return PolicyDecision(allowed=False, reason="Metadata view restricted to department members.")

    # Rule: DOWNLOAD
    if action == Action.DOWNLOAD:
        if material.department_id != user.department_id:
            return PolicyDecision(allowed=False, reason="Download restricted to department materials.")
        
        # Additional conditions for download
        if (material.level <= user.level or 
            material.visibility_scope == VisibilityScope.GLOBAL_SEARCHABLE or 
            user.role in [Role.LIBRARIAN, Role.ADMIN]):
            return PolicyDecision(allowed=True, reason="Download authorized based on level, visibility, or role.")
        
        return PolicyDecision(allowed=False, reason="Insufficient level or visibility for download.")

    # Rule: DELETE
    if action == Action.DELETE:
        if user.role == Role.ADMIN or (user.role == Role.LIBRARIAN and material.department_id == user.department_id):
            return PolicyDecision(allowed=True, reason="Delete allowed for admins or department librarians.")
        return PolicyDecision(allowed=False, reason="Delete restricted to admins and department librarians.")

    return decision
