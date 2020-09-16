/**
 * Copyright reelyActive 2015-2020
 * We believe in an open Internet of Things
 */


const advDataTypes = require('./advdatatypes');
const utils = require('./utils');


const MIN_DATA_TYPE_LENGTH_BYTES = 2;


/**
 * Process a raw Bluetooth Low Energy advertising packet's advData.
 * @param {Buffer} data The advData.
 * @param {Number} offset The optional offset into the buffer.
 * @return {Object} The processed advData.
 */
function process(data, offset) {
  let buf = utils.convertToBuffer(data);
  if((buf === null) || (buf.length < MIN_DATA_TYPE_LENGTH_BYTES)) {
    return null;
  }

  let advDataProperties = {};
  let dataTypeIndex = offset || 0;
  let isAnotherDataType = (dataTypeIndex < buf.length);

  // Iterate over each data type present in the advData
  while(isAnotherDataType) {
    let dataTypeProperties = advDataTypes.process(buf, dataTypeIndex);

    if(dataTypeProperties === null) {
      return null;
    }

    Object.assign(advDataProperties, dataTypeProperties);

    let length = buf.readUInt8(dataTypeIndex);
    dataTypeIndex += length + 1;
    isAnotherDataType = (dataTypeIndex < buf.length);
  }

  return advDataProperties;
}


module.exports.process = process;