let express = require("express");
let router = express.Router();
let fq = require("fuzzquire");
let roomsModel = fq("schemas/rooms");

let rooms = [];
router.get("/", function(req, res, next) {
  return res.redirect("/admin/control/room-map/step1");
});
router.get("/step1", function(req, res, next) {
  roomsModel.distinct("number", function(err, result) {
    if (err) console.log(err);
    else {
      rooms = result;
      return res.renderState("admin/portals/control/roomMap/step1", {
        result: result
      });
    }
  });
});
router.get("/step2", function(req, res, next) {
  res.redirect("/admin/control/room-map/step1");
});
router.post("/step2", function(req, res, next) {
  roomsModel.find(
    {
      number: req.sanitize(req.body.room)
    },
    function(err, data) {
      if (err) {
        console.log(err);
        return res.terminate(err);
      } else {
        return res.renderState("admin/portals/control/roomMap/step2", {
          classes: data[0].fixedClasses,
          room: data[0].number,
          rooms: rooms
        });
      }
    }
  );
});
router.post("/:room/shiftclass", function(req, res, next) {
  let presentRoom = req.sanitize(req.params.room);
  let presentHour = parseInt(req.sanitize(req.body.hour));
  let presentDay = parseInt(req.sanitize(req.body.day));
  let newRoom = req.sanitize(req.body.room1);
  let newDay = parseInt(req.sanitize(req.body.day1));
  let newHour = parseInt(req.sanitize(req.body.hour1));
  let sub;
  let getPresentRoomDetails = function getPresentRoomDetails() {
    return new Promise(function(resolve, reject) {
      roomsModel.find(
        {
          number: presentRoom
        },
        (err, data) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            sub = data[0].fixedClasses[presentDay][presentHour - 1];
            resolve(sub);
          }
        }
      );
    });
  };
  getPresentRoomDetails().then(sub => {
    let presentRoomNewData;
    let newRoomNewData;

    let findPresentRoomData = new Promise(function(resolve, reject) {
      roomsModel.findOne(
        {
          number: presentRoom
        },
        function(err, data) {
          if (err) console.log(err);
          else {
            presentRoomNewData = data.fixedClasses;
            presentRoomNewData[presentDay][presentHour - 1] = "";
            resolve();
          }
        }
      );
    });
    let findNewRoomData = new Promise(function(resolve, reject) {
      roomsModel.findOne(
        {
          number: newRoom
        },
        function(err, data) {
          if (err) console.log(err);
          else {
            newRoomNewData = data.fixedClasses;
            if (data.fixedClasses[newDay][newHour - 1]) {
              console.log("Some class is already there.");
              resolve(0);
            } else {
              newRoomNewData = data.fixedClasses;
              newRoomNewData[newDay][newHour - 1] = sub;
              resolve(1);
            }
          }
        }
      );
    });
    findNewRoomData.then(param => {
      if (param) {
        roomsModel.update(
          {
            number: newRoom
          },
          {
            fixedClasses: newRoomNewData
          },
          function(err) {
            if (err) console.log(err);
          }
        );
        console.log("new room updated");
        findPresentRoomData.then(() => {
          roomsModel.update(
            {
              number: presentRoom
            },
            {
              fixedClasses: presentRoomNewData
            },
            function(err) {
              if (err) console.log(err);
            }
          );
        });
        console.log("old room updated");
        res.redirect("/admin/control/room-map");
      } else {
        res.renderState("custom_errors", {
          redirect: "/admin/control/room-map",
          timeout: 3,
          supertitle: "Clashing !",
          callback: "/",
          message: "",
          details:
            "The place you want to move is already alloted . Try moving that to some other place"
        });
      }
    });
  });
});

module.exports = router;
