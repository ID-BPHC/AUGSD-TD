var chai = require('chai');
var should = chai.should();
var config = require('../config');

describe('config', function () {

    it('should be a valid config file', function (done) {
        config.googleClientID.should.exist;
        config.googleClientID.should.be.a('string');
        config.googleClientSecret.should.exist;
        config.googleClientSecret.should.be.a('string');
        config.googleCallback.should.exist;
        config.googleCallback.should.be.a('string');
        config.googleAdminCallback.should.exist;
        config.googleAdminCallback.should.be.a('string');
        config.mongooseConnection.should.exist;
        config.mongooseConnection.should.be.a('string');
        config.mailUser.should.exist;
        config.mailUser.should.be.a('string');
        config.mailRefreshToken.should.exist;
        config.mailRefreshToken.should.be.a('string');
        config.mailPort.should.exist;
        config.mailPort.should.be.a('number');
        config.mailSecure.should.exist;
        config.mailSecure.should.be.a('boolean');
        done();
    });

});