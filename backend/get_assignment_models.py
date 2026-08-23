from api.models import ClassAssignment, ClassAssignmentStudent
print('ClassAssignment:', [f.name for f in ClassAssignment._meta.fields])
print('ClassAssignmentStudent:', [f.name for f in ClassAssignmentStudent._meta.fields])
