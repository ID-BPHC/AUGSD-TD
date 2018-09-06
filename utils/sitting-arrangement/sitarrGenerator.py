#This file generates the sitting arrangement for the mid-semester and comprehensive examination.
#Save the csv file as room.csv, course.csv in the same location as this file and then run the script.
#Format of the room.csv file is: Room no, Exam capacity and that of course.csv: Course ID, Course Name, Exam date, Exam timings, Student's ID, Name of the Student

import csv
from datetime import datetime
# from reportlab.platypus import BaseDocTemplate, SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
# from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
# from reportlab.lib.pagesizes import letter
# from reportlab.lib.units import inch
# from reportlab.lib import colors
# #from WebKit.Page import Page
# from time import strftime
# from cStringIO import StringIO
# import datetime
# styles = getSampleStyleSheet()

room = "room.csv"
student = "student.csv"
exam = "exam.csv"

dates = []
roomfields, studentfields, examfields = [], [], []
rooms, students, exams = [], [], [] 
pExam = []
examstudents = []

#Room list 
with open(room, 'r') as room:
	roomreader = csv.reader(room)

	roomfields = next(roomreader)
	roomfields.append('vacancy')

	for row in roomreader:
		row[1] = int(row[1])
		row.append(row[1])
		rooms.append(row)

#Students list
with open(student, 'r') as stu:
	stureader = csv.reader(stu)
	
	studentfields = next(stureader)
	studentfields.append(room)
	
	for row in stureader:
		row.append("")
		students.append(row)

#course exam dates and time list
with open(exam, 'r') as exam:
	examreader = csv.reader(exam)
	
	examfields = next(examreader)
	examfields.append("stuNum")
	examfields.append("room")
	
	for row in examreader:
		row[2] = datetime.strptime(row[2], '%d-%m-%Y')
		exams.append(row)
exams.sort(key = lambda x:x[2])

#Exam dates(distinct) list
for exam in exams:
	if not exam[2] in dates:
		dates.append(exam[2])


#COUNTS THE NUMBER OF STUDENTS REGISTERED IN THE COURSE
def stucounter(exam):		
	count = sum(1 for student in students if student[2] == exam[0])		
	return count


#ROOM SET 
xs, s, m, l, xl = [], [], [], [], []
for room in rooms:
	if room[0].startswith("G"):
		l.append(room)
	if room[0].startswith("F") or room[0].startswith("G"):
		xl.append(room)
	if room[0].startswith("F1") :
		m.append(room)	
	if room[1]<30:
		xs.append(room)
	elif room[1] >30 and room[1]<50:
		s.append(room)


def roomallot(exam):
	if exam[4]<30:
		return [xs,s,m,l,xl] 
	elif exam[4]>30 and exam[4]<100:
		return [s,xs,m,l,xl]
	elif exam[4]>100 and exam[4]<450:
		return [m,s,xs,l,xl]
	elif exam[4]>450 and exam[4]<600:
		return [l,m,s,xs,xl]
	else: 
		return [xl,l,m,s,xs]

#ROOM ALLOTMENT
def fillstudent(exam,room,examstudents):
	for student in examstudents:
		if exam[4] == 0 or room[2] == 0:
			break
		if student[2] == exam[0] and student[3] == "":
			student[3] = room[0]
			room[2] -= 1
			exam[4] -= 1	
				


#ALGORITHM
for date in dates:
	for session in ["AN", "FN"]: 
		pExam.clear()
		for exam in exams:
			if exam[2]==date and exam[3] ==session:
				pExam.append(exam)
		
		for exam in pExam: 
			exam.append(stucounter(exam))

		pExam.sort(key = lambda x:x[4])
		pExam.reverse()

		for exam in pExam:
			examstudents.clear()
			
			for student in students:
				if student[2] == exam[0]:
					examstudents.append(student)
			
			examstudents.sort()
			allot = roomallot(exam)
			for roomset in allot:
					
				if exam[4] == 0:
					break
				
				for room in roomset:
					if exam[4]==0:
						break
					if room[2] == 0:
						continue
					if exam[4]<=room[2]:
						fillstudent(exam, room, examstudents)
						break
					else:
						fillstudent(exam, room, examstudents)







