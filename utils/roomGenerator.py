import tabula
import json

startPage = 2
endPage = 20

rooms = []

for pageNumber in range(startPage, endPage + 1):

	print("********************************************")
	print("\nReading page : " + str(pageNumber) + "\n")

	room = {}

	df = tabula.read_pdf("room_map.pdf", pages=pageNumber, lattice=True, pandas_options={'header': None})

	room['lectureCapacity'] = int(df.iloc[1][1])
	room['examCapacity'] = int(df.iloc[1][2])
	room['number'] = df.iloc[0][0].split('\r')[1]
	room['type'] = df.iloc[1][0].split('\r')[1]
	room['fixedClasses'] = []

	for i in range(3,9):

		day = []

		for j in range(1,11):

			val = str(df.iloc[i][j])

			if(val != "nan"):
				day.append(val.split("\r")[0])

			else:
				day.append("")

		room['fixedClasses'].append(day)
	
	room['fixedClasses'].append(["", "", "", "", "", "", "", "", "", ""])

	print("\nParsed Room: " + room['number'] + "\n")
	print("********************************************")
	rooms.append(room)

# Dump to JSON
f = open('rooms.json', 'w')
json.dump(rooms, f)
f.close()