advlib-ble
==========

Wireless advertising packet decoding library for Bluetooth Low Energy.


Installation
------------

    npm install advlib-ble


Hello advlib-ble!
-----------------

```javascript
const advlib = require('advlib-ble');

let packet = 'c21d04acbe55daba16096164766c6962206279207265656c79416374697665';
let processedPacket = advlib.process(packet);

console.log(processedPacket);
```

Which should yield the following console output:

    { rxAdd: "random",
      txAdd: "random",
      type: "ADV_NONCONN_IND",
      length: 29,
      advA: "bada55beac04",
      name: "advlib by reelyActive" }


License
-------

MIT License

Copyright (c) 2015-2020 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.