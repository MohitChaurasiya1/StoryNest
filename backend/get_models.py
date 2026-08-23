from api.models import ReadingLog, ReadingSession, QuizAttempt
print('ReadingLog:', [f.name for f in ReadingLog._meta.fields])
print('ReadingSession:', [f.name for f in ReadingSession._meta.fields])
print('QuizAttempt:', [f.name for f in QuizAttempt._meta.fields])
