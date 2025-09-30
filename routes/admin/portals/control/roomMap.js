let express = require("express");
let router = express.Router();
let fq = require("fuzzquire");
let roomsModel = fq("schemas/rooms");
let bookingsModel = fq("schemas/room-bookings");
let moment = require("moment");
const { check, validationResult } = require("express-validator/check");

let rooms = [];
router.get("/", function(req, res, next) {
  return res.redirect("/admin/control/room-map/step1");
});
router.get("/step1", function(req, res, next) {
  const searchQuery = req.query.search || '';
  roomsModel.distinct("number", function(err, result) {
    if (err) console.log(err);
    else {
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
  }
);
router.post("/:room/changeClass", function(req, res, next) {
  let presentRoom = req.sanitize(req.params.room);
  let roomBookings = [];
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
            bookings.forEach(booking => {
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
                if (hour >= startTime && hour <= endTime) {
                  if (!roomBookings.includes(JSON.stringify(booking))) {
                    // for comparing objects it is better to convert them to strings.
                    roomBookings.push(JSON.stringify(booking));
                  }
                }
              }
            });
            resolve(roomBookings);
          }
        }
      );
    });
  }
  let newSubs = changeReqObjToArray(postObj);
  let p;
  async function bookings() {
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 12; hour++) {
        if (newSubs[day][hour]) {
          p = await checkRoomBookings(presentRoom, day + 1, hour + 1);
        }
      }
    }
    return p;
  }
  bookings().then(function(p) {
    roomBookings = [];
    p.forEach(booking => {
      booking = JSON.parse(booking);
      roomBookings.push(booking);
    });
    if (roomBookings[0] && roomBookings.length > 0) {
      return res.renderState("admin/portals/control/roomMap/existingBookings", {
        bookings: roomBookings
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
          res.redirect(req.get("referer"));
        }
      );
    }
  });
});
module.exports = router;
