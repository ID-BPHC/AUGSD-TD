# importing csv module
import csv
from reportlab.platypus import BaseDocTemplate, SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
#from WebKit.Page import Page
from time import strftime
from cStringIO import StringIO
import datetime
styles = getSampleStyleSheet()
 
# csv file name
filename = "PROJECT_FINAL_UPDATED_1.csv"
 
# initializing the titles and rows list
fields = []
rows = []
 
# reading csv file
with open(filename, 'r') as csvfile:
    # creating a csv reader object
    csvreader = csv.reader(csvfile)
     
    # extracting field names through first row
    fields = csvreader.next()
 
    # extracting each data row one by one
    for row in csvreader:
        rows.append(row)
 
    # get total number of rows
    print("Total no. of rows: %d"%(csvreader.line_num))
 
# printing the field names
print('Field names are:' + ', '.join(field for field in fields))
 
#  printing first 5 rows
print('\nFirst 5 rows are:\n')
for row in rows[:5]:
    # parsing each column of a row
    for col in row:
        print("%10s , "%col),
    print('\n')

instructors = []
data = []

for row in rows :
    if row[2] in instructors :
        data[instructors.index(row[2])].append(row)
    else :
        instructors.append(row[2])
        data.append([row])
#making table
for row in data : 
    for col in row :
        if len(col) == 6 :
            del col[5]
        del col[4]
        del col[2]

for row in data :
    row.insert(0,["ID Number","NAME","COURSE CODE"])
    
# print(data[0])

i = 0

for instructor in instructors :  
    column1Heading = "ID Number"
    column2Heading = "Name"
    column3Heading = "Course Code"
    name = "Dear "+ instructor+ ","
    heading1 = "FIRST SEMESTER 2018-2019"
    heading2 = "LIST OF ALLOTED PROJECT STUDENTS"
    para = "The following is the allotted list of project students under your guidance during First Semester \n 2018-19. There is a possibility that some of the allotted project students may not register for the same. The final list of registered students will be sent to the IC of the respective project type course. In case of any discrepancy, please contact Dr. Balaji Gopalan, In-charge, Project Allotment (Extn: 575) or email at gbalaji@hyderabad.bits-pilani.ac.in. "
    datetoday = datetime.datetime.today().strftime('%d-%m-%Y')
    elements = []
    
    ptext = '<font size=12>%s</font>' % name
    head1text = '<font>%s</font>' % heading1
    head2text = '<font>%s</font>' % heading2
    paratext = '<font size=12>%s</font>' % para
    date = '<para align="right"><font>%s</font></para>' % datetoday

    elements.append(Paragraph(head1text, styles["title"])) 
    elements.append(Spacer(1, 12))
    elements.append(Spacer(1, 12)) 

    elements.append(Paragraph(head2text, styles["title"])) 
    elements.append(Spacer(1, 12))
    elements.append(Spacer(1, 12)) 

    elements.append(Paragraph(date, styles["Normal"])) 
    elements.append(Spacer(1, 12))

    elements.append(Paragraph(ptext, styles["Normal"])) 
    elements.append(Spacer(1, 12))
    
    elements.append(Paragraph(paratext, styles["Normal"])) 

    elements.append(Spacer(1, 12)) 
    elements.append(Spacer(1, 12)) 



    doc = SimpleDocTemplate(("./projectpdf/"+ instructor + " .pdf"), pagesize=letter)
    
    GRID_STYLE = TableStyle(
              [('GRID', (0,0), (-1,-1), 0.25, colors.black),
                    ('ALIGN', (1,1), (-1,-1), 'LEFT')]
              )
                  
    # container for the 'Flowable' objects
   
    t=Table(data[i])
    t.setStyle(GRID_STYLE)
    i = i+1
    elements.append(t)
    doc.build(elements)
