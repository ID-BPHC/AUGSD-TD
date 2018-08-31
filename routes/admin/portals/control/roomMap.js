let express = require("express");
let router = express.Router();
let fq = require("fuzzquire");
let roomsModel = fq("schemas/rooms");
let bookingsModel = fq("schemas/room-bookings");
let moment = require("moment");

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
        let weekDayHash = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return res.renderState("admin/portals/control/roomMap/step2", {
          classes: data[0].fixedClasses,
          room: data[0].number,
          rooms: rooms,
          weekDayHash: weekDayHash
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
  let param = 1;
  let roomBookings = [];

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
                bookingDate.diff(nowDate, "days") >= 1
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
                  roomBookings.push(booking);
                  param = 0;
                }
              }
            });
            console.log("booked-room:", roomBookings);
            if (!param) {
              console.log("Booked!");
            }
            resolve(param); // 1 if room-shift is possible, 0 if not.
          }
        }
      );
    });
  }
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

    let changePresentRoomData = function() {
      return new Promise(function(resolve, reject) {
        // this finds the present room and equals presentRoomNewData to actual classes removing the hour changed.Only a promise, resolved only when no clashing.
        roomsModel.findOne(
          {
            number: presentRoom
          },
          function(err, data) {
            if (err) console.log(err);
            else {
              if (presentRoom != newRoom) {
                console.log("rooms are not equal");
                presentRoomNewData = data.fixedClasses;
              } else {
                console.log("rooms are equal");
                presentRoomNewData = newRoomNewData;
                console.log("presentRoomNewData", presentRoomNewData);
                console.log("newRoomNewdata", newRoomNewData);
              }
              presentRoomNewData[presentDay][presentHour - 1] = "";
              resolve();
            }
          }
        );
      });
    };
    let changeNewRoomData = new Promise(function(resolve, reject) {
      roomsModel.findOne(
        {
          number: newRoom
        },
        function(err, data) {
          if (err) console.log(err);
          else {
            checkRoomBookings(newRoom, newDay + 1, newHour).then(param => {
              console.log("param is ", param);
              newRoomNewData = data.fixedClasses;
              if (data.fixedClasses[newDay][newHour - 1]) {
                console.log("Some class is already there.");
                resolve(0); // Clashing Class!
              } else {
                newRoomNewData = data.fixedClasses;
                newRoomNewData[newDay][newHour - 1] = sub;
                resolve(1); // Either no clashing class or some booking is there. (Either way we have to change)
              }
            });
          }
        }
      );
    });
    changeNewRoomData.then(param => {
      console.log("change new room data , then", param);
      if (param === 0) {
        console.log("not happening");
        console.log("room-bookings are:", roomBookings);

        res.renderState("custom_errors", {
          redirect: "/admin/control/room-map",
          timeout: 3,
          supertitle: "Clashing !",
          callback: "/",
          message: "",
          details:
            "The place you want to move is already alloted by another class .Consider moving that to some other place"
        });
      } else {
        if (roomBookings && roomBookings.length > 0) {
          console.log("bookings are :", roomBookings);
          res.renderState("admin/portals/control/roomMap/existingBookings", {
            bookings: roomBookings
          });
        }
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

          changePresentRoomData().then(() => {
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
          if (!(roomBookings && roomBookings.length > 0)) {
            res.redirect("/admin/control/room-map");
          }
        }
      }
    });
  });
});

module.exports = router;
