var portals = [{
    displayName: "24x7 Feedbacks",
    name: "feedbacks-24x7",
    icon: "feedback",
    active: false,
    admin: false
}, {
    displayName: "Mid-Semester Feedbacks",
    name: "feedbacks-midsem",
    icon: "feedback",
    active: false,
    admin: false
}, {
    displayName: "Room Booking",
    name: "room-booking-student",
    icon: "class",
    active: false,
    admin: false
}, {
    displayName: "Room Booking Approval",
    name: "room-booking-approval",
    icon: "done",
    active: false,
    admin: true
}, {
    displayName: "Room Booking",
    name: "room-booking-faculty",
    icon: "class",
    active: false,
    admin: true
}, {
    displayName: "Apply Teacher Assistantship",
    name: "ta-application",
    icon: "supervisor_account",
    active: false,
    admin: false
}, {
    displayName: "24x7 Feedbacks",
    name: "feedbacks-prof",
    icon: "feedback",
    active: false,
    admin: true
}, {
    displayName: "Admin Controls",
    name: "control",
    icon: "build",
    active: true,
    admin: true
}, {
    displayName: "[IC] TA Applications",
    name: "ta-app-ic",
    icon: "assignment",
    active: false,
    admin: true
}, {
    displayName: "View Room Bookings",
    name: "room-booking-esd",
    icon: "class",
    active: false,
    admin: true
}, {
    displayName: "Inductions",
    name: "inductions",
    icon: "work",
    active: false,
    admin: false
}, {
    displayName: "Feedbacks Control",
    name: "feedbacks-admin",
    icon: "feedback",
    active: false,
    admin: true
}, {
    displayName: "Project Create",
    name: "project-allotment-prof-create",
    icon: "feedback",
    active: false,
    admin: true
}, {
    displayName: "Project Allotment",
    name: "project-allotment-student",
    icon: "feedback",
    active: false,
    admin: false
}];

var superUsers = [{
    name: "Sohail Rajdev",
    email: "sohailrajdev97@gmail.com",
    portals: [],
    home: '',
    superUser: true
}, {
    name: "Nischay Ram Mamidi",
    email: "nischaymamidi@gmail.com",
    portals: [],
    home: '',
    superUser: true
}, {
    name: "Nishant Aggarwal",
    email: "nishant23799@gmail.com",
    portals: [],
    home: '',
    superUser: true
}, {
    name: "Kailash Bhalaki",
    email: "kailashbhalaki@gmail.com",
    portals: [],
    home: '',
    superUser: true
}, {
    name: "ID Office",
    email: "id@hyderabad.bits-pilani.ac.in",
    portals: [],
    home: '',
    superUser: true
}];

module.exports = {
	
    portals: portals,
    superUsers: superUsers

};