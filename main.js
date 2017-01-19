var request = require("request").defaults({jar: true}),
	cheerio = require("cheerio"),
	async = require("async"),
	fs = require("fs"),
	program = require("commander");
var device_token = '', username = '', password = '';
var data={};

program
  .version('Pixiv Bookmark Downloader 0.2.1 BETA 2017-01-14')
  .option('-u, --username, --user [username]', 'pixiv id/e-mail')
  .option('-p, --password [password]', 'password')
  .option('-c, --config [file]', 'login pixiv using config')
  .parse(process.argv);

if (program.config && fs.existsSync(program.config)) {
	fs.readFile(program.config, function read(err, data) {
		if (err) {
			throw err;
		} else {
			username = JSON.parse(data).username;
			password = JSON.parse(data).password;
		}
	});
} else if(!program.username || !program.password){
	console.log("require username and password!");
  process.exit();
} else if (program.username.length > 5 || program.password.length > 6) {
	username = program.username;
	password = program.password;
} else {
	console.log("invalid username or password!");
	process.exit();
}

/*request 制定三個回傳函數 error response body */
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

function Login() {
	request.post({
		url: "https://accounts.pixiv.net/api/login?lang=zh_tw",
		header: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36'},
		form: {'password': password, 'pixiv_id': username, 'post_key': device_token}
	}, function (e,r,b) {
		if (!e && JSON.parse(b).error == false && JSON.parse(b).body.success) {
			cookie = request.cookie("device_token=" + device_token);
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
			console.log("Hello! " + $('.user').html());
			data = {"Version": 1.0, "User": $('.user').html(), "Date": GetDate(), "numofdata": 0, "data": {}};
			GetAllBookmark();
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
	})
}
