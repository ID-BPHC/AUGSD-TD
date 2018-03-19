# WARNING:There should be no commas in the file except csv delimiters

# This generates data for courses schema.

import json

f = open('palist.csv', 'r')

finalList = []
added = []

# Index of the corresponding columns in the csv
studentID = 0
courseType = 1
courseCode = 2

# Start reading file line by line
for line in f.readlines():
	
	# Strip newline and whitespace characters
	line = line.rstrip('\n')
	dataRaw = line.split(',')

	data = [item.strip()for item in dataRaw]
	palist =  {}
	palist['studentID'] = data[studentID]
	palist['courseType'] = data[courseType]
	palist['courseCode'] = data[courseCode]

	finalList.append(palist)

# Dump the final JSON to output file
f.close()
f = open('palist.json', 'w')
json.dump(finalList, f)
f.close()