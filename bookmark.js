/*  verion 0.1 BETA by Benny1923@2017-01
    this code show how PBD get bookmark info
    debug on chrome, using jQuery library
    *not compatible to cheerio
*/

//作品id
for (i = 0; i < 20; i++) {
    console.log($(".display_editable_works > ._image-items > li > a > div._layout-thumbnail > img").eq(i).attr("data-id"))
}
//作品標題
for (i = 0; i < 20; i++) {
    console.log($(".display_editable_works > ._image-items > li > a > h1.title").eq(i).html())
}
//作品tag
for (i = 0; i < 20; i++) {
    console.log($(".display_editable_works > ._image-items > li > a > div._layout-thumbnail > img").eq(i).attr("data-tags"))
}
//作品網址
for (i = 0; i < 20; i++) {
    console.log("http://www.pixiv.net/" + $(".display_editable_works > ._image-items > li > a.work._work").eq(i).attr("href"))
}
//作者
for (i = 0; i < 20; i++) {
    console.log($(".display_editable_works > ._image-items > li > a.user.ui-profile-popup").eq(i).html())
}
//作者id
for (i = 0; i < 20; i++) {
    console.log($(".display_editable_works > ._image-items > li > a.user.ui-profile-popup").eq(i).attr("data-user_id"))
}
//作者網址
for (i = 0; i < 20; i++) {
    console.log("http://www.pixiv.net/" + $(".display_editable_works > ._image-items > li > a.user.ui-profile-popup").eq(i).attr("href"))
}
//判斷是否為結尾頁(從第一項li內容物長度判斷 超土炮)
$(".display_editable_works > ._image-items > li").html().length < 100

//-------------------------------------------------------------------------------------

/*  version 1.5 by Benny1923@2017-02-28
    faster function.
    debug on chrome, using jQuery library
*/

//初次測試用，不包含排除已刪除的功能
var items = $('div.display_editable_works > ul._image-items > li.image-item');
var result = { data: new Array };
for (i = 0; i < items.length; i++) {
    if (items.eq(i).find('div > img').attr('data-id') != 0) {
        result.data.push({
            "id": items.eq(i).find('a > div > img').attr('data-id'),
            "title": items.eq(i).find('a > h1.title').text(),
            "tag": items.eq(i).find('a > div > img').attr('data-tags'),
            "author": items.eq(i).children('a').eq(2).text(),
            "author_id": items.eq(i).children('a').eq(2).attr('data-user_id'),
            "author_link": "http://www.pixiv.net/" + items.eq(i).children('a').eq(2).attr('href'),
            "link": "http://www.pixiv.net/" + items.eq(i).find('a.work').attr('href'),
            "type": (function () {
                if (items.eq(i).find('a.work').hasClass('manga')) {
                    return "manga"
                } else if (items.eq(i).find('a.work').hasClass('ugoku-illust')) {
                    return "gif"
                } else if (items.eq(i).find('a > div > img').attr('src') == "http://source.pixiv.net/common/images/limit_mypixiv_s.png?20110520") {
                    return "friend-only"
                } else {
                    return "illust"
                }
            })()
        });
    }
}
result;

//判斷結尾頁，更科學的方法
$('span.next > a').attr('href') == undefined