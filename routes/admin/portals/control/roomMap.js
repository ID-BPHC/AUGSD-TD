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
  
  let newSubs = changeReqObjToArray(postObj);
  
  // Update the room map directly without checking bookings
  // The room map defines the regular timetable, and the booking system should respect it
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
});
module.exports = router;
