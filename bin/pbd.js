#!/usr/bin/env node

/* pixiv-bookmark-downloader
   get your pixiv bookmark and download
   MIT Licensed
*/

var request = require("request").defaults({ jar: true }),
	progress = require('request-progress'),
	cheerio = require("cheerio"),
	async = require("async"),
	fs = require("fs"),
	program = require("commander"),
	chalk = require('chalk'),
	Gauge = require('gauge');
var info = require("../lib/info");
var getInfo = require("../lib/renewlib.js");

var device_token = '', username = '', password = '', bookmark="show", resio = 'result.json', mode='update';

var result = {
	Version: "2.0.0",
	name: "Empty",
	date: GetDate(),
	tags: [],
	length: 0,
	data: []
};

program
	.version('0.9.13')
	.option('-u, --username, --user [username]', 'pixiv id/e-mail')
	.option('-p, --password [password]', 'password')
	.option('-c, --config [file]', 'login pixiv using config')
	.option('-d, --download [result]', 'download image frome result. default is result.json')
	.option('-t, --type [show/hide]', 'type of bookmark. default is show')
	.option('-o, --output [file]', 'output result filename. default is result.json')
	.option('-m, --mode [new/update]', 'result output mode, if result file exists default is update')
	.option('--debug', 'debug flag, add debug info to output')
	.parse(process.argv);

var isdl = false;
if (program.download) {
	isdl = true;
	if (program.download.length != undefined) resio = program.download;
}


if (program.type) bookmark = program.type;
if (bookmark != 'show' && bookmark != 'hide'){
	console.log('invalid bookmark type!');
	process.exit();
}

if (program.output && program.output.length != 0) {
	resio = program.output;
}

if (program.mode) mode = program.mode;
if (mode != 'new' && mode != 'update') {
	console.log('invalid mode type!');
	process.exit();
} else if (!fs.existsSync(resio) && mode == 'update') {
	console.log(resio + "is not exists, can't use update mode");
	process.exit();
} else {
	result = JSON.parse(fs.readFileSync(resio));
	if (result.version == undefined) {
		console.log('unsupport version. please use pbd-renew to update ' + resio);
		process.exit();
	}
}

var firstrun = true; //棄用tugh-cookie-filestore
var j = request.jar();
request = request.defaults({ jar: j });

if (program.config && fs.existsSync(program.config)) {
	fs.readFile(program.config, function read(err, data) {
		if (err) {
			throw err;
		} else {
			username = JSON.parse(data).username;
			password = JSON.parse(data).password;
			info();
			Gettoken();
		}
	});
} else if (!program.username || !program.password) {
	if (!firstrun) {
		Hello();
	} else {
		console.log("require username and password!");
		process.exit();
	}
} else if (program.username.length > 5 || program.password.length > 6) {
	username = program.username;
	password = program.password;
	info();
	Gettoken();
} else {
	console.log("invalid username or password!");
	process.exit();
}


/*request 制定三個回傳函數 error response body */
function Gettoken() {
	request({
		url: "https://accounts.pixiv.net/login",
		method: "GET",
	}, function (e, r, b) {
		if (!e) {
			var $ = cheerio.load(b);
			device_token = $('input[name="post_key"]').val();
			console.log('get post_key/device_token:' + device_token);
			Login();
		} else {
			console.log("ERROR at step 1(get post_key/device_token):" + e + b);
		}
	});
}

function Login() {
	request.post({
		url: "https://accounts.pixiv.net/api/login?lang=zh_tw",
		header: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36' },
		form: { 'password': password, 'pixiv_id': username, 'post_key': device_token }
	}, function (e, r, b) {
		if (!e && JSON.parse(b).error == true) {
			console.log("ERROR:" + b);
		} else if (!e && JSON.parse(b).error == false && JSON.parse(b).body.success) {
			console.log('Login success!');
			Hello();
		} else if (!e && JSON.parse(b).body.validation_errors.pixiv_id) {
			console.log('Login fail! Please check your username or password');
		} else {
			console.log("ERROR at step 2(Login):" + e);
		}
	});
}

function GetDate() {
	var dt = new Date();
	var dtm, dtd;
	dtm = dt.getMonth() < 10 ? "0"+ ( dt.getMonth() + 1 ) : dt.getMonth() + 1;
	dtd = dt.getDate() < 10 ? "0" + dt.getDate() : dt.getDate();
	return dt.getFullYear() + "-" + dtm + "-" + dtd;
}


function Hello() {
	request({
		url: "https://www.pixiv.net/",
		method: "GET"
	}, function (e, r, b) {
		if (!e) {
			var $ = cheerio.load(b);
			if ($('.user-name').eq(0).text()) {
				console.log("Hello! " + $('.user-name').eq(0).text());
				if (isdl) {
					GetDataPage();
				} else {
					if (mode=='update' && $('.user-name').eq(0).text() != result.name) {
						console.log('output mode is update, but username is not match. abort');
						process.exit();
					}
					result.name = $('.user-name').eq(0).text();
					GetBookmarkPage();
				}
			} else {
				console.log("cookie is Expired. use login argument");
				process.exit();
			}
		}
	})
}

var lastid = mode=='update' ? result.data[0].id : '00000000';

function GetBookmarkPage() {
	var trycount = 0;
	var isEnd = false;
	var pages = 1;
	if (mode='update') var old_data = result.data;
	result.length = 0;
	result.data = [];
	console.log("Start getting bookmark...");
	async.whilst(function () {
		return !isEnd;
	},
		function (next) {
			request({
				url: "https://www.pixiv.net/bookmark.php?rest="+ bookmark +"&p=" + pages,
				method: "GET"
			}, function (e, r, b) {
				if (!e) {
					trycount = 0;
					var $ = cheerio.load(b);
					if ($('span.next > a').attr('href') == undefined) isEnd = true;
					GetBookmarkData(b, pages, function (stopflag = false) {
						isEnd = (isEnd||stopflag);
						pages++;
						next();
					})
				} else if (trycount > 3) {
					console.log("try too much time but still fail, process will exit after save result.")
					result.Error = "Stop at " + pages + "page";
					isEnd = true;
					next();
				} else {
					console.log("request bookmark page fail, now reloading");
					trycount++;
					next();
				}
			});
		},
		function (err) {
			if (mode='update'){
				console.log('add ' + result.length + ' data row.');
				old_data.forEach((item)=>{
					result.data.push(item);
					result.length++;
				})
			}
			console.log("Done! Output result to " + resio);
			fs.writeFileSync(resio, JSON.stringify(result, null, "\t"));
			process.exit();
		})
}

function GetBookmarkData(body, pages,callback) {
	var $ = cheerio.load(body);
	var items = $('div.display_editable_works > ul._image-items > li.image-item');
	var stopflag = false;
	for (i = 0; i < items.length; i++) {
		if (items.eq(i).children("a").length > 2) {
			if (lastid == items.eq(i).find('a > div > img').attr('data-id')) {
				stopflag = true;
				break;
			}
            let temp = {
				id: items.eq(i).find('a > div > img').attr('data-id'),
				title: items.eq(i).find('a > h1.title').text(),
				tag: items.eq(i).find('a > div > img').attr('data-tags'),
				author: items.eq(i).children('a').eq(2).text(),
				author_id: items.eq(i).children('a').eq(2).attr('data-user_id'),
				author_link: "https://www.pixiv.net/" + items.eq(i).children('a').eq(2).attr('href'),
				link: "https://www.pixiv.net/" + items.eq(i).find('a.work').attr('href'),
				type: (function () {
					if (items.eq(i).find('a.work').hasClass('ugoku-illust')) {
						return "gif"
					} else if (items.eq(i).find('a > div > img').attr('data-src') == "https://source.pixiv.net/common/images/limit_mypixiv_s.png?20110520") {
						return "friend-only"
					} else if (items.eq(i).find('a.work').hasClass('multiple')) {
						return "manga"
					} else {
						return "illust"
					}
				})(),
				isdownloaded: false
			};
            if (program.debug) {
                temp['serial'] = i;
                temp['pages'] = pages;
            }
			result.data.push(temp);
			let tags = temp["tag"].split(" ");
			result.tags = getInfo.insertTags(result.tags, tags);
			result.length++;
			console.log(result.length + ": " + chalk.blue(temp.title) + "(" + temp.id + ")" + " by " + chalk.green(temp.author));
		}
	}
	callback(stopflag);
}

//download image function

function GetDataPage() {
	if (!fs.existsSync(resio)) {
		console.log(resio +' is not exist!');
		process.exit();
	}
	if (!fs.existsSync('image')) {
		fs.mkdirSync("image");
	}
	var count = 0;
	result = JSON.parse(fs.readFileSync(resio));
	try {
		if (!result.Version == 1.5) {
			console.log('result format is invalid!');
			process.exit();
		}
	} catch(e) {
		console.log('result format is invalid!');
		process.exit();
	}
	allprocess = result.numofdata;
	async.whilst(function () {
		return count < result.numofdata
	}, function (next) {
		switch (result.data[count].type) {
			case "illust":
				Getillust(result.data[count], function () {
					count++;
					next();
				});
				break;
			case "gif":
				Getgif(result.data[count], function () {
					count++;
					next();
				});
				break;
			case "manga":
				if (!fs.existsSync('image/' + result.data[count].id)) fs.mkdirSync('image/'+ result.data[count].id);
				Getmangalength(result.data[count], function() {
					count++
					next();
				})
				break;
			default:
				console.log(chalk.blue('[info]skip friend-only: ' + result.data[count].title + "(" + result.data[count].id + ")"));
				nowprocess++;
				count++;
				next();
				break;
		}
	}, function (err) {
		console.log('all done!');
	})
}

function Getillust(data, callback) {
	var trycount = 0;
	request({
		url: data.link,
		mothod: "GET"
	}, function (e, r, b) {
		if (!e && r.statusCode == 200) {
			var $ = cheerio.load(b);
			var original_url = $("script").eq(5).text().substring($("script").eq(5).text().indexOf("\"original\":")+12,$("script").eq(5).text().indexOf(data.id + "_p0",$("script").eq(5).text().indexOf("\"original\":")) + data.id.toString().length + 7).replace(/\\\//ig, "/");
			if (original_url != undefined) {
				async.whilst(function () {
					return trycount < 3;
				}, function (next) {
					message = data.title; nowprocess++;
					GetImg(data.id, original_url, 0, function () {
						console.log(chalk.green('[success]' + original_url));
						trycount = 3;
						next();
					}, function (dpath) {
						console.log(chalk.red('[fail]' + original_url));
						trycount++;
						if (trycount == 3) {
							fs.unlinkSync(dpath);
						}
						next();
					});
				}, function (err) {
					callback();
				});
			} else {
				Getillustbig(data, function(){
					callback();
				});
			}
		} else {
			console.log(chalk.red('[error]can\'t get illust page, ' + data.id + ' will skip.'));
			callback();
		}
	});
}

function Getillustbig(data, callback) {
	var trycount = 0;
	request({
		url: "https://www.pixiv.net/member_illust.php?mode=big&illust_id=" + data.id,
		mothod: "GET",
		headers: { 'Referer': data.link }
	}, function(e,r,b){
		if (!e && r.statusCode == 200) {
			var $ = cheerio.load(b);
			async.whilst(function () {
				return trycount < 3;
			}, function (next) {
				message = data.title; nowprocess++;
				GetImg(data.id, $('img').eq(0).attr('src'), 0, function () {
					console.log(chalk.green('[success]' + $('img').eq(0).attr('src')));
					trycount = 3;
					next();
				}, function (dpath) {
					console.log(chalk.red('[fail]' + $('img').eq(0).attr('src')));
					trycount++;
					if (trycount == 3) {
						fs.unlinkSync(dpath);
					}
					next();
				});
			}, function (err) {
				callback();
			});
		}
	})
}

function Getmangalength(data, callback) {
	request({
		url: "https://www.pixiv.net/member_illust.php?mode=manga&illust_id=" + data.id,
		mothod: "GET"
	}, function(e,r,b){
		if (!e && r.statusCode == 200) {
			var $ = cheerio.load(b);
			nowprocess++;
			Getmanga(data, $("._icon-full-size").length, function () {
				callback();
			})
		}
	})
}

function Getmanga(data, mlength, callback) {
	var nowimg = 0,trycount = 0;
	async.whilst(function () {
		return nowimg < mlength;
	}, function (nextimg) {
		request({
			url: "https://www.pixiv.net/member_illust.php?mode=manga_big&illust_id=" + data.id + "&page=" + nowimg,
			mothod: "GET"
		}, function (e, r, b) {
			if (!e && r.statusCode == 200) {
				var $ = cheerio.load(b);
				async.whilst(function () {
					return trycount < 3;
				}, function (next) {
					message = data.title + " " + (nowimg + 1) + "/" + mlength;
					GetImg(data.id, $('img').eq(0).attr('src'), nowimg + 1, function () {
						console.log(chalk.green('[success]' + $('img').attr('src')));
						trycount = 3;
						next();
					}, function (dpath) {
						console.log(chalk.red('[fail]' + $('img').attr('src')));
						trycount++;
						if (trycount == 3) {
							fs.unlinkSync(dpath);
						}
						next();
					});
				}, function (err) {
					trycount = 0;
					nowimg++;
					nextimg();
				});
			}
		})
	}, function (err) {
		callback();
	})
}

function Getgif(data, callback) {
	var trycount = 0;
	request({
		url: data.link,
		mothod: "GET"
	}, function (e, r, b){
		if (!e && r.statusCode == 200) {
			var $ = cheerio.load(b);
			var gifzip = ($("script").eq(5).text().substring($("script").eq(5).text().indexOf("\"original\":")+12,$("script").eq(5).text().indexOf(data.id + "_ugoira0",$("script").eq(5).text().indexOf("\"original\":"))+data.id.toString().length + 7).replace(/\\\//ig, "/") + "600x600.zip").replace(/img-original/ig, "img-zip-ugoira")
			if (gifzip != undefined) {
				async.whilst(function () {
					return trycount < 3;
				}, function (next) {
					message = data.title; nowprocess++;
					GetImg(data.id, gifzip, 0, function () {
						console.log(chalk.green('[success]' + gifzip));
						trycount = 3;
						next();
					}, function (dpath) {
						console.log(chalk.red('[fail]' + gifzip));
						trycount++;
						if (trycount == 3) {
							fs.unlinkSync(dpath);
						}
						next();
					});
				}, function (err) {
					callback();
				});
			}
		}
	})
}

var processes = new Gauge();
var message, nowprocess = 0, allprocess;
function processbar(person) {
	processes.pulse(message);
	processes.show("Downlaoding... " + nowprocess + "/" + allprocess, nowprocess*(1/allprocess));
}

function GetImg(id, iurl, part, callback, fail) {
	var statuscode, dpath,
		ext = iurl.substr(iurl.lastIndexOf('.'), iurl.length);
	if (part > 0) {
		dpath = 'image/' + id + '/' + part + ext;
	} else {
		dpath = 'image/' + id + ext;
	}
	if (!fs.existsSync(dpath)) {
		progress(request(iurl, {
			headers: { 'Referer': "https://www.pixiv.net/" },
			method: "GET"
		}), {}).on('response', function (response) {
		}).on('progress', function (state) {
			processbar(state.person);
		}).on('error', function (err) {
			fail(dpath);
		}).on('end', function () {
			callback();
		}).pipe(fs.createWriteStream(dpath))
	} else {
		message = '';
		processbar(0);
		callback();
	}
}
