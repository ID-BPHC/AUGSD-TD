#FOLLOW THE INSTRUCTIONS GIVEN BELOW :

#This file generates the sitting arrangement for the mid-semester and comprehensive examination.
#Save the csv file as room.csv, student.csv, course.csv in the same location as this file and then run the script by typing the following in the console: python sitarrGenerator.py
#Follow the order of the Columns of the following files :(NO EXTRA COLUMNS SHOULD BE PRESENT)

#room.csv: room no. , exam capacity
#student.csv: student id, student name, course ID they are enrolled in(one at a time)
#exam.csv: course id, course code, course name, date of the exam, session of the exam, rooms alloted, number of students registered

import csv
from datetime import datetime
from reportlab.pdfgen import canvas
from reportlab.platypus import BaseDocTemplate, SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Frame, PageTemplate, NextPageTemplate
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from functools import partial

room = "RoomCapacity.csv"
student = "student.csv"
exam = "TT.csv"

dates = [] # list containg the dates on which exams are conducted
roomfields, studentfields, examfields = [], [], [] # list containing the heading of the columns of the respective lists
rooms, students, exams = [], [], [] # list containg the data imported from csv files mentioned above.
pExam = [] # a dynamic list containing the information of the exams conducted at a particular date and session.
examstudents = [] # a dynamic list containing the info of the students enrolled in a particular course.
sitting = [] #final list output

headings = ["Course ID", "Course name", "Date", "Session", "Room", "Number", "Starting ID", "Ending ID"]
sitting.append(headings)

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
	studentfields.append("room")
	
	for row in stureader:
		row.append("")
		row[2] = row[2].replace(" ", "")
		students.append(row)

#course exam dates and time list
with open(exam, 'r') as exam:
	examreader = csv.reader(exam)
	
	for heading in ["courseId", "CourseName", "Date", "Session","RoomsAlloted","NoOfStudents"]:
		examfields.append(heading)
	
	for row in examreader:
		row[0] = row[0].replace(" ","") + row[1].replace(" ", "")
		del row[1]
		if not row[2] == "*":
			row[4] = row[4].replace(" ","")
			row[5]=row[5].replace(",","")
			row[5] = int(row[5])
			row.append([])
			exams.append(row)

exams.sort(key = lambda x:x[2])

#Exam dates(distinct) list
for exam in exams:
	if not exam[2] in dates:
		dates.append(exam[2])
# print(dates)


#COUNTS THE NUMBER OF STUDENTS REGISTERED IN THE COURSE
# def stucounter(exam):		
# 	count = sum(1 for student in students if student[2] == exam[0])			
# 	return count

#COUNTS THE NUMBER OF STUDENTS IN A PARTICULAR ROOM ENROLLED IN A PARTICULAR COURSE
def sturoomcounter(cid, room):		
	count = sum(1 for student in students if student[2] == cid and student[3]==room)			
	return count

#ROOM SET 
# xs, s, m, l, xl = [], [], [], [], []
# for room in rooms:
# 	if room[0].startswith("G"):
# 		l.append(room)
# 	if room[0].startswith("F") or room[0].startswith("G"):
# 		xl.append(room)
# 	if room[0].startswith("F1") :
# 		m.append(room)	
# 	if room[1]<30:
# 		xs.append(room)
# 	elif room[1] >30 and room[1]<50:
# 		s.append(room)

# def roomallot(exam):
# 	if exam[4]<30:
# 		return [xs,s,m,l,xl] 
# 	elif exam[4]>30 and exam[4]<100:
# 		return [s,xs,m,l,xl]
# 	elif exam[4]>100 and exam[4]<450:
# 		return [m,s,xs,l,xl]
# 	elif exam[4]>450 and exam[4]<600:
# 		return [l,m,s,xs,xl]
# 	else: 
# 		return [xl,l,m,s,xs]

# ROOM REFRESHMENT
def roomrefresh():
	for room in rooms:
		room[2] = room[1]



#ROOM ALLOTMENT
def fillstudent(exam,room,examstudents, counter, roomrange):
	for student in examstudents:

		if exam[5] == 0 or room[2] == 0:
			break
		
		if student[2] == exam[0] and student[3] == "":
			student[3] = room[0]
			room[2] -= 1
			exam[5] -= 1	

			if counter ==0: 
				startstudent = student[0]
				counter = 1
			
			if exam[5] == 0 or room[2] == 0:
				roomrange.append([exam[0],room[0], startstudent, student[0]])
				exam[6].append(roomrange)
				break
			
				


#ALGORITHM
for date in dates:
	for session in ["9.00 -- 10.30 AM","11.00 -- 12.30 PM","1.30 -- 3.00 PM","3.30 -- 5.00 PM"]: 
		pExam.clear()
		roomrefresh()
		for exam in exams:
			if exam[2]==date and exam[3] ==session:
				pExam.append(exam)
		
		#for exam in pExam: 
		# 	exam.append(stucounter(exam))
		# 	exam.append([])

		pExam.sort(key = lambda x:x[5])

		for exam in pExam:
			examstudents.clear()

			
			for student in students:
				if student[2] == exam[0]:
					examstudents.append(student)
			
			examstudents.sort()
			# allot = roomallot(exam)
			# for roomset in allot:
					
			# 	if exam[4] == 0:
			# 		break
			roomset= exam[4].split(",")
			allotrooms = []
			for room in rooms:
				if room[0] in roomset:
					allotrooms.append(room)
			allotrooms.sort(key = lambda x:x[2])
			allotrooms.reverse()
			for room in allotrooms:
				room[0].replace(" ","")
				roomrange = []
				counter = 0
				if exam[5]==0:
					break
				if room[2] == 0:
					continue
				if exam[5]<=room[2]:
					fillstudent(exam, room, examstudents, counter,roomrange)
					break
				else:
					fillstudent(exam, room, examstudents, counter,roomrange)


exams.sort()
# for exam in exams:
# 	print(exam)


for exam in exams:
	for allot in exam[6]:
		sitting.append([exam[0], exam[1], exam[2], exam[3], allot[0][1],str(sturoomcounter(exam[0], allot[0][1])), allot[0][2], allot[0][3]])


repeatid = []
for subject in sitting:
	if subject[0] == "Course ID":
		continue
	if subject[0] in repeatid:
		subject[0], subject[1], subject[2], subject[3] = "", "", "", ""
	else:
		repeatid.append(subject[0])


#WRITING THE PDF FILE OF SITTING ARRANGEMENT
doc = SimpleDocTemplate(("sitting-arrangement.pdf"), pagesize=A4)
t = Table(sitting, repeatRows= 1, 
	style= [('GRID',(0,0),(-1,-1),1,colors.black),
			('FONTSIZE',(0,0),(-1,-1),6)])
elements = []
elements.append(t)
doc.build(elements)
print("The file is created as sitting-arrangement.pdf.")

