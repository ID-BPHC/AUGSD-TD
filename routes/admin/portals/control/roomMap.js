let express = require("express");
let router = express.Router();
let fq = require("fuzzquire");
let roomsModel = fq("schemas/rooms");
let bookingsModel = fq("schemas/room-bookings");
let moment = require("moment");
const { check, validationResult } = require("express-validator/check");

let rooms = [];

// Natural sort function for room numbers (F101, F102, G101, etc.)
function naturalSort(a, b) {
  // Extract building letter and room number
  const regex = /([A-Za-z]+)(\d+)/;
  const matchA = a.match(regex);
  const matchB = b.match(regex);
  
  if (!matchA || !matchB) {
    // Fallback to string comparison if pattern doesn't match
    return a.localeCompare(b);
  }
  
  const [, buildingA, numA] = matchA;
  const [, buildingB, numB] = matchB;
  
  // First compare building letters
  if (buildingA !== buildingB) {
    return buildingA.localeCompare(buildingB);
  }
  
  // If same building, compare numbers numerically
  return parseInt(numA) - parseInt(numB);
}
router.get("/", function(req, res, next) {
  return res.redirect("/admin/control/room-map/step1");
});
router.get("/step1", function(req, res, next) {
  const searchQuery = req.query.search || '';
  roomsModel.distinct("number", function(err, result) {
    if (err) console.log(err);
    else {
      // Sort rooms naturally (F101, F102, ..., G101, G102, ...)
      result.sort(naturalSort);
      rooms = result;
      
      // Filter results based on search query
      let filteredResult = result;
      if (searchQuery) {
        filteredResult = result.filter(room => 
          room.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return res.renderState("admin/portals/control/roomMap/step1", {
        result: filteredResult,
        allRooms: result,
        searchQuery: searchQuery
      });
    }
  });
});
router.get("/search", function(req, res, next) {
  const searchQuery = req.query.q || '';
  roomsModel.distinct("number", function(err, result) {
    if (err) {
      return res.json({ error: "Database error" });
    }
    // Sort rooms naturally
    result.sort(naturalSort);
    
    // Filter results based on search query
    let filteredResult = result;
    if (searchQuery) {
      filteredResult = result.filter(room => 
        room.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    res.json({ rooms: filteredResult });
  });
});

router.get("/step2", function(req, res, next) {
  const roomNumber = req.query.room;
  if (!roomNumber) {
    return res.redirect("/admin/control/room-map/step1");
  }
  
  // Get all rooms for the dropdown
  roomsModel.distinct("number", function(err, allRooms) {
    if (err) {
      console.log(err);
      return res.redirect("/admin/control/room-map/step1");
    }
    
    // Sort rooms naturally
    allRooms.sort(naturalSort);
    rooms = allRooms;
    
    // Find the specific room data
    roomsModel.find({ number: roomNumber }, function(err, data) {
      if (err || !data.length) {
        console.log(err);
        return res.redirect("/admin/control/room-map/step1");
      }
      
      let weekDayHash = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      let numberHash = [];
      for (let i = 1; i <= 12; i++) {
        numberHash.push(i);
      }
      
      return res.renderState("admin/portals/control/roomMap/step2", {
        classes: data[0].fixedClasses,
        room: data[0].number,
        rooms: rooms,
        weekDayHash: weekDayHash,
        numberHash: numberHash
      });
    });
  });
});
router.post(
  "/step2",
  [
    check("room")
      .exists()
      .withMessage("No Room Specified")
      .not()
      .isEmpty()
      .withMessage("No Room Specified")
  ],
  function(req, res, next) {
    const errors = validationResult(req);
    console.log(req.body);
    if (!errors.isEmpty()) {
      return res.renderState("form-errors", {
        errors: errors.mapped()
      });
    }
    
    // Check if room is provided via query parameter (for room switching)
    const roomNumber = req.query.room || req.sanitize(req.body.room);
    
    // Get all rooms for the dropdown
    roomsModel.distinct("number", function(err, allRooms) {
      if (err) {
        console.log(err);
        return res.terminate(err);
      }
      
      // Sort rooms naturally
      allRooms.sort(naturalSort);
      rooms = allRooms;
      
      // Find the specific room data
      roomsModel.find(
        {
          number: roomNumber
        },
        function(err, data) {
          if (err) {
            console.log(err);
            return res.terminate(err);
          } else {
            let weekDayHash = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            let numberHash = [];
            for (let i = 1; i <= 12; i++) {
              numberHash.push(i);
            }
            return res.renderState("admin/portals/control/roomMap/step2", {
              classes: data[0].fixedClasses,
              room: data[0].number,
              rooms: rooms,
              weekDayHash: weekDayHash,
              numberHash: numberHash
            });
          }
        }
      );
    });
  }
);
router.post("/:room/changeClass", function(req, res, next) {
  let presentRoom = req.sanitize(req.params.room);
  let postObj = req.body;

  Object.keys(postObj).map(function(key, index) {
    postObj[key] = postObj[key].trim();
  });

  function changeReqObjToArray(obj) {
    let arr = [[], [], [], [], [], [], []]; //7 arrays representing each day.
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 12; hour++) {
        arr[day][hour] = req.body[day + "" + hour] || "";
      }
    }
    return arr;
  }
  
  function checkRoomBookings(room, day, hour) {
    return new Promise((resolve, reject) => {
      bookingsModel.find(
        {
          number: room
        },
        function(err, bookings) {
          if (err) {
            console.log(err);
            res.terminate(err);
            reject(err);
          } else {
            let conflictingBookings = [];
            bookings.forEach(booking => {
              // Skip administrative blocks (blockAll: true) - only check real bookings
              if (booking.blockAll === true) {
                return; // Skip this booking
              }
              
              let nowDate = moment();
              let bookingDate = moment(booking.start);
              if (
                moment(booking.start).isoWeekday() == day && // 1 - Monday .... 7 - Sunday
                bookingDate.diff(nowDate) > 0
              ) {
                let startTime =
                  moment(booking.start).hours() -
                  7 +
                  moment(booking.start).minutes() / 60;

                let endTime =
                  moment(booking.end).hours() -
                  7 +
                  moment(booking.end).minutes() / 60;
                if (hour >= startTime && hour < endTime) {
                  conflictingBookings.push(booking);
                }
              }
            });
            resolve(conflictingBookings);
          }
        }
      );
    });
  }
  
  let newSubs = changeReqObjToArray(postObj);
  
  // First, get the existing classes for this room to compare
  roomsModel.findOne({ number: presentRoom }, function(err, roomData) {
    if (err) {
      console.log(err);
      return res.terminate(err);
    }
    
    if (!roomData) {
      return res.status(404).send("Room not found");
    }
    
    let oldClasses = roomData.fixedClasses || [[], [], [], [], [], [], []];
    
    async function checkNewBookings() {
      let allConflictingBookings = [];
      
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 12; hour++) {
          // Only check slots that have NEW or CHANGED classes
          let oldValue = oldClasses[day] && oldClasses[day][hour] ? oldClasses[day][hour].trim() : "";
          let newValue = newSubs[day][hour].trim();
          
          // If there's a new class being added where there wasn't one before, or the class changed
          if (newValue && newValue !== oldValue) {
            let bookings = await checkRoomBookings(presentRoom, day + 1, hour + 1);
            // Add any conflicting bookings to our list
            bookings.forEach(booking => {
              // Check if this booking is already in our list (compare by unique fields)
              let isDuplicate = allConflictingBookings.some(existingBooking => 
                existingBooking.number === booking.number &&
                existingBooking.start === booking.start &&
                existingBooking.end === booking.end &&
                existingBooking.purpose === booking.purpose
              );
              if (!isDuplicate) {
                allConflictingBookings.push(booking);
              }
            });
          }
        }
      }
      return allConflictingBookings;
    }
    
    checkNewBookings().then(function(bookings) {
      if (bookings.length > 0) {
        return res.renderState("admin/portals/control/roomMap/existingBookings", {
          bookings: bookings
        });
      } else {
        roomsModel.update(
          {
            number: presentRoom
          },
          {
            fixedClasses: newSubs
          },
          function(err) {
            if (err) {
              console.log(err);
              return res.terminate(err);
            }
            res.redirect(req.get("referer"));
          }
        );
      }
    }).catch(function(err) {
      console.log(err);
      return res.terminate(err);
    });
  });
});
module.exports = router;
