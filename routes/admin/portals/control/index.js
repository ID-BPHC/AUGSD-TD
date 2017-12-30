var express = require('express');
var path = require('path');
var router = express.Router();
var fq = require('fuzzquire');
var fileUpload = require('express-fileupload');
// var uncaught = require('uncaught');

// uncaught.start();
// uncaught.addListener(function (err) {
//     console.log('Uncaught ' + err.message);
// });

router.use(fileUpload());

router.get('/', function (req, res, next) {
    res.renderState('admin/portals/control');
});

router.post('/update/:type', function (req, res, next) {
    if (req.params.type == 'students') {
        let studentsFile = req.files.studentsFile;

        studentsFile.mv(path.join(__dirname, '../../../../utils', 'Students.csv'), function (err) {
            if (err) {
                console.log(err);
                return res.terminate(err);
            }
            // runPy.then(function (resp) {
            //     console.log(resp.toString());
            //     res.end(resp);
            // }).catch(function (error) {
            //     return res.terminate(error);
            // });
        });
    }
});

// let runPy = new Promise(function (resolve, reject) {

//     const {
//         spawn
//     } = require('child_process');
//     const pyprog = spawn('python', ['../../../../utils/studentGenerator.py']);

//     pyprog.stdout.on('data', function (data) {

//         resolve(data);

//     });
//     pyprog.stderr.on('data', (data) => {

//         reject(data);

//     });

// });

module.exports = router;