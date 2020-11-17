module.exports = function(options) {

  this.jasmineStarted = function() {
    this.testCount = 0;
    this.failCount = 0; 
    this.testSuites = [];
    this.testSuitesStartTime = new Date();
  };

  this.jasmineDone = function() {
    this.testSuitesEndTime = new Date();
    this.testSuitesTime = (this.testSuitesEndTime - this.testSuitesStartTime)/1000;
    this.writeLog();
  };

  this.suiteStarted = function(result) {
    let newsuite = {};
    newsuite.tests = [];
    newsuite.name = result.description;
    newsuite.id = result.id;
    newsuite.testCount = 0;
    newsuite.failCount = 0;
    newsuite.suiteStartTime = new Date();
    this.testSuites.push(newsuite);
  },

  this.suiteDone = function(result) {
    let suiteIndex = this.testSuites.findIndex(x => x.id === result.id);
    let suite = this.testSuites[suiteIndex];
    suite.suiteEndTime = new Date();
    suite.time = (suite.suiteEndTime - suite.suiteStartTime)/1000;
  },

  this.getSuiteFromSpecResult = function(result) {
    let testSuiteDescriptionIndex = result.fullName.indexOf(result.description);
    let testSuiteName = result.fullName.substring(0,testSuiteDescriptionIndex - 1);
    testSuiteName = testSuiteName;
    let testSuiteIndex = this.testSuites.findIndex(x => x.name === testSuiteName);
    let suite = this.testSuites[testSuiteIndex];
    return suite;
  }

  this.specStarted = function(result) {
    if (result.status != 'pending') {
      let suite = this.getSuiteFromSpecResult(result);
      let newtest = {};
      newtest.startTime = new Date();
      newtest.id = result.id;
      suite.tests.push(newtest);
    }
  }

  this.getTestAndSuiteFromSpecResult = function(result) {
    let suite = this.getSuiteFromSpecResult(result);
    let testIndex = suite.tests.findIndex(x => x.id === result.id);
    let test = suite.tests[testIndex];
    return {test: test, suite: suite};
  }

  this.specDone = function(result) {
    if (result.status != 'pending') {
      let testAndSuiteReferences = this.getTestAndSuiteFromSpecResult(result);
      let test = testAndSuiteReferences.test;
      let suite = testAndSuiteReferences.suite;
      test.endTime = new Date();
      test.time = (test.endTime - test.startTime) / 1000;
      test.description = result.description;
      test.failures = [];

      if (result.status == 'failed') {
        suite.failCount++;
        this.failCount++;
        result.failedExpectations.forEach( function (f){
          let fail = {};
          fail.message = f.message;
          fail.stack = f.stack;
          test.failures.push(fail);
        });
      };

      suite.testCount++;
      this.testCount++;
    }
  }


  this.writeLog = function() {
    var fs = require('fs');
    var logText = "";

    try {
      fs.mkdirSync(options.savePath)
    } catch (e) {
      if (e.code == 'EEXIST') {}
      else {
        throw(e);
      }
    };

    // Test Suites
    
    logText += 'tests="' + this.testCount + '"\n';
    logText += 'failures="' + this.failCount + '"\n';
    logText += 'time="' + this.testSuitesTime + '"\n';


    // Per Test Suite
    this.testSuites.forEach( function (s){
      logText += 'name="' + s.name + '"\n';
      logText += 'tests="' + s.testCount + '"\n';
      logText += 'failures="' + s.failCount + '"\n';
      logText += 'time="' + s.time + '"\n';

      // Per Each Test
      s.tests.forEach( function (t){
        if ( typeof t.description !== 'undefined'){
          logText += 'name="';
          logText += t.description;
          logText += '"\n';
          logText += ' time="';
          logText += t.time;
          logText += '"\n';
          t.failures.forEach( function (f){
            logText += ' message="';
            logText += f.message;
            logText += '"\n';
            logText += f.stack;
          });
        };
      });

    });

    fs.writeFile((options.savePath + "/" + options.saveFilename), logText, function (err) {
      if (err) return console.log(err);
    });
  };
};