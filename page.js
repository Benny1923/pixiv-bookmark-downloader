/*  version 1.0 by Benny1923@2017-03-01
    this code show how PBD get page original image(s)
    debug on chrome, using jQuery library
*/

//取得單張作品
$('img.original-image').attr('data-src');

//多張作品url
"http://www.pixiv.net/member_illust.php?mode=manga&illust_id=" + 作品id
//多張作品(manga)的張數
$('a.full-size-container').length

//多張作品url
"http://www.pixiv.net/member_illust.php?mode=manga_big&illust_id="+ 作品id + "&page=" + 張數

//多張作品大圖取得方法
$('img').eq(0).attr('src')

//動圖取得方法(zip) update at 2017-06-30
$('#wrapper > script').eq(0).text().substring($('#wrapper > script').eq(0).text().indexOf("ugokuIllustFullscreenData")+37,$('#wrapper > script').eq(0).text().lastIndexOf("1920x1080.zip")+13).replace(/\\\//ig, "/")

/* version 2.0 by Benny1923@2018-05-24
   for new Pixiv illustration page new UI (at 2018-04-04)
   test on codepen.io, use jQuery library
*/

//取得單張作品
id = 68676079 //作品id號
$("link[rel='manifest']").prev().text().substring($("link[rel='manifest']").prev().text().indexOf("\"original\"")+12,$("link[rel='manifest']").prev().text().indexOf(id + "_p0",$("link[rel='manifest']").prev().text().indexOf("\"original\"")) + id.toString().length + 7).replace(/\\\//ig, "/")

//多張作品頁數
$("._icon-full-size").length

//動圖 較不科學的作法
id = 68899533 //作品id號
($("link[rel='manifest']").prev().text().substring($("link[rel='manifest']").prev().text().indexOf("\"original\"")+12,$("link[rel='manifest']").prev().text().indexOf(id + "_ugoira0",$("link[rel='manifest']").prev().text().indexOf("\"original\""))+id.toString().length + 7).replace(/\\\//ig, "/") + "600x600.zip").replace(/img-original/ig, "img-zip-ugoira")