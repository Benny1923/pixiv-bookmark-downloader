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