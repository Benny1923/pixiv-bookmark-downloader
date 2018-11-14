var fs = require("fs");
var path = require("path");
var program = require("commander");
var getInfo = require("../lib/renewlib.js");

const default_conf = {
    SourceFile: "result.json",
    ImageDir: "image",
    OutputFile: "result.json"
}

var data;

program
    .version("1.0.0")
    .description("convert PBD result from v1.5 to v2.0")
    .usage("<file> [options]")
    .arguments("<file>")
    .action(function(file){
        if (file) default_conf.SourceFile = default_conf.OutputFile = file;
    })
    .option("-d, --directory <directory>", "check directory. default is 'image'") 
    .option("-o, --output <file>", "output to new file (optional)")
    .parse(process.argv);

//change config
if (program.directory) default_conf.ImageDir = program.directory;
if (program.output) default_conf.OutputFile = program.output;

//try to read file
try {
    data = JSON.parse(fs.readFileSync(default_conf.SourceFile));
} catch (error) {
    console.log("Read File " + error);
    process.exit();
}

//check version
if (data.version >= 2.0) {
    console.log("result is up to date")
    process.exit();
}

//print start message
console.log("starting upgrader...");

var new_data = {
    version: "2.0.0",
    name: data.User,
    date: data.date,
    tags: [],
    length: 0,
    data: []
};

//list base directory
let fileList = fs.readdirSync(default_conf.ImageDir);

data.data.forEach(function(item, index, array){
    //tarnsferring data
    let temp = {
        id: item.id,
        title: item.title,
        tag: item.tag,
        author: item.author,
        author_id: item.author_id,
        author_link: item.author_link,
        link: item.link,
        type: item.type
    }
    
    let tags = temp["tag"].split(" ");
    new_data.tags = getInfo.insertTags(new_data.tags, tags);
    
    //check file or directory exists
    let thePath = default_conf.ImageDir + "/" + fileList.find(x=>x.match(item.id));
    if (!fs.existsSync(thePath)) {
        temp.isdownloaded = false;
    } else if (fs.existsSync(thePath) && fs.lstatSync(thePath).isDirectory()) {
        temp.isdownloaded = true;
        temp.fileinfo = [];
        let files = getInfo.scanDir(thePath);
        files.forEach(function(file){
           temp.fileinfo.push(getInfo.getDetail(default_conf.ImageDir+"/"+item.id+"/"+file)); 
        });
    } else if (fs.existsSync(thePath) && fs.lstatSync(thePath).isFile() && path.extname(thePath) == ".zip"){
        temp.isdownloaded = true;
        temp.fileinfo = [{
            fullname: path.basename(thePath),
            ext: path.extname(thePath).replace(".", ""),
            size: fs.statSync(thePath)["size"]
        }];
    } else if (fs.existsSync(thePath) && fs.lstatSync(thePath).isFile()) {
        temp.isdownloaded = true;
        temp.fileinfo = [];
        temp.fileinfo.push(getInfo.getDetail(thePath));
    }
    
    new_data.data.push(temp);
});

new_data.length = new_data.data.length;

fs.writeFileSync(default_conf.OutputFile, JSON.stringify(new_data, null, "\t"));
