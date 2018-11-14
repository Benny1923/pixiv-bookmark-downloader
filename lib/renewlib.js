var fs = require("fs");
var path = require("path");
var sizeOf = require("image-size");

var info = new Function();

info.scanDir = function(dirpath) {
    return fs.readdirSync(dirpath);
}

info.getDetail = function(filepath) {
    let detail = {
        fullname: path.basename(filepath),
        ext: path.extname(filepath).replace(".", ""),
        height: sizeOf(filepath).height,
        width: sizeOf(filepath).width,
        size: fs.statSync(filepath)["size"]
    }
    return detail;
}

info.insertTags = function(db, src) {
    src.forEach((item)=>{
        if (db.find(x=>x==item)===undefined) {
            db.push(item);
        }
    });
    return db;
}

module.exports = info;
