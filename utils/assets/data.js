var portals = [
  {
    displayName: "24x7 Feedbacks",
    name: "feedbacks-24x7",
    icon: "feedback",
    active: false,
    mode: "AUGSD",
    admin: false
  },
  {
    displayName: "Mid-Semester Feedbacks",
    name: "feedbacks-midsem",
    icon: "feedback",
    active: false,
    mode: "AUGSD",
    admin: false
  },
  {
    displayName: "Room Booking",
    name: "room-booking-student",
    icon: "class",
    active: false,
    mode: "TD",
    admin: false
  },
  {
    displayName: "Room Booking Approval",
    name: "room-booking-approval",
    icon: "done",
    active: false,
    mode: "TD",
    admin: true
  },
  {
    displayName: "Room Booking",
    name: "room-booking-faculty",
    icon: "class",
    active: false,
    mode: "TD",
    admin: true
  },
  {
    displayName: "Apply Teacher Assistantship",
    name: "ta-application",
    icon: "supervisor_account",
    active: false,
    mode: "AUGSD",
    admin: false
  },
  {
    displayName: "Feedbacks",
    name: "feedbacks-prof",
    icon: "feedback",
    active: false,
    mode: "AUGSD",
    admin: true
  },
  {
    displayName: "Admin Controls",
    name: "control",
    icon: "build",
    active: true,
    mode: "AUGSD",
    admin: true
  },
  {
    displayName: "Admin Controls",
    name: "control",
    icon: "build",
    active: true,
    mode: "TD",
    admin: true
  },
  {
    displayName: "[IC] TA Applications",
    name: "ta-app-ic",
    icon: "assignment",
    active: false,
    mode: "AUGSD",
    admin: true
  },
  {
    displayName: "ESD- Room Bookings",
    name: "room-booking-esd",
    icon: "class",
    active: false,
    mode: "TD",
    admin: true
  },
  {
    displayName: "View Room Bookings",
    name: "room-booking-all",
    icon: "class",
    active: false,
    mode: "TD",
    admin: true
  },
  {
    displayName: "Inductions",
    name: "inductions",
    icon: "work",
    active: false,
    mode: "TD",
    admin: false
  },
  {
    displayName: "Feedbacks Control",
    name: "feedbacks-admin",
    icon: "feedback",
    active: false,
    mode: "AUGSD",
    admin: true
  },
  {
    displayName: "Project Create",
    name: "project-allotment-prof-create",
    icon: "assignment",
    active: false,
    mode: "AUGSD",
    admin: true
  },
  {
    displayName: "Project Allotment",
    name: "project-allotment-student",
    icon: "assignment",
    active: false,
    mode: "AUGSD",
    admin: false
  },
  {
    displayName: "Project Applications",
    name: "project-applications",
    icon: "format_list_bulleted",
    active: false,
    mode: "AUGSD",
    admin: true
  },
  {
    displayName: "Export Project List",
    name: "project-list",
    icon: "import_export",
    active: false,
    mode: "AUGSD",
    admin: true
  }
];

var superUsers = [
  {
    name: "Sohail Rajdev",
    email: "sohailrajdev97@gmail.com",
    portals: [],
    home: "",
    superUser: true,
    department: "Timetable Division",
    departmentCode: "ID",
    maxProjects: 2
  },
  {
    name: "Nischay Ram Mamidi",
    email: "nischaymamidi@gmail.com",
    portals: [],
    home: "",
    superUser: true,
    department: "Timetable Division",
    departmentCode: "ID",
    maxProjects: 2
  },
  {
    name: "Nishant Aggarwal",
    email: "nishant23799@gmail.com",
    portals: [],
    home: "",
    superUser: true,
    department: "Timetable Division",
    departmentCode: "ID",
    maxProjects: 2
  },
  {
    name: "Kailash Bhalaki",
    email: "kailashbhalaki@gmail.com",
    portals: [],
    home: "",
    superUser: true,
    department: "Timetable Division",
    departmentCode: "ID",
    maxProjects: 2
  },
  {
    name: "ID Office",
    email: "id@hyderabad.bits-pilani.ac.in",
    portals: [],
    home: "",
    superUser: true,
    department: "Timetable Division",
    departmentCode: "ID",
    maxProjects: 2
  },
];

module.exports = {
  portals: portals,
  superUsers: superUsers
};
