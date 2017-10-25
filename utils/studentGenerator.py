# WARNING: There should be no commas in the file except csv delimiters

# This generates data for students schema.

import json

f = open('Students.csv')

added = []
finalList = []

# Index of the corresponding columns in the csv
idNumberIndex = 0
nameIndex = 1
courseIndex = 2
sectionIndex = 3
emailIndex = 4

# Start reading line by line
for line in f.readlines():

	# Strip trailing whitespace and newline characters
	dataRaw = line.rstrip('\n').split(',')
	data = [item.strip() for item in dataRaw]

	#Check if student is not already added to the final list
	if data[idNumberIndex] not in added:

		# Add if not added
		student = {}
		student['name'] = data[nameIndex]
		student['email'] = data[emailIndex]
		student['idNumber'] = data[idNumberIndex]
		student['courses'] = [{'courseId': data[courseIndex], 'sections': [data[sectionIndex]]}]

		added.append(student['idNumber'])
		finalList.append(student)

	else:

		# Update if already added

		for student in finalList:

			if student['idNumber'] == data[idNumberIndex]:

				# Found in final list

				flag = 0

				for course in student['courses']:

					# Search if current course is already in student's courses array

					if course['courseId'] == data[courseIndex]:

						# Add new section if course is found
						flag = 1
						course['sections'].append(data[sectionIndex])

				if flag == 0:
					
					# Create a new course in student's array if not already there
					student['courses'].append({'courseId': data[courseIndex], 'sections': [data[sectionIndex]]})

f.close()
f = open('students.json', 'w')

# Dump JSON to output file
json.dump(finalList, f)
f.close()