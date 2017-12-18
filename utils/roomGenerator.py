# This generated data for rooms schema

# WARNING : There should be no line breaks / carriage returns in the csv except the ones at the end

import json

#Config

lectureCapacityIndex = 7
examCapacityIndex = 9

f = open('map.csv')
currentLine = 1
rooms = []
room = {}
room['fixedClasses'] = []

#Read file line by line

for line in f.readlines():

	# Strip new line characters at end
	line = line.rstrip('\n')
	data = line.split(',')

	# Reset the line counter and room object after each room (Assumed each room has 9 lines in map csv)
	if currentLine == 10:
		rooms.append(room)
		room = {}
		room['fixedClasses'] = []
		currentLine = 1

	# Fetch room number from first line
	if currentLine == 1:
		room['number'] = data[0][7:].strip()

	# Fetch room capacities from second line
	elif currentLine == 2:
		room['type'] = data[0][4:].strip()
		room['lectureCapacity'] = int(data[lectureCapacityIndex])
		room['examCapacity'] = int(data[examCapacityIndex])

	# Fetch fixed classes from remaining lines
	elif currentLine > 3:
		# Append room to the final list
		room['fixedClasses'].append(data[1:])

	currentLine = currentLine + 1

f.close()

# Dump to JSON
f = open('rooms.json', 'w')
json.dump(rooms, f)
f.close()