var logsModel = require('../schemas/logs');

module.exports = {
    logsHandler: function(req, res, next){
    var logEvent = new logsModel;
    // logEvent.save(function (err, product, numAffected) {
    //     if (err){
    //         console.log("ERROR")
    //     }
    //     next();
    //   })
    next();
    } 
}