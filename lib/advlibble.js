/**
 * Copyright reelyActive 2015-2021
 * We believe in an open Internet of Things
 */


const advData = require('./advdata');
const header = require('./header');
const utils = require('./utils');


const MIN_PACKET_LENGTH_BYTES = 8;


/**
 * Process a raw Bluetooth Low Energy radio packet data unit (PDU) into
 * semantically meaningful information.
 * @param {Object} data The raw PDU as a hexadecimal-string or Buffer.
 * @param {Array} libraries Optional ordered list of processing libraries.
 * @param {Object} options Optional processing options.
 * @return {Object} The processed PDU as JSON.
 */
function process(data, libraries, options) {
  let buf = utils.convertToBuffer(data);
  if((buf === null) || (buf.length < MIN_PACKET_LENGTH_BYTES)) {
    return null;
  }
  options = options || {};

  let headerProperties = header.process(buf.subarray(0, 2));
  let processedPacket = {};
  let advA;
  let includeProtocolOverhead = (options.ignoreProtocolOverhead !== true);

  if(includeProtocolOverhead) {
    Object.assign(processedPacket, headerProperties);
  }

  // Process the packet based on its type (Bluetooth Core, Vol 6, Part B, 2.3)
  switch(headerProperties.type) {
    case 'ADV_IND':
    case 'ADV_NONCONN_IND':
    case 'ADV_SCAN_IND':
    case 'SCAN_RSP':
    case 'ADV_SCAN_IND':
      if(includeProtocolOverhead) {
        processedPacket.advA = utils.parseAddress(buf.subarray(2, 8));
      }
      let advDataProperties = advData.process(buf.subarray(8), 0, libraries,
                                              options);
      Object.assign(processedPacket, advDataProperties);
      break;
    case 'ADV_DIRECT_IND':
      let targetA = utils.parseAddress(buf.subarray(8, 14));
      if(includeProtocolOverhead) {
        processedPacket.advA = utils.parseAddress(buf.subarray(2, 8));
        processedPacket.targetA = targetA;
      }
      // TODO: include targetA in nearest?
      break;
    case 'SCAN_REQ':
      advA = utils.parseAddress(buf.subarray(8, 14));
      if(includeProtocolOverhead) {
        processedPacket.scanA = utils.parseAddress(buf.subarray(2, 8));
        processedPacket.advA = advA;
      }
      processedPacket.uri = 'https://sniffypedia.org/Product/Any_Curious-Device/';
      // TODO: include advA in nearest?
      break;
    case 'CONNECT_IND':
      advA = utils.parseAddress(buf.subarray(8, 14));
      if(includeProtocolOverhead) {
        processedPacket.initA = utils.parseAddress(buf.subarray(2, 8));
        processedPacket.advA = advA;
        // TODO: parse llData
      }
      // TODO: include advA in nearest?
      break;
    case 'ADV_EXT_IND':
      // TODO: Common Extended Advertising Payload Format
      break;
  }

  if(!processedPacket.hasOwnProperty('uri')) {
    processedPacket.uri = 'https://sniffypedia.org/Product/Any_BLE-Device/';
  }

  return processedPacket;
}


module.exports.process = process;
module.exports.header = header;