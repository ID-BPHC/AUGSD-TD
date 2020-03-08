# Timetable Division | AUGS Division [![Build Status](https://api.travis-ci.com/ID-BPHC/AUGSD-TD.svg?branch=master)](https://travis-ci.com/ID-BPHC/AUGSD-TD)
Timetable Division and AUGS Divsion are sub-divisions of BITS Pilani Hyderabad Campus. They together oversee operations pertaining to Academic Instructor Feedback, Content Management System, Student Coursework, Biometric Attendance and Teaching Assistantship and formalizing Student-Professor projects.

This project is live at : https://td.bits-hyderabad.ac.in/ , https://augsd.bits-hyderabad.ac.in/

## Technology Stack
1. NodeJS
1. MongoDB

## Setup Instructions
1. Install NodeJS & MongoDB
1. Install redis server
1. Run MongoDB Instance
1. Navigate to the project directory
1. Create a copy of `config.template.js` as `config.js`
1. Add the required details in `config.js`
1. Run `redis-server` | Ensure `redis-server` is running
1. Run `npm install`
1. Run `npm start`
1. Navigate to `http://localhost:3000`

### Grunt Details
* Use `grunt` in terminal to check for linter / prettier errors
* Use `grunt fix` in terminal for fixing auto-fixable linter / prettier errors

## Project Structure

The project follows a portal based structure. Timetable Division provides it's services in the form of web portals which can be enabled/disabled from time to time. The current state of a portal is stored in a MongoDB collection (`portals`). 

#### Portal Types
1. Admin Portals `routes/admin/portals` & `views/admin/portals`
1. Student Portals `routes/dashboard/portals` & `views/dashboard/portals`

#### User Types
1. `SuperUsers` - Can access any portal in the admin area regardless of the fact that it is enabled or disabled at that time.
1. `Admins` - Can only access the portals as specified by the `portals` array in the corresponding document in `admins` collection.
1. `Students` - Can access the activated portals of student area.

#### Access Table

|                             | Superuser     | Admin                                       |Student        |
| --------------------------- |:-------------:|:-------------------------------------------:|:-------------:|
| Activated Admin Portal      |Yes            |Yes (But determined by `portals` array)      |No             |
| Deactivated Admin Portal    |Yes            |No                                           |No             |
| Activated Student Portal    |No             |No                                           |Yes            |
| Deactivated Student Portal  |No             |No                                           |No             |

## Config and Views
While the general configuration is same for both of the sites, an option `siteMode` has been added in config file which takes two values `TD` and `AUGSD`. This option enables the selection of the folder `AUGSD` or `TD` in the `views` directory from which the views will be rendered.

## Portals 
Portals are different for TD and AUGSD.
#### **TIMETABLE DIVISION**
##### Admin Portals
1. `control` - For managing site administration (Enabling/Disabling) other portals, Add holidays for room booking, Switching users
2. `room-booking-approval` - For SWD / TD to approve room booking requests
3. `room-booking-esd` - For ESD to get the list of approved room bookings
4. `room-booking-faculty` - For professors / staff member to initiate a room booking request

##### Student Portals
1. `inductions` - For inducting new students to the TD team :P
2. `room-booking-student` - For students to initiate a room booking request
####
#### **AUGS DIVISION**
##### Admin Portals
1. `control` - For managing site administration (Enabling/Disabling) other portals, Add holidays for room booking, Switching users
2. `feedbacks-admin` - For viewing all the feedbacks received
3. `feedbacks-prof` - Shows feedback of currently logged in admin.
4. `project-allotment-prof-create` - For professors to create projects
5. `project-applications` - For professors to Approve / Reject project applications
6. `project-list` - To Export the final CSV after the project allotment process is complete
7. `analytics` - For Registration Advisors to track students progress over a period of semsters (includes functionality for AUGSD to populate databse through CSV files).

##### Student Portals
1. `feedbacks-24x7` - For provding 24x7 feedback for courses
2. `feedbacks-midsem` - For providing Mid-Semester feedback for courses
3. `project-allotment-student` - For applying to projects offered by various departments
##### Under Development
1. Online teacher Assistantship Application - (`ta-app-ic`, `ta-application`)
###
## Utils
Several housekeeping utilities can be found in `utils` directory
1. `adminFacultyGenerator.py` generates the Faculty JSON data from CSV for `admins` schema.
1. `adminDeptGenerator.py` generates the Department JSON data from CSV for `admins` schema.
1. `courseGenerator.py` generates the JSON data from CSV for `courses` schema.
1. `roomGenerator.py` generates the JSON data from CSV for `rooms` schema.
1. `studenteGenerator.py` generates the JSON data from CSV for `students` schema.
1. `mailer.js` provides a method to send emails using the tokens provided in `config.js`.
1. `rebuildDatabase` drops the existing database and creates a new one with dummy values.
1. `checkDatabase` checks the database for errors in student - course - instructor mapping
1. `proj-pdf-generator` directory has utilities to create and send PDFs to instructors after the project allotment process is complete

## Faculty Coordinators
1. Prof. PK Sahoo (Faculty in-charge, Timetable Division)
1. Prof. Vasan Arunachalam (Associate Dean, AUGS Division)
1. Dr. Runa Kumari (In-charge Software Development, Timetable Division)

## Contributors
1. [Sohail Rajdev](https://www.github.com/sohailrajdev97)
2. [Nischay Ram Mamidi](https://github.com/Nischay-Pro)
3. [Kailash Bhalaki](https://www.github.com/Kailash0311)
4. [Nishant Aggarwal](https://www.github.com/nish-sapio)
