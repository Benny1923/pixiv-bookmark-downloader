# Pixiv-Bookmark-Downloader

Download your pixiv account bookmark using node.js

## Installation

```sh
    ~$ git clone https://github.com/Benny1923/pixiv-bookmark-downloader.git
    ~$ cd pixiv-bookmark-downloader
    ~$ npm install
```

## Run `main.js`

```sh
    ~$ node main.js -u [username] -p [password]
```

The `[username]` and `[password]` is your pixiv account.

When process done. Result will output to file `result.json`

>**This tool now only can get your public bookmark.**


>Now you can use `-c` or `--config` to skip every run need the username and password

>example: node main.js -c config.json

What this tool can do?
- [x] Get all public bookmark
- [ ] Download the image from bookmark(`result.json`) (Not done yet.)

### File
| name ||
|---|---|
| main.js | Get all public bookmark script |
| format_v1.json | result output example |
| config_v1.json | config file example |
| bookmark.js | Get bookmark single page example using jquery (browser debug ver.) |
