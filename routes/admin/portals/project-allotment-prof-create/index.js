var express = require('express');
var router = express.Router();
var fq = require('fuzzquire');
var projectsModel = fq('schemas/projects');
var projectHeadModel = fq('schemas/project-heads');
var adminModel = fq('schemas/admins');

router.get('/', function (req, res, next) {
    try {
        let usertype = getProfessorType(req.user.email);
        usertype.then(val => {
            console.log(val);
            if (val.admin) {
                projectsModel.find({}).exec((err, result) => {
                    if (err) {
                        return res.terminate(err);
                    }
                    let promises2 = [];
                    let getdepartmentpromise = [];
                    result.forEach((object, index, array) => {
                        array[index].description = array[index].description.substring(0, Math.min(array[index].description.length, 66)) + " ...";
                        promises2.push(getInstructorName(array[index].instructor));
                        getdepartmentpromise.push(getProfessorDepartment(array[index].instructor));
                    });
                    Promise.all(promises2).then(vals => {
                        vals.forEach((object, index, array) => {
                            result[index].name = array[index];
                        });
                        return res.renderState('admin/portals/project-allotment-prof-create', {
                            projects: result
                        });
                    }).catch(err => {
                        console.log(err);
                        res.terminate(err);
                    });
                });
            } else if (val.head) {
                projectHeadModel.find({
                    department: val.department
                }).lean().exec((err, projects) => {
                    if (err)
                        return res.terminate(err);
                    let projectquery = [];
                    projects.forEach((o, i, a) => {
                        projectquery.push(getProfessorProjects(a[i].instructor));
                    });
                    let finalresult = [];
                    Promise.all(projectquery).then(vals => {
                        vals.forEach(val => {
                            finalresult = finalresult.concat(val);
                        });
                        let promises2 = [];
                        finalresult.forEach((object, index, array) => {
                            array[index].description = array[index].description.substring(0, Math.min(array[index].description.length, 66)) + " ...";
                            promises2.push(getInstructorName(array[index].instructor));
                        });
                        Promise.all(promises2).then(vals => {
                            vals.forEach((object, index, array) => {
                                finalresult[index].name = array[index];
                            });
                            return res.renderState('admin/portals/project-allotment-prof-create', {
                                projects: finalresult
                            });
                        });
                    });
                });
            } else {
                projectsModel.find({
                    instructor: req.user.email
                }).lean(true).exec(
                    (err, result) => {
                        console.log(result);
                        if (err) {
                            return res.terminate(err);
                        }
                        let promises = [];
                        console.log(result);
                        result.forEach((object, index, array) => {
                            array[index].description = array[index].description.substring(0, Math.min(array[index].description.length, 66)) + " ...";
                            promises.push(getInstructorName(array[index].instructor));
                            console.log(array[index].instructor);
                        });
                        Promise.all(promises).then(vals => {
                            vals.forEach((object, index, array) => {
                                result[index].name = array[index];
                            });
                            console.log(result);
                            return res.renderState('admin/portals/project-allotment-prof-create', {
                                projects: result
                            });
                        });
                    });
            }
        });
    } catch (err) {
        return res.terminate(err);
    }
});

function getInstructorName(profmail) {
    return new Promise((resolve, reject) => {
        adminModel.findOne({
            email: profmail
        }, (err, result) => {
            if (err)
                reject(err);
            if (result != null && result != undefined) {
                resolve(result.name);
            } else {
                resolve('Missing Professor Data');
            }
        });
    });
}

function getProfessorProjects(profmail) {
    return new Promise((resolve, reject) => {
        projectsModel.find({
            instructor: profmail
        }).lean().exec((err, result) => {
            if (err)
                reject(err);
            if (result != null && result != undefined) {
                resolve(result);
            } else {
                resolve('Missing Professor Data');
            }
        });
    });
}

function getProfessorDepartment(profmail) {
    return new Promise((resolve, reject) => {
        projectHeadModel.find({
            instructor: profmail
        }, (err, result) => {
            if (err)
                reject(err);
            if (result != null && result != undefined) {
                resolve(result.department);
            } else
            resolve('Missing Professor Data');
        });
    });
}

function getProfessorType(profmail) {
    return new Promise((resolve, reject) => {
        adminModel.findOne({
            email: profmail
        }, (err, result) => {
            if (err)
                reject(err);
            if (result != null && result != undefined) {
                if (result.superUser == true) {
                    resolve({
                        admin: true
                    });
                } else {
                    projectHeadModel.findOne({
                        instructor: profmail
                    }, (err, result2) => {
                        if (err)
                            reject(err);
                        if (result2 != null && result2 != undefined) {
                            if (result2.head == true) {
                                resolve({
                                    head: true,
                                    department: result2.department
                                });
                            } else {
                                resolve({
                                    head: false,
                                    department: result2.department
                                });
                            }
                        }
                    });
                }
            }
        });
    });
}

router.get('/view/:id', function (req, res, next) {
    try {
        projectsModel.findOne({
            _id: req.sanitize(req.params.id)
        }, (err, result) => {
            if (err) {
                return res.terminate(err);
            }
            res.renderState('admin/portals/project-allotment-prof-create/view', {
                project: result
            });
        });
    } catch (err) {
        return res.terminate(err);
    }
});

router.post('/create', function (req, res, next) {
    try {
        let data = {
            title: req.sanitize(req.body.title),
            description: req.sanitize(req.body.description),
            instructor: req.user.email
        };
        if (data.description.length == 0) {
            data.description = "N/A";
        }
        if (data.title.length == 0) {
            data.description = "N/A";
        }
        const typeproj = req.sanitize(req.body.lablist);
        if (typeproj == 'Lab Oriented Project (LOP)') {
            data.type = 'lop';
        } else if (typeproj == 'Design Oriented Project (DOP)') {
            data.type = 'dop';
        } else {
            data.type = 'sop';
        }
        if (req.sanitize(req.body.proflist))
            data.instructor = req.sanitize(req.body.proflist).split('|')[1].replace(" ", "");
        projectHeadModel.findOne({
            instructor: data.instructor
        }, (err, result) => {
            if (err)
                return res.terminate(err);
            if (result != undefined && result != null) {
                // data.department = result.department;
                projectsModel.create(data, (err, result) => {
                    if (err) {
                        return res.terminate(err);
                    }
                    return res.redirect('/admin/project-allotment-prof-create');
                });
            } else
                return res.terminate("Could not find professor record.");
        });
    } catch (err) {
        return res.terminate(err);
    }
});

router.get('/create', function (req, res, next) {
    try {
        adminModel.findOne({
            email: req.user.email
        }, (err, result0) => {
            if (err)
                return res.terminate(err);
            if (result0 != undefined && result0 != null) {
                if (result0.superUser == true) {
                    projectHeadModel.find({}, (err, result2) => {
                        console.log("superUser");
                        return res.renderState('admin/portals/project-allotment-prof-create/create', {
                            profs: result2
                        });
                    });
                } else {
                    projectHeadModel.findOne({
                        instructor: req.user.email
                    }, (err, result1) => {
                        if (err)
                            return res.terminate(err);
                        if (result1 != undefined && result1 != null) {
                            if (result1.head == true) {
                                console.log("head");
                                projectHeadModel.find({
                                    department: result1.department
                                }, (err, result2) => {
                                    return res.renderState('admin/portals/project-allotment-prof-create/create', {
                                        profs: result2
                                    });
                                });
                            } else {
                                console.log("normal");
                                return res.renderState('admin/portals/project-allotment-prof-create/create');
                            }
                        }
                    });
                }
            }
        });
    } catch (err) {
        return res.terminate(err);
    }
});

router.delete('/view/:id', function (req, res, next) {
    try {
        projectsModel.findOneAndRemove({
            _id: req.sanitize(req.params.id)
        }, (err, result) => {
            if (err) {
                return res.terminate(err);
            }
            res.send('success');
        });
    } catch (err) {
        return res.terminate(err);
    }
});
module.exports = router;