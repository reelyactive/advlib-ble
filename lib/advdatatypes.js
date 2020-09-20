/**
 * Copyright reelyActive 2015-2020
 * We believe in an open Internet of Things
 */


const assignedNumbers = require('./assignednumbers');
const utils = require('./utils');


const MIN_DATA_TYPE_LENGTH_BYTES = 2;
const DATA_TYPE_OFFSET = 1;
const DATA_VALUE_OFFSET = 2;


/**
 * Process a raw Bluetooth Low Energy advertising data type.
 * @param {Buffer} data The advData.
 * @param {Number} offset The optional offset into the buffer.
 * @param {Array} libraries Optional ordered list of processing libraries.
 * @return {Object} The processed advertising data type.
 */
function process(data, offset, libraries) {
  let buf = utils.convertToBuffer(data);
  if((buf === null) || (buf.length < MIN_DATA_TYPE_LENGTH_BYTES)) {
    return null;
  }

  let dataTypeIndex = offset || 0;
  let length = buf.readUInt8(dataTypeIndex);
  let isInvalidLength = ((dataTypeIndex + length + 1) > buf.length);
  if(isInvalidLength) {
    return null;
  }

  let type = buf.readUInt8(dataTypeIndex + DATA_TYPE_OFFSET);
  let value = buf.subarray(dataTypeIndex + DATA_VALUE_OFFSET,
                           dataTypeIndex + DATA_TYPE_OFFSET + length);
                           
  switch(type) {
    case 0x01: // Flags
      return processFlags(value);
    case 0x02: // Incomplete 16-bit UUIDs
    case 0x03: // Complete 16-bit UUIDs
      return process16BitUUIDs(value);
    case 0x04: // Incomplete 32-bit UUIDs
    case 0x05: // Complete 32-bit UUIDs
      return process32BitUUIDs(value);
    case 0x06: // Incomplete 128-bit UUIDs
    case 0x07: // Complete 128-bit UUIDs
      return process128BitUUIDs(value);
    case 0x08: // Shortened local name
    case 0x09: // Complete local name
      return processName(value);
    case 0x0a: // Tx Power
      return processTxPower(value);
    case 0x16: // 16-bit Service Data
      return process16BitServiceData(value, libraries);
    case 0x19: // Appearance
      return processAppearance(value);
    case 0x20: // 32-bit Service Data
      return process32BitServiceData(value, libraries);
    case 0x21: // 128-bit Service Data
      return process128BitServiceData(value, libraries);
    case 0x24: // URI
      return processURI(value);
    case 0xff: // Manufacturer Specific Data
      return processManufacturerSpecificData(value, libraries);
  }

  return {};
}


/**
 * Process flags.
 * @param {Buffer} data The flag data value.
 * @return {Object} The data type properties.
 */
function processFlags(data) {
  let flagByte = data.readUInt8();
  let flags = [];

  for(let cFlag = 0; cFlag <= 4; cFlag++) {
    if(flagByte & (1 << cFlag)) {
      flags.push(cFlag);
    }
  }

  return { flags: flags };
}


/**
 * Process 16-bit UUID(s).
 * @param {Buffer} data The UUID(s) data value.
 * @return {Object} The data type properties.
 */
function process16BitUUIDs(data) {
  let isInvalidLength = ((data.length % 2) !== 0);
  if(isInvalidLength) {
    return null;
  }

  let uuids = [];

  for(let index = 0; index < data.length; index += 2) {
    let uuid = utils.convertToHexString(data.readUInt16LE(index), 2);
    uuids.push(uuid);
  }

  return { uuids: uuids };
}


/**
 * Process 32-bit UUID(s).
 * @param {Buffer} data The UUID(s) data value.
 * @return {Object} The data type properties.
 */
function process32BitUUIDs(data) {
  let isInvalidLength = ((data.length % 4) !== 0);
  if(isInvalidLength) {
    return null;
  }

  let uuids = [];

  for(let index = 0; index < data.length; index += 4) {
    let uuid = utils.convertToHexString(data.readUInt32LE(index), 4);
    uuids.push(uuid);
  }

  return { uuids: uuids };
}


/**
 * Process 128-bit UUID(s).
 * @param {Buffer} data The UUID(s) data value.
 * @return {Object} The data type properties.
 */
function process128BitUUIDs(data) {
  let isInvalidLength = ((data.length % 16) !== 0);
  if(isInvalidLength) {
    return null;
  }

  let uuids = [];

  for(let index = 0; index < data.length; index += 16) {
    let uuid = utils.convertToHexString(data.subarray(index, index + 16), 16,
                                        true);
    uuids.push(uuid);
  }

  return { uuids: uuids };
}


/**
 * Process name.
 * @param {Buffer} data The name data value.
 * @return {Object} The data type properties.
 */
function processName(data) {
  return { name: data.toString() };
}


/**
 * Process Tx Power.
 * @param {Buffer} data The Tx Power data value.
 * @return {Object} The data type properties.
 */
function processTxPower(data) {
  let txPower = data.readInt8();

  return { txPower: txPower };
}


/**
 * Process appearance.
 * @param {Buffer} data The appearance data value.
 * @return {Object} The data type properties.
 */
function processAppearance(data) {
  let appearance = data.readUInt16LE();

  return { appearance: appearance };
}


/**
 * Process 16-bit service data.
 * @param {Buffer} data The service data value.
 * @param {Array} libraries Optional ordered list of processing libraries.
 * @return {Object} The data type properties.
 */
function process16BitServiceData(data, libraries) {
  let uuid = utils.convertToHexString(data.readUInt16LE(), 2);
  let serviceData = data.subarray(2);
  let serviceDataProperties = processServiceDataFromLibraries(uuid, serviceData,
                                                              libraries);
  let isProcessedByLibrary = (serviceDataProperties !== null);

  if(isProcessedByLibrary) {
    return serviceDataProperties;
  }

  return { serviceData: [ { uuid: uuid, data: serviceData.toString('hex') } ] };
}


/**
 * Process 32-bit service data.
 * @param {Buffer} data The service data value.
 * @param {Array} libraries Optional ordered list of processing libraries.
 * @return {Object} The data type properties.
 */
function process32BitServiceData(data, libraries) {
  let uuid = utils.convertToHexString(data.readUInt32LE(), 4);
  let serviceData = data.subarray(4);
  let serviceDataProperties = processServiceDataFromLibraries(uuid, serviceData,
                                                              libraries);
  let isProcessedByLibrary = (serviceDataProperties !== null);

  if(isProcessedByLibrary) {
    return serviceDataProperties;
  }

  return { serviceData: [ { uuid: uuid, data: serviceData.toString('hex') } ] };
}


/**
 * Process 128-bit service data.
 * @param {Buffer} data The service data value.
 * @param {Array} libraries Optional ordered list of processing libraries.
 * @return {Object} The data type properties.
 */
function process128BitServiceData(data, libraries) {
  let uuid = utils.convertToHexString(data.subarray(0, 16), 16, true);
  let serviceData = data.subarray(16);
  let serviceDataProperties = processServiceDataFromLibraries(uuid, serviceData,
                                                              libraries);
  let isProcessedByLibrary = (serviceDataProperties !== null);

  if(isProcessedByLibrary) {
    return serviceDataProperties;
  }

  return { serviceData: [ { uuid: uuid, data: serviceData.toString('hex') } ] };
}



/**
 * Process Uniform Resource Identifier (URI).
 * @param {Buffer} data The URI data value.
 * @return {Object} The data type properties.
 */
function processURI(data) {
  let schemaCodePoint = data.readUInt8();
  let isInvalidSchema = ((schemaCodePoint <= 0) || (schemaCodePoint >=
                                      assignedNumbers.URI_SCHEME_NAMES.length));
  if(isInvalidSchema) {
    return null;
  }

  let uri = assignedNumbers.URI_SCHEME_NAMES[schemaCodePoint];
  uri += data.toString('utf8', 1);

  return { uri: uri };
}


/**
 * Process manufacturer specific data.
 * @param {Buffer} data The manufacturer specific data value.
 * @param {Array} libraries Optional ordered list of processing libraries.
 * @return {Object} The data type properties.
 */
function processManufacturerSpecificData(data, libraries) {
  let companyCode = data.readUInt16LE();
  let manufacturerData = data.subarray(2);
  let hasLibraries = (Array.isArray(libraries) && (libraries.length > 0));

  if(hasLibraries) {
    for(let cLibrary = 0; cLibrary < libraries.length; cLibrary++) {
      let library = libraries[cLibrary];
      if(utils.hasFunction(library, 'processManufacturerSpecificData')) {
        let manufacturerSpecificDataProperties =
                      library.processManufacturerSpecificData(companyCode,
                                                              manufacturerData);
        if(manufacturerSpecificDataProperties !== null) {
          return manufacturerSpecificDataProperties;
        }
      }
    }
  }

  let manufacturerSpecificData = {
      companyCode: companyCode,
      data: manufacturerData.toString('hex')
  };

  return { manufacturerSpecificData: [ manufacturerSpecificData ] };
}


/**
 * Attempt to process the given service data using the given libraries.
 * @param {String} uuid The service data uuid.
 * @param {Buffer} serviceData The service data value.
 * @param {Array} libraries Optional ordered list of processing libraries.
 * @return {Object} The service data properties.
 */
function processServiceDataFromLibraries(uuid, serviceData, libraries) {
  let hasLibraries = (Array.isArray(libraries) && (libraries.length > 0));

  if(hasLibraries) {
    for(let cLibrary = 0; cLibrary < libraries.length; cLibrary++) {
      let library = libraries[cLibrary];
      if(utils.hasFunction(library, 'processServiceData')) {
        let serviceDataProperties = library.processServiceData(uuid,
                                                               serviceData);
        if(serviceDataProperties !== null) {
          return serviceDataProperties;
        }
      }
    }
  }

  return null;
}


module.exports.process = process;