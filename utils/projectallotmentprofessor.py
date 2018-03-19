# WARNING:There should be no commas in the file except csv delimiters

# This generates data for courses schema.

import json

f = open('faculty.csv', 'r')

finalList = []
added = []

# Index of the corresponding columns in the csv
instructor = 6
department = 4
name = 2

# Start reading file line by line
for line in f.readlines():
	
	# Strip newline and whitespace characters
	line = line.rstrip('\n')
	dataRaw = line.split(',')

	data = [item.strip()for item in dataRaw]
	palist =  {}
	print(data[instructor])
	palist['instructor'] = data[instructor]
	palist['department'] = data[department]
	palist['name'] = data[name]
	palist['head'] = 'false'

	finalList.append(palist)

# Dump the final JSON to output file
f.close()
f = open('professorhead.json', 'w')
json.dump(finalList, f)
f.close()