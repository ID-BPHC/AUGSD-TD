var chai = require("chai");
var should = chai.should();
var mongoose = require("mongoose");
var config = require("../config");

var adminsModel = require("../schemas/admins");
var portalsModel = require("../schemas/portals");
var studentsModel = require("../schemas/students");
var roomsModel = require("../schemas/rooms");

describe("database", function() {
  before(function(done) {
    mongoose.connect(
      config.mongooseConnection,
      {
        useMongoClient: true
      }
    );
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error"));
    db.once("open", () => {
      console.log("We are connected to ID-dev database!");
      done();
    });
  });

  it("should get documents from admins model", function(done) {
    adminsModel.find({}, (err, data) => {
      should.not.exist(err);
      should.exist(data);
      data.should.be.a("array");
      done();
    });
  });

  it("should get documents from portals model", function(done) {
    portalsModel.find({}, (err, data) => {
      should.not.exist(err);
      should.exist(data);
      data.should.be.a("array");
      done();
    });
  });

  it("should get documents from students model", function(done) {
    studentsModel.find({}, (err, data) => {
      should.not.exist(err);
      should.exist(data);
      data.should.be.a("array");
      done();
    });
  });

  it("should get documents from rooms model", function(done) {
    roomsModel.find({}, (err, data) => {
      should.not.exist(err);
      should.exist(data);
      data.should.be.a("array");
      done();
    });
  });

  after(function(done) {
    mongoose.connection.close(done);
  });
});
