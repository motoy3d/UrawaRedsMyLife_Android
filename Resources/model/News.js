var util = require("/util/util").util;
var style = require("/util/style").style;
var newsSource = require("/model/newsSource");

var LOAD_FEED_SIZE = 25;
// Google Reader Atom Feed (http://colo-ri.jp/develop/2009/12/google-reader-apiapi.html)
var feedUrl = "http://www.google.com/reader/public/atom/user"
	+ "%2F12632507706320288487%2Flabel%2FUrawaReds?"
	+ "n=" + LOAD_FEED_SIZE;
var visitedUrlList = new Array();

/**
 * ニュース情報
 */
function News() {
	var self = {};
    self.newest_item_timestamp = 0; // 最新データを読み込む場合のパラメータ（最新フィードのタイムスタンプ）
	self.continuation = "";	// さらに読み込む場合のGoogle Readerキーワード
	self.updating = false;	// スクロール時のテーブルビュー更新
	self.visitedUrls = new Array();
	self.loadFeedSize = LOAD_FEED_SIZE;
	
	self.loadNewsFeed = loadNewsFeed;	//function
	self.getContinuation = getContinuation;	//function
	self.saveVisitedUrl = saveVisitedUrl;  //function
	
	visitedUrlList = getVisitedUrlList();
//	Ti.API.info('visitedUrlList読み込み：' + visitedUrlList);
//    Ti.API.info('visitedUrlList数：' + visitedUrlList.length);
	self.visitedUrlList = visitedUrlList;
	return self;
};

/**
 * フィードを読み込んで表示する
 * @kind ("firstTime" or "olderEntries" or "newerEntries")
 * @continuation kind=olderEntriesの場合のみ使用。Google Reader用「次へ」用パラメータ 
 * ＠newest_item_timestamp kind=newerEntriesの場合のみ使用。最新データ取得時のstart_time
 * @callback
 */
function loadNewsFeed(kind, continuation, newest_item_timestamp, callback) {
    Ti.API.info('---------------------------------------------------------------------');
    Ti.API.info(util.formatDatetime() + '  ニュース読み込み kind=' + kind);
    Ti.API.info('---------------------------------------------------------------------');
	// オンラインチェック
	if(!Ti.Network.online) {
		callback.fail(style.common.offlineMsg);
		return;
	}
    Ti.App.Analytics.trackPageview('/newsList');

	// Google Readerで「次へ」をするためのキー文字列
	var condition = "";
	if('olderEntries' == kind) {
        condition = "&c=" + continuation; //c=continuation
    } else if('newerEntries' == kind) {
        condition = "&ot=" + newest_item_timestamp; //ot=start_time
    }
	// フィードを取得
	var selectFeedQuery = "SELECT "
		+ "id.original-id, link.href, title.content, source.title.content,"
		+ "published, content.content, summary.content"
		+ ", crawl-timestamp-msec"//最新データ取得時に使用
		+ " FROM feed WHERE url='" + feedUrl 
		+ condition + "'"
		+ " AND title.content NOT LIKE 'PR%'"
		+ " | sort (field=\"published\", descending=\"true\")"
		+ " | unique (field=\"title\")"
		;
		
	Ti.API.info("★★★YQL " + selectFeedQuery);
	Ti.Yahoo.yql(selectFeedQuery, function(e) {
        if(e.data == null) {
            Ti.API.info('e.data = null');
            callback.success(null, null);
            return;
        }
		try {
			Ti.API.info("e.data.entry■" + e.data.entry);
			var rowsData = null;
			var next_newest_item_timestamp = 0;
			if(e.data.entry.map) {
                rowsData = e.data.entry.map(
                    function(item) {
                        var row = createNewsRow(item);
                        if(next_newest_item_timestamp < row.newest_item_timestamp) {
                            next_newest_item_timestamp = row.newest_item_timestamp;
                        }
                        Ti.API.info("News.js  row=====" + row.pageTitle + ", " + row.linkUrl);
                        return row;
                    }
                );
                //TODO debug
                // var len = rowsData.length;
                // for(var i=0; i<len; i++) {
                    // Ti.API.info('News.js rowsData結果: ' + rowsData[i].width + ", " + rowsData[i].linkUrl);
                // }
			}
			callback.success(rowsData, next_newest_item_timestamp);
		} catch(ex) {
			Ti.API.error("loadNewsFeedエラー：" + ex);
			callback.fail('読み込みに失敗しました');
			//indWin.close();
		}
	});
}

/**
 * Google Readerのcontinuationを取得する
 */
function getContinuation(continuation, callback) {
    if(!Ti.Network.online) {
        return;
    }
    // Google Readerで「次へ」をするためのキー文字列
    var continuationPart = "";
    if(continuation != '') {
        continuationPart = "&c=" + continuation; //c=continuation
    }
	// continuationの取得
	var selectContinuationQuery = "SELECT continuation FROM xml WHERE url='" 
		+ feedUrl + continuationPart + "'";
	var isContinuationUpdate = false;
	Ti.API.info("★YQL " + selectContinuationQuery);
	Ti.Yahoo.yql(selectContinuationQuery, function(e) {
	    Ti.API.info('e=' + e);
	    if(e.data) {
            Ti.API.info('e.data=' + e.data);
            Ti.API.info('e.data.feed=' + e.data.feed);
            continuation = e.data.feed.continuation;
            Ti.API.info("continuation=== " + continuation);
            callback.success(continuation);
	    } else {
	        Ti.API.error('News.js#getContinuation() e.data is null');
	        callback.fail(style.common.loadingFailMsg);
	    }
	});
}

/**
 * rowを生成する
 */
function createNewsRow(item) {
	//Ti.API.info("アイテム=" + item);
	// for(var v in item) {
		// Ti.API.info("\t" + v + ":" + item[v]);
	// }
	var vid = "id";
	var oid = "original-id";
//	Ti.API.info("source---------" + item.source.title);
	var idobj = item[vid];
//	Ti.API.info("link.href---------" + item.link.href);
//	Ti.API.info("id.original-id---------" + idobj[oid]);
	
	var row = Ti.UI.createTableViewRow(style.news.tableViewRow);
	//TODO
	var rightView = Ti.UI.createView({
	    layout: 'vertical', 
	    width : Ti.UI.FILL, 
	    height: Ti.UI.SIZE,
	    left: 4
	    });
    // 本文
    var content = "";
    if(item.content) {
        content = item.content;
    }
    else if(item.summary) {
        content = item.summary;
    }
    // 画像
    var hasImage = false;
    var imgTagIdx = content.indexOf("<img");
    if(imgTagIdx != -1) {
        var srcIdx = content.indexOf("src=", imgTagIdx);
        if(srcIdx != -1) {
            var urlStartIdx = srcIdx + 5;
            var urlEndIdx = content.indexOf('"', urlStartIdx);
            var imgUrl = content.substring(urlStartIdx, urlEndIdx);
            imgUrl = util.replaceAll(imgUrl, "&amp;", "&");
            Ti.API.debug('画像＝＝＝＝＝' + imgUrl + "  >  " + item.title);
            // アイコン等はgifが多いのでスキップ
            if(!util.isUnnecessaryImage(imgUrl)) {
                var imgLabel = Ti.UI.createImageView(style.news.imgView);
                imgLabel.image = imgUrl;
                row.add(imgLabel);
                hasImage = true;
            }
        }
    }
	// タイトルラベル
	var titleLabel = Ti.UI.createLabel(style.news.titleLabel);
	if(hasImage) {
	    titleLabel.left = titleLabel.left + imgLabel.width + 10;
	}
	var itemTitle = util.deleteUnnecessaryText(item.title);
//	Ti.API.info('itemTitle=' + itemTitle);
    itemTitle = unescape(itemTitle);
    if(itemTitle.length > 46) {
        itemTitle = itemTitle.substring(0, 46) + "...";
    }
	titleLabel.text = itemTitle;
	//row.add(titleLabel);
	rightView.add(titleLabel);
//	Ti.API.info("最適化後：itemTitle====" + itemTitle);
	// 更新日時
	var pubDate = parseDate(item.published);
	//Ti.API.info("pubDate=====" + pubDate);
	var minutes = pubDate.getMinutes();
	if(minutes < 10) {
		minutes = "0" + minutes;
	}
	var pubDateText = (pubDate.getMonth() + 1) + "/" + pubDate.getDate() 
		+ " " + pubDate.getHours() + ":" + minutes;
	
	// サイト名+更新日時ラベル
	var link = "";
	Ti.API.info("★" + idobj[oid].toString());
	if(idobj[oid] && idobj[oid].toString().indexOf("http") == 0) {
		link = idobj[oid].toString();
		if(link.indexOf("http://www.google.com/url") == 0) {
			// Googleアラート等の場合、q=からリンク先を抽出
			link = link.substring(link.indexOf("q=")+2, link.indexOf("&ct="));
		}
		Ti.API.info("リンク1====" + link);
	} else if(item.link instanceof Array) {
		var linkLen = item.link.length;
		for(var i=0; i<linkLen; i++) {
			link = item.link[i].href;
			// 画像の場合は次へ
			if(util.endsWith(link, '.jpg', true) || util.endsWith(link, '.png', true)) {
				continue;
			} else {
				break;
			}
		}
		Ti.API.info("リンク2====" + link);
	} else {
		link = item.link.href;
		Ti.API.info("リンク3====" + link);
	}
	// 既読確認
	if(util.contains(visitedUrlList, link)) {
        row.backgroundColor = style.news.visitedBgColor;
	}
    // サイト名
	var fullSiteName = item.source.title;
	if(fullSiteName.toString().indexOf("Google") == 0) {
		fullSiteName = "";
	}
	var siteName = newsSource.optimizeSiteName(item.source.title);
	Ti.API.debug("siteName1====" + siteName + ", link=" + link);
	if('UrawaReds' == siteName) {
		siteName = newsSource.getSiteName(link);
		fullSiteName = siteName;
		Ti.API.info("   UrawaReds. siteName====" + siteName + ", link=" + link);
	}
	var siteNameLabel = Ti.UI.createLabel(style.news.siteNameLabel);
    if(hasImage) {
        siteNameLabel.left = siteNameLabel.left + imgLabel.width + 10;
    }
	siteNameLabel.text = siteName + "   " + pubDateText;
	// row情報セット
	//row.add(siteNameLabel);
	rightView.add(siteNameLabel);
	row.add(rightView);
	
	row.fullSiteName = fullSiteName;
	row.siteName = siteName;
	row.pageTitle = itemTitle;
	row.linkUrl = link;
	Ti.API.info('--------------> row.link = ' + row.linkUrl);
	row.content = content;
	row.pubDate = pubDateText;
	// ミリ秒から秒に変換
	row.newest_item_timestamp = Math.round(item['crawl-timestamp-msec'] / 1000) + 10;
	//Ti.API.info('★★row.newest_item_timestamp = ' + row.newest_item_timestamp + " / " + itemTitle);
    return row;
}

/**
 *  日付をパースして返す
 */
function parseDate(str){// str==yyyy-mm-ddThh:mm:ssZ
    //strdate==YYYY/mm/dd hh:mm:ss
    var strDate = str.split('\+')[0].replace('T',' ').replace('-','\/').replace('-','\/').replace('Z','');
    var date = new Date(strDate);
    var time = date.getTime() + 32400000;
    date.setTime(time);
    return date;
};

/**
 * DBに既読URLを保存する
 */
function saveVisitedUrl(url) {
    var date = util.formatDate();
    var db = Ti.Database.open('urawareds.my.life');
    try {
        db.execute('INSERT INTO visitedUrl(url, date) VALUES(?, ?)', url, date);
    } finally{
        db.close();
    }
}

/**
 * DBから既読URLリストを返す
 */
function getVisitedUrlList() {
    Ti.API.info('■getVisitedUrlList');
    var db = Ti.Database.open('urawareds.my.life');
    var urlList = new Array();
    try {
        var rows = db.execute('SELECT url, date FROM visitedUrl');
        while (rows.isValidRow()) {
            urlList.push(rows.field(0));
            Ti.API.info('既読　######## ' + rows.field(1) + " : " + rows.field(0));
            // Ti.API.info('Person ---> ROWID: ' + rows.fieldByName('rowid') 
                // + ', name:' + rows.field(1) + ', phone_number: ' 
                // + rows.fieldByName('phone_number') + ', city: ' + rows.field(3));
            rows.next();
        }
    } finally{
        db.close();
    }
    return urlList;
}

module.exports = News;