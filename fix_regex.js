const fs = require('fs');
let content = fs.readFileSync('src/formjson/deviceModel.js', 'utf8');

const oldRegex1 = "const phoneRegex = /^\\\\d{10,15}$/;";
const newRegex1 = "const phoneRegex = /^\\d{10,15}$/;";
content = content.replace(oldRegex1, newRegex1);

const oldRegex2 = "const cidrRegex = /^([0-9]{1,3}\\\\.)+$/;";
const oldRegex3 = "const cidrRegex = /^([0-9]{1,3}\\\\.){3}[0-9]{1,3}\\\\/([0-9]|[1-2][0-9]|3[0-2])$/;";
const newRegex3 = "const cidrRegex = /^([0-9]{1,3}\\.){3}[0-9]{1,3}\\/([0-9]|[1-2][0-9]|3[0-2])$/;";
content = content.replace(oldRegex3, newRegex3);

const oldRegex4 = "const startEndRegex = /^([0-9]{1,3}\\\\.){3}[0-9]{1,3}-([0-9]{1,3}\\\\.){3}[0-9]{1,3}$/;";
const newRegex4 = "const startEndRegex = /^([0-9]{1,3}\\.){3}[0-9]{1,3}-([0-9]{1,3}\\.){3}[0-9]{1,3}$/;";
content = content.replace(oldRegex4, newRegex4);

fs.writeFileSync('src/formjson/deviceModel.js', content);
