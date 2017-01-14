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
