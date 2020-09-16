/**
 * Copyright reelyActive 2015-2020
 * We believe in an open Internet of Things
 */


const header = require("../../lib/advdata.js");
const assert = require ('assert');


// Input data for the scenario
const INPUT_DATA_INVALID_LENGTH = 'ff0000';


// Expected outputs for the scenario
const EXPECTED_DATA_INVALID_INPUT = null;


// Describe the scenario
describe('advData', function() {

  // Test the process function with no input data
  it('should handle no input data', function() {
    assert.deepEqual(header.process(), EXPECTED_DATA_INVALID_INPUT);
  });

  // Test the process function with invalid length
  it('should handle an invalid length', function() {
    assert.deepEqual(header.process(INPUT_DATA_INVALID_LENGTH),
                     EXPECTED_DATA_INVALID_INPUT);
  });

});