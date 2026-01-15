import pytest
from app.policies.base import UserContext, MaterialContext, Action, Role, VisibilityScope
from app.policies.engine import evaluate

def test_cross_department_access_denied():
    user = UserContext(user_id="u1", role=Role.STUDENT, department_id="CS", level=1)
    material = MaterialContext(id="m1", department_id="BIO", level=1, visibility_scope=VisibilityScope.DEPARTMENT)
    
    # Download check
    decision = evaluate(user, Action.DOWNLOAD, material)
    assert decision.allowed is False
    assert "department materials" in decision.reason

def test_higher_level_access_denied():
    user = UserContext(user_id="u1", role=Role.STUDENT, department_id="CS", level=1)
    material = MaterialContext(id="m1", department_id="CS", level=2, visibility_scope=VisibilityScope.DEPARTMENT)
    
    decision = evaluate(user, Action.DOWNLOAD, material)
    assert decision.allowed is False
    assert "Insufficient level" in decision.reason

def test_global_searchable_override():
    user = UserContext(user_id="u1", role=Role.STUDENT, department_id="CS", level=1)
    material = MaterialContext(id="m1", department_id="CS", level=10, visibility_scope=VisibilityScope.GLOBAL_SEARCHABLE)
    
    decision = evaluate(user, Action.DOWNLOAD, material)
    assert decision.allowed is True
    assert "visibility" in decision.reason

def test_admin_download_override():
    user = UserContext(user_id="u1", role=Role.ADMIN, department_id="ADMIN", level=1)
    # Admin from different department (or matching) should be allowed if the policy says so
    # The rule says: material.department_id == user.department_id AND (librarian or admin)
    # Wait, the rule for Download says: material.department_id == user.department_id AND (level <= user.level OR GLOBAL or librarian/admin)
    # Let's check the requirement 4 again.
    # Download (Critical): Allowed if material.dept == user.dept AND one of: level <= user.level, visibility == GLOBAL, role in {librarian, admin}
    # This means admin must be in the same department? Usually admins are global.
    # Requirement 4 says "material.department_id == user.department_id AND one of...".
    
    user_cs_admin = UserContext(user_id="a1", role=Role.ADMIN, department_id="CS", level=1)
    material_cs_lvl5 = MaterialContext(id="m1", department_id="CS", level=5, visibility_scope=VisibilityScope.DEPARTMENT)
    
    decision = evaluate(user_cs_admin, Action.DOWNLOAD, material_cs_lvl5)
    assert decision.allowed is True

def test_librarian_download_override():
    user = UserContext(user_id="l1", role=Role.LIBRARIAN, department_id="CS", level=1)
    material = MaterialContext(id="m1", department_id="CS", level=5, visibility_scope=VisibilityScope.DEPARTMENT)
    
    decision = evaluate(user, Action.DOWNLOAD, material)
    assert decision.allowed is True

def test_upload_allowed_student_same_dept():
    user = UserContext(user_id="s1", role=Role.STUDENT, department_id="CS", level=1)
    material = MaterialContext(id="m1", department_id="CS", level=1, visibility_scope=VisibilityScope.DEPARTMENT)
    
    decision = evaluate(user, Action.UPLOAD, material)
    assert decision.allowed is True

def test_upload_denied_student_diff_dept():
    user = UserContext(user_id="s1", role=Role.STUDENT, department_id="CS", level=1)
    material = MaterialContext(id="m1", department_id="BIO", level=1, visibility_scope=VisibilityScope.DEPARTMENT)
    
    decision = evaluate(user, Action.UPLOAD, material)
    assert decision.allowed is False

def test_metadata_view_same_dept():
    user = UserContext(user_id="s1", role=Role.STUDENT, department_id="CS", level=1)
    material = MaterialContext(id="m1", department_id="CS", level=5, visibility_scope=VisibilityScope.DEPARTMENT)
    
    decision = evaluate(user, Action.VIEW_METADATA, material)
    assert decision.allowed is True
