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
  /*
    function `getPresentRoomDetails` is used to retreive the the present hour details that user wants to remove.
  */
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
            console.log("getPresentRoomDetails gives subject:", sub);
            resolve(sub);
          }
        }
      );
    });
  };
  getPresentRoomDetails().then(sub => {
    let presentRoomNewData; //stores the updated Present Room data (i.e . after removing the hour user changed, if no clashing)
    let newRoomNewData; // stores the updated new Room data (i.e after adding the hour user added, if no clashing)

    let changePresentRoomData = new Promise(function(resolve, reject) {
      // this finds the present room and equals presentRoomNewData to actual classes removing the hour changed.Only a promise, resolved only when no clashing.
      roomsModel.findOne(
        {
          number: presentRoom
        },
        function(err, data) {
          if (err) console.log(err);
          else {
            if (presentRoom != newRoom) {
              presentRoomNewData = data.fixedClasses;
            } else {
              presentRoomNewData = newRoomNewData;
            }
            presentRoomNewData[presentDay][presentHour - 1] = "";
            resolve();
          }
        }
      );
    });
    let changeNewRoomData = new Promise(function(resolve, reject) {
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
    changeNewRoomData.then(param => {
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

        changePresentRoomData.then(() => {
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
