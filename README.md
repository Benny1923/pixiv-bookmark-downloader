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

you can use last time login session without username/password or config file.

use `-h` or `--help` to see more argument.

When process done. Result will output to file `result.json`

##Features
- [x] Get all public bookmark
- [x] Download the image from bookmark(`result.json`) (using `-d` or `--download`)(now is **testing** and **unstable**)

### File
| name ||
|---|---|
| main.js | Get all public bookmark script |
| format_v1.json | result output example (ver 1.5) |
| config_v1.json | config file example |
| bookmark.js | Get bookmark single page example using jquery (browser debug ver.) |
| page.js | Get image url example using jquery (browser debug ver.) |
