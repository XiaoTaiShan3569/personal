'use strict'
// module.exports = {
//   NODE_ENV: '"production"'
// }

const buildtype = process.argv.slice(2)[0]
console.log('--- start build ----',buildtype)
const obj = {
  NODE_ENV: '"production"'
}
switch (buildtype) {
    case 'pro':
      process.env.srconfig = 'pro';
      obj.srconfig = '"pro"';
      break;
    default:
        process.env.srconfig = '';
        obj.srconfig = '""';
        break;
}

module.exports = obj;
