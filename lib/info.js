var fs = require('fs');

function welcome() {
    var info = fs.readFileSync(__dirname + "/info/1.txt","utf-8");
    console.log(info);
}

module.exports = welcome;