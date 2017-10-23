# WARNING: There should be no commas in the file except csv delimiters

import json

f = open('Timetable.csv', 'r')

finalList = []
added = []

# Index of the corresponding columns in the csv
courseIdIndex = 1
courseNameIndex = 2
sectionIndex = 3
instructorEmailIndex = 5

# Start reading file line by line
for line in f.readlines():
	
	# Strip newline and whitespace characters
	line = line.rstrip('\n')
	dataRaw = line.split(',')

	data = [item.strip() for item in dataRaw]

	# Add the course to final list if not present
	if(data[courseIdIndex] not in added):

		course = {}
		course['courseID'] = data[courseIdIndex]
		course['name'] = data[courseNameIndex]
		course['ic'] = ''
		course['sections'] = [{"section": data[sectionIndex], "instructors": [data[instructorEmailIndex]]}]

		finalList.append(course)
		added.append(course['courseID'])

	# Update the course in final list if already present
	else:

		# Find the course
		for course in finalList:
			if(course['courseID'] == data[courseIdIndex]):

				# Found the course in list
				flag = 0

				# Check if section being added is already present in the course
				for section in course['sections'] :
					if(section["section"] == data[sectionIndex]):
						# Append instructor if section is found
						section["instructors"].append(data[instructorEmailIndex])
						flag = 1

				# Make a new section if not already present
				if flag == 0: 
					course['sections'].append({"section": data[sectionIndex], "instructors": [data[instructorEmailIndex]]})


# Dump the final JSON to output file
f.close()
f = open('Timetable.json', 'w')
json.dump(finalList, f)
f.close()