/**
 * Copyright reelyActive 2015-2020
 * We believe in an open Internet of Things
 */


/**
 * Convert the given hexadecimal string or Buffer to a Buffer.
 * @param {Object} data A hexadecimal-string or Buffer.
 * @return {Object} The data as a Buffer, or null if invalid data format.
 */
function convertToBuffer(data) {
  if(Buffer.isBuffer(data)) {
    return data;
  }

  if(typeof data === 'string') {
    data = data.toLowerCase();
    let isHex = /[0-9a-f]+/.test(data);
    if(isHex) {
      return Buffer.from(data, 'hex');
    }
  }

  return null;
}


/**
 * Parse a raw Bluetooth Low Energy advertising packet address.
 * @param {Buffer} data The address.
 * @return {String} The parsed address as a hexadecimal string.
 */
function parseAddress(data) {
  let buf = convertToBuffer(data);
  if(buf === null) {
    return null;
  }

  let address = ('00000000000' + buf.readUIntLE(0, 6).toString(16)).substr(-12);

  return address;
}


module.exports.convertToBuffer = convertToBuffer;
module.exports.parseAddress = parseAddress;