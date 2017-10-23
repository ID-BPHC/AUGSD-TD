# WARNING: There should be no commas in the file except csv delimiters

# This generates data for admins schema.

import json

f = open('Timetable.csv')

addedFaculty = []
finalList = []

# Index of the corresponding columns in the csv
facultyEmailIndex = 5
facultyNameIndex = 4

# Start reading line by line
for line in f.readlines():

	# Strip trailing whitespace and newline characters
	line = line.rstrip('\n')
	dataRaw = line.split(',')
	data = [item.strip() for item in dataRaw]
	data[facultyNameIndex] = data[facultyNameIndex].strip().strip('.').strip().title()
	data[facultyEmailIndex] = data[facultyEmailIndex].strip()

	#Check if already added faculty to final list
	if data[facultyEmailIndex] not in addedFaculty:

		# Add if not added
		faculty = {}
		faculty['name'] = data[facultyNameIndex]
		faculty['email'] = data[facultyEmailIndex]
		faculty['portals'] = ['feedback']
		faculty['home'] = '/feedback'
		faculty['superUser'] = False

		addedFaculty.append(faculty['email'])
		finalList.append(faculty)

# Dump JSON to output file
f.close()
f = open('admin.json', 'w')
json.dump(finalList, f)