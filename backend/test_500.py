from api.models import User
from rest_framework.test import APIClient
import sys

def run_test():
    c = APIClient()
    user = User.objects.filter(role='TEACHER').first()
    if not user:
        print("No teacher user found.")
        sys.exit(1)

    c.force_authenticate(user=user)

    print("GET /api/teacher/stories/")
    try:
        res = c.get('/api/teacher/stories/')
        print(res.status_code)
        print(res.content.decode('utf-8'))
    except Exception as e:
        import traceback
        traceback.print_exc()

    print("\nGET /api/teacher/stories/recommended/")
    try:
        res2 = c.get('/api/teacher/stories/recommended/')
        print(res2.status_code)
        print(res2.content.decode('utf-8'))
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    run_test()
