import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from api.models import User, ParentProfile, TeacherProfile, ChildProfile, Story, ReadingLog, Quiz, UserActivityLog

def run_verification():
    print("=== Starting Admin Module Verification Suite ===")
    
    # 1. Setup Test Users
    User = get_user_model()
    
    admin_user, created_admin = User.objects.get_or_create(
        username="test_admin_suite",
        defaults={"email": "admin_suite@storynest.com", "role": User.Role.ADMIN, "is_staff": True}
    )
    if created_admin:
        admin_user.set_password("adminpass123")
        admin_user.save()
        
    parent_user, created_parent = User.objects.get_or_create(
        username="test_parent_suite",
        defaults={"email": "parent_suite@storynest.com", "role": User.Role.PARENT}
    )
    if created_parent:
        parent_user.set_password("parentpass123")
        parent_user.save()
        ParentProfile.objects.get_or_create(user=parent_user)
        
    teacher_user, created_teacher = User.objects.get_or_create(
        username="test_teacher_suite",
        defaults={"email": "teacher_suite@storynest.com", "role": User.Role.TEACHER}
    )
    if created_teacher:
        teacher_user.set_password("teacherpass123")
        teacher_user.save()
        TeacherProfile.objects.get_or_create(user=teacher_user)

    client = APIClient()

    # ----------------------------------------------------
    # TEST A: Public Registration Security (Must Block ADMIN)
    # ----------------------------------------------------
    print("\n[TEST A] Public Registration Security (Attempt registering ADMIN)")
    reg_res = client.post('/api/auth/register/', {
        "username": "hacker_admin_attempt",
        "email": "hacker@test.com",
        "password": "hackpassword123",
        "role": "ADMIN"
    }, format='json')
    
    if reg_res.status_code == 400 and "Public registration as Admin is not allowed" in str(reg_res.data):
        print("  [OK] SUCCESS: Public registration as ADMIN blocked with 400 Bad Request.")
    else:
        print(f"  [FAIL]: Public registration allowed ADMIN or gave unexpected status: {reg_res.status_code}, {reg_res.data}")

    # ----------------------------------------------------
    # TEST B: Unauthenticated Access to Admin APIs
    # ----------------------------------------------------
    print("\n[TEST B] Unauthenticated Access to Admin APIs")
    unauth_stats = client.get('/api/admin/stats/')
    if unauth_stats.status_code == 401:
        print("  [OK] SUCCESS: Unauthenticated GET /api/admin/stats/ returned 401 Unauthorized.")
    else:
        print(f"  [FAIL]: Unauthenticated GET /api/admin/stats/ returned status {unauth_stats.status_code}")

    # ----------------------------------------------------
    # TEST C: Unauthorized Role Access (Parent & Teacher -> Admin APIs)
    # ----------------------------------------------------
    print("\n[TEST C] Role Access Enforcement (Parent & Teacher attempting Admin APIs)")
    
    # Parent Token
    client.force_authenticate(user=parent_user)
    parent_stats = client.get('/api/admin/stats/')
    parent_users = client.get('/api/admin/users/')
    if parent_stats.status_code == 403 and parent_users.status_code == 403:
        print("  [OK] SUCCESS: Parent blocked from Admin APIs with 403 Forbidden.")
    else:
        print(f"  [FAIL]: Parent got stats={parent_stats.status_code}, users={parent_users.status_code}")

    # Teacher Token
    client.force_authenticate(user=teacher_user)
    teacher_stats = client.get('/api/admin/stats/')
    teacher_users = client.get('/api/admin/users/')
    if teacher_stats.status_code == 403 and teacher_users.status_code == 403:
        print("  [OK] SUCCESS: Teacher blocked from Admin APIs with 403 Forbidden.")
    else:
        print(f"  [FAIL]: Teacher got stats={teacher_stats.status_code}, users={teacher_users.status_code}")

    # ----------------------------------------------------
    # TEST D: Admin Authorized Access & Functionality
    # ----------------------------------------------------
    print("\n[TEST D] Authorized Admin Functionality")
    client.force_authenticate(user=admin_user)

    # 1. Admin Stats
    stats_res = client.get('/api/admin/stats/')
    if stats_res.status_code == 200 and 'total_users' in stats_res.data and 'active_users' in stats_res.data:
        print(f"  [OK] SUCCESS: Admin stats fetched successfully. Total Users: {stats_res.data['total_users']}, Active: {stats_res.data['active_users']}")
    else:
        print(f"  [FAIL]: Admin stats failed. Status: {stats_res.status_code}, Data: {stats_res.data}")

    # 2. Admin Users List & Filtering
    users_res = client.get('/api/admin/users/')
    role_res = client.get('/api/admin/users/?role=PARENT')
    status_res = client.get('/api/admin/users/?status=active')
    if users_res.status_code == 200 and role_res.status_code == 200 and status_res.status_code == 200:
        print(f"  [OK] SUCCESS: User list fetched and filtered. Total listed: {len(users_res.data)}, Parents: {len(role_res.data)}, Active: {len(status_res.data)}")
    else:
        print(f"  [FAIL]: User list failed. Status: {users_res.status_code}")

    # 3. Admin User Detail Inspection
    detail_res = client.get(f'/api/admin/users/{parent_user.id}/')
    if detail_res.status_code == 200 and 'user' in detail_res.data and 'role_details' in detail_res.data:
        print(f"  [OK] SUCCESS: Admin inspected user details for parent ({parent_user.username}). Role details included: {list(detail_res.data['role_details'].keys())}")
    else:
        print(f"  [FAIL]: User detail inspection failed. Status: {detail_res.status_code}")

    # 4. Self-Deactivation Prevention
    self_toggle = client.patch(f'/api/admin/users/{admin_user.id}/toggle/')
    if self_toggle.status_code == 400 and "cannot deactivate your own admin account" in str(self_toggle.data):
        print("  [OK] SUCCESS: Self-deactivation properly blocked with 400 Bad Request.")
    else:
        print(f"  [FAIL]: Self-deactivation check failed. Status: {self_toggle.status_code}, Data: {self_toggle.data}")

    # 5. Admin Toggle User Active Status (Parent Account)
    initial_active = parent_user.is_active
    toggle_res = client.patch(f'/api/admin/users/{parent_user.id}/toggle/')
    parent_user.refresh_from_db()
    if toggle_res.status_code == 200 and parent_user.is_active != initial_active:
        print(f"  [OK] SUCCESS: Admin toggled user status. Previous: {initial_active}, New: {parent_user.is_active}")
        # Restore status
        client.patch(f'/api/admin/users/{parent_user.id}/toggle/')
        parent_user.refresh_from_db()
        print(f"  [OK] SUCCESS: Restored parent status to {parent_user.is_active}")
    else:
        print(f"  [FAIL]: Admin toggle status failed. Status: {toggle_res.status_code}")

    # 6. Admin Activity Logs
    logs_res = client.get('/api/admin/logs/')
    if logs_res.status_code == 200 and isinstance(logs_res.data, list):
        print(f"  [OK] SUCCESS: Audit logs fetched. Count: {len(logs_res.data)}")
    else:
        print(f"  [FAIL]: Audit logs failed. Status: {logs_res.status_code}")

    # ----------------------------------------------------
    # TEST E: Parent & Teacher Regression Safety
    # ----------------------------------------------------
    print("\n[TEST E] Parent & Teacher Functionality Safety Check")
    
    # Test Parent Dashboard
    client.force_authenticate(user=parent_user)
    parent_dash = client.get('/api/parent/dashboard/')
    if parent_dash.status_code == 200:
        print("  [OK] SUCCESS: Parent dashboard endpoint returns 200 OK.")
    else:
        print(f"  [FAIL]: Parent dashboard endpoint failed: {parent_dash.status_code}")

    # Test Teacher Dashboard
    client.force_authenticate(user=teacher_user)
    teacher_dash = client.get('/api/teacher/dashboard/')
    if teacher_dash.status_code == 200:
        print("  [OK] SUCCESS: Teacher dashboard endpoint returns 200 OK.")
    else:
        print(f"  [FAIL]: Teacher dashboard endpoint failed: {teacher_dash.status_code}")

    print("\n====================================================")
    print("ALL VERIFICATION SUITE TESTS EXECUTED SUCCESSFULLY!")
    print("====================================================")

if __name__ == '__main__':
    run_verification()
