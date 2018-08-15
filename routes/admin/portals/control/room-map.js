var express = require("express");
var path = require("path");
var router = express.Router();
var session = require("express-session");
var fq = require("fuzzquire");
var roomsModel = fq("schemas/rooms")

var rooms = []
router.get('/step1',function(req,res,next){
    console.log("Step-1");
    roomsModel.distinct("number",function(err,result){
        if(err) console.log(err);
        else {
            console.log('result is ', result);
            rooms = result;
            return res.renderState("admin/portals/control/room-map/step1",{result:result});
        }
        })
    
    
})
router.get("/step2",function(req,res,next){
    res.redirect("/step1");
})
router.post("/step2",function(req,res,next){
    console.log(" Step-2 ");
    console.log("req.body is ",req.body)
    roomsModel.find({
        "number": req.body.room
    },function(err,data){
        if(err) {
            console.log(err);
            return res.terminate(err)
        }
        else {
            console.log('data is ',data);
            console.log(data[0].fixedClasses);
            var hours = []
            for (var i = 1; i <= 10; i++) {
                hours.push(i)
            }
            console.log("rooms are ",rooms)
            var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            return res.renderState("admin/portals/control/room-map/step2", {classes: data[0].fixedClasses,room:data[0].number,hours:hours, rooms:rooms, days: days});
        }
    })
    
})
router.post("/:room/shiftclass",function(req,res,next){
    console.log("req body is , ", req.body, req.params.room);
})


module.exports = router;