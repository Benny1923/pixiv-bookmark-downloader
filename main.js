var request = require("request").defaults({jar: true}),
	progress = require('request-progress'),
	CookieJar = require("tough-cookie").CookieJar,
	FileCookieStore = require("tough-cookie-filestore"),
	cheerio = require("cheerio"),
	async = require("async"),
	fs = require("fs"),
	program = require("commander");
var device_token = '', username = '', password = '';
var data={};

program
  .version('Pixiv Bookmark Downloader 0.5.1 BETA')
  .option('-u, --username, --user [username]', 'pixiv id/e-mail')
  .option('-p, --password [password]', 'password')
  .option('-c, --config [file]', 'login pixiv using config')
	.option('-d, --download', 'download image frome result.josn if file exist')
  .parse(process.argv);

var isdl = false;
if (program.download) {
	isdl = true;
}

var firstrun = false;
// create the json file if it does not exist
if(!fs.existsSync('cookie.json') || fs.readFileSync('cookie.json', 'utf-8') == ""){
	fs.closeSync(fs.openSync('cookie.json', 'w'));
	firstrun = true;
} else if (program.username || program.password || program.config) {
	fs.unlinkSync('cookie.json');
	fs.closeSync(fs.openSync('cookie.json', 'w'));
}

var j = request.jar(new FileCookieStore('cookie.json'));
request = request.defaults({jar:j});

if (program.config && fs.existsSync(program.config)) {
	fs.readFile(program.config, function read(err, data) {
		if (err) {
			throw err;
		} else {
			username = JSON.parse(data).username;
			password = JSON.parse(data).password;
			Gettoken();
		}
	});
} else if(!program.username || !program.password){
	if (!firstrun) {
		Hello();
	} else {
		console.log("require username and password!");
		process.exit();
	}
} else if (program.username.length > 5 || program.password.length > 6) {
	username = program.username;
	password = program.password;
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
	}, function (e,r,b) {
		if (!e) {
			var $ = cheerio.load(b);
			device_token = $('input[name="post_key"]').val();
			console.log('get post_key/device _token:' + device_token);
			Login();
		} else {
			console.log("ERROR at step 1(get post_key/device_token):" + e + b);
		}
	});
}

function Login() {
	request.post({
		url: "https://accounts.pixiv.net/api/login?lang=zh_tw",
		header: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36'},
		form: {'password': password, 'pixiv_id': username, 'post_key': device_token}
	}, function (e,r,b) {
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
	if ((dt.getMonth() + 1).toString().length == 1) {
		dtm = "0" + (dt.getMonth() + 1);
	} else {
		dtm = dt.getMonth() + 1;
	}
	if (dt.getDate().toString().length == 1) {
		dtd = "0" + dt.getDate();
	} else {
		dtd = dt.getDate();
	}
	return dt.getFullYear() + "-" + dtm + "-" + dtd;
}

function Hello() {
	request({
		url: "http://pixiv.net/",
		method: "GET"
	}, function (e,r,b) {
		if (!e) {
			var $ = cheerio.load(b);
			if ($('.user').eq(0).text()) {
				console.log("Hello! " + $('.user').eq(0).text());
				if (!isdl) {
					data = {"Version": 1.0, "User": $('.user').eq(0).text(), "Date": GetDate(), "numofdata": 0, "data": {}};
					GetAllBookmark();
				} else {
					GetDataPage();
				}
			} else {
				console.log("cookie is Expired. use login argument");
				process.exit();
			}
		}
	})
}

function GetAllBookmark() {
	items = data["numofdata"];
	isEnd = false;
	count = 1;
	console.log("Start getting bookmark...");
	async.whilst(function(){
		return !isEnd;
	},
	function(next){
		request({
			url: "http://www.pixiv.net/bookmark.php?rest=show&p=" + count,
			method: "GET"
		}, function (e,r,b) {
			if (!e) {
				var $ = cheerio.load(b);
				if ($(".display_editable_works > ._image-items > li").html().length < 100) {
					isEnd = true;
					next();
				} else {
					var info = 0;
					var authornum = info;
					var blockurl = "http://source.pixiv.net/common/images/limit_mypixiv_s.png?20110520";
					async.whilst(function () {
					    return info < $(".display_editable_works > ._image-items > li").length;
					},
					function (nextinfo) {
						if ($(".display_editable_works > ._image-items > li ._layout-thumbnail > img").eq(info).attr("data-src") == blockurl) {
							authornum++
						} else if ($(".display_editable_works > ._image-items > li div._layout-thumbnail > img").eq(info).attr("data-id") != 0) {
							items++;
						  data["data"][items] = {};
						  data["data"][items]["id"] = $(".display_editable_works > ._image-items > li div._layout-thumbnail > img").eq(info).attr("data-id");
						  data["data"][items]["title"] = $(".display_editable_works > ._image-items > li h1.title").eq(info).text();
						  data["data"][items]["tag"] = $(".display_editable_works > ._image-items > li div._layout-thumbnail > img").eq(info).attr("data-tags");
						  data["data"][items]["author"] = $(".display_editable_works > ._image-items > li > a.user.ui-profile-popup").eq(authornum).text();
						  data["data"][items]["author_id"] = $(".display_editable_works > ._image-items > li > a.user.ui-profile-popup").eq(authornum).attr("data-user_id");
						  data["data"][items]["author_link"] = "http://www.pixiv.net/" + $(".display_editable_works > ._image-items > li > a.user.ui-profile-popup").eq(authornum).attr("href");
						  data["data"][items]["link"] = "http://www.pixiv.net/" + $(".display_editable_works > ._image-items > li > a.work._work").eq(authornum).attr("href");
						  data["numofdata"] = items;
						  console.log(String(data["numofdata"]) + ":");
						  console.log(data["data"][items]);
							authornum++;
						}
					  info++;
					  nextinfo();
					},
					function(err){
						count++;
						next();
					});
				}
			}
		});
	},
	function(err){
		console.log("Done! Output result to result.json");
		fs.writeFileSync("result.json", JSON.stringify(data, null, "\t"));
		process.exit();
	})
}

var Errordata = new Array;
function GetDataPage() {
	if (!fs.existsSync('result.json')) {
		console.log('result.json not exist!');
		process.exit();
	}
	var result = JSON.parse(fs.readFileSync("result.json", "utf-8"));
  var imgnum = 1, imgsrc, mangaurl;
  if (!fs.existsSync("image")){
    fs.mkdirSync("image");
  }
  async.whilst(function(){
    return imgnum < result["numofdata"];
  },function(next){
    request({
			url: result["data"][imgnum]["link"],
			method: "GET"
		}, function (e,r,b) {
			if (!e){
				var $ = cheerio.load(b);
				if ($("div#wrapper > div._illust_modal.ui-modal-close-box > div.wrapper > img.original-image").attr("data-src") != null){
					imgsrc = $("div#wrapper > div._illust_modal.ui-modal-close-box > div.wrapper > img.original-image").attr("data-src");
          console.log(result["data"][imgnum]["link"]);
          if (fs.existsSync("image/" + result["data"][imgnum]["id"] + imgsrc.substr(imgsrc.lastIndexOf('.'),imgsrc.length))) {
            console.log("skiped");
            imgnum++;
            next();
          } else {
            console.log(imgsrc);
            Imgdl(result["data"][imgnum]["id"], imgsrc, result["data"][imgnum]["link"], function() {
              imgnum++;
              next();
            });
          }
        } else if ($("div.works_display > a._work.multiple").attr("href") != null) {
          mangaurl = "http://www.pixiv.net/" + $("div.works_display > a._work.multiple").attr("href");
          console.log(result["data"][imgnum]["link"]);
          if (fs.existsSync("image/" + result["data"][imgnum]["id"])){
            console.log("skiped");
            imgnum++;
            next();
          } else {
            console.log(mangaurl);
            Getmangaimgurl(result["data"][imgnum]["id"], mangaurl, function(){
              imgnum++;
              next();
            });
          }
				} else {
          imgnum ++;
          next();
        }
			}
		})
  },function(err){
    console.log("download done! will output error report to error.json");
		fs.writeFileSync('error.json', JSON.stringify(Errordata));
  })
}

function Getmangaimgurl(mangaid ,mangaurl, callback) {
  var imgarray;
  request({
    url: mangaurl,
    mothod: "GET"
  }, function (e,r,b) {
    if (!e) {
      var $ = cheerio.load(b);
      imgarray = new Array($('section#main > section.manga > div.item-container > a.full-size-container._ui-tooltip').length);
      for (i=0;i<$('section#main > section.manga > div.item-container > a.full-size-container._ui-tooltip').length;i++) {
        imgarray[i] = $('section#main > section.manga > div.item-container > a.full-size-container._ui-tooltip').eq(i).attr('href')
      }
      if (!fs.existsSync("image/" + mangaid)){
        fs.mkdirSync("image/" + mangaid);
      }
      Getmangaimgsrc(mangaid, imgarray, function(){callback();});
     }
  })
}

function Getmangaimgsrc(mangaid, imgarray, callback) {
  var imgcount = 0, imgsrc;
  async.whilst(function(){
    return imgcount < imgarray.length;
  },function(next){
    request({
      url: "http://www.pixiv.net" + imgarray[imgcount],
      mothod: "GET"
    },function (e,r,b) {
      if (!e) {
        var $ = cheerio.load(b);
        imgsrc = $('img').eq(0).attr('src');
        console.log(imgsrc);
        mangadl(mangaid, "http://www.pixiv.net" + imgarray[imgcount], imgsrc, imgcount, function(){
          imgcount++;
          next();
        })
      }
    })
  },function(err){
    callback();
  });
}

function mangadl(mangaid, referer, imgurl, imgcount, callback) {
  var statuscode,
      ext = imgurl.substr(imgurl.lastIndexOf('.')+1,imgurl.length);
  progress(request(imgurl, {
    headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
          'Referer': referer,
          'Accept': 'image/webp,image/*,*/*;q=0.8',
          'Connection': 'keep-alive',
          'Accept-Encoding': 'gzip, deflate, sdch'},
    method: "GET"
  }),{})
    .on('response', function (response) {
      statuscode = response.statusCode;
    })
    .on('progress', function (state) {})
    .on('error', function (err) {
      console.log("something happend!:" + err);
			Errordata[Errordata.length] = "http://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + mangaid;
			callback();
    })
    .on('end', function () {
      if (statuscode == 200) {
        console.log('success!');
        //callback();
      } else {
        console.log('fail!');
        //callback();
      }
      callback();
    })
    .pipe(fs.createWriteStream('image/' + mangaid + "/" + (imgcount + 1) + '.' + ext))
}

function Imgdl(imgid, imgurl, referer, callback) {
  var statuscode,
      ext = imgurl.substr(imgurl.lastIndexOf('.'),imgurl.length);
  progress(request(imgurl, {
    headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
          'Referer': referer,
          'Accept': 'image/webp,image/*,*/*;q=0.8',
          'Connection': 'keep-alive',
          'Accept-Encoding': 'gzip, deflate, sdch'},
    method: "GET"
  }),{})
    .on('response', function (response) {
      statuscode = response.statusCode;
    })
    .on('progress', function (state) {})
    .on('error', function (err) {
      console.log("something happend!:" + err);
			console.log("delete the error file");
			if (fs.existsSync("mangaid")) {
				fs.unlinkSync(imgid + '.' + ext);
			}
			Errordata[Errordata.length] = "http://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + imgid;
			callback();
    })
    .on('end', function () {
      if (statuscode == 200) {
        console.log('success!');
        //callback();
      } else {
        console.log('fail!');
        //callback();
      }
      callback();
    })
    .pipe(fs.createWriteStream('image/' + imgid + ext))
}
