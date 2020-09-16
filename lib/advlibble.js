/**
 * Copyright reelyActive 2015-2020
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
 * @return {Object} The processed PDU as JSON.
 */
function process(data) {
  let buf = utils.convertToBuffer(data);
  if((buf === null) || (buf.length < MIN_PACKET_LENGTH_BYTES)) {
    return null;
  }

  let headerProperties = header.process(buf.subarray(0, 2));
  let processedPacket = Object.assign({}, headerProperties);
  let advA;

  // Process the packet based on its type (Bluetooth Core, Vol 6, Part B, 2.3)
  switch(headerProperties.type) {
    case 'ADV_IND':
    case 'ADV_NONCONN_IND':
    case 'ADV_SCAN_IND':
    case 'SCAN_RSP':
    case 'ADV_SCAN_IND':
      advA = utils.parseAddress(buf.subarray(2, 8));
      let advData = {}; // TODO: parse
      Object.assign(processedPacket, { advA: advA }, advData);
      break;
    case 'ADV_DIRECT_IND':
      advA = utils.parseAddress(buf.subarray(2, 8));
      let targetA = utils.parseAddress(buf.subarray(8, 14));
      Object.assign(processedPacket, { advA: advA, targetA: targetA });
      break;
    case 'SCAN_REQ':
      let scanA = utils.parseAddress(buf.subarray(2, 8));
      advA = utils.parseAddress(buf.subarray(8, 14));
      Object.assign(processedPacket, { scanA: scanA, advA: advA });
      break;
    case 'CONNECT_IND':
      let initA = utils.parseAddress(buf.subarray(2, 8));
      advA = utils.parseAddress(buf.subarray(8, 14));
      let llData = {}; // TODO: parse
      Object.assign(processedPacket, { initA: initA, advA: advA }, llData);
      break;
    case 'ADV_EXT_IND':
      // TODO: Common Extended Advertising Payload Format
      break;
  }

  return processedPacket;
}


module.exports.process = process;
module.exports.header = header;