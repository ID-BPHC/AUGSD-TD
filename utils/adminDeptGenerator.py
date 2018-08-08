# WARNING: There should be no commas in the file except csv delimiters

# This generates data for admins schema.

import json

f = open('departments.csv')

addedDepartment = []
finalList = []

# Index of the corresponding columns in the csv
departmentEmailIndex = 1
departmentNameIndex = 0

# Start reading line by line
for line in f.readlines():

	# Strip trailing whitespace and newline characters
	line = line.rstrip('\n')
	dataRaw = line.split(',')
	data = [item.strip() for item in dataRaw]
	data[departmentNameIndex] = data[departmentNameIndex].strip().strip('.').strip()
	data[departmentEmailIndex] = data[departmentEmailIndex].strip()

	#Check if not already added department to final list
	if data[departmentEmailIndex] not in addedDepartment:

		# Add if not added
		department = {}
		department['name'] = data[departmentNameIndex]
		department['email'] = data[departmentEmailIndex]
		department['portals'] = ['room-booking-faculty']
		department['home'] = '/'
		department['superUser'] = False

		addedDepartment.append(department['email'])
		finalList.append(department)

# Dump JSON to output file
f.close()
f = open('departments.json', 'w')
json.dump(finalList, f)
f.close()
