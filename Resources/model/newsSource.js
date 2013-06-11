var util = require("/util/util").util;
var siteNameMaxByteLength = 28;
var sites = new Array();
var idx = 0;
sites[idx++] = new Array("サポティスタ","http://supportista.jp");
sites[idx++] = new Array("サッカーコラム J3 Plus+","http://llabtooflatot.blog102.fc2.com");
sites[idx++] = new Array("蹴閑ガゼッタ","http://gazfootball.com");
sites[idx++] = new Array("浦和御殿","http://redsnowman.cocolog-nifty.com/urawa_goten");
sites[idx++] = new Array("しみマガブログ","http://kaizokuo.blog5.fc2.com/");
sites[idx++] = new Array("徒然フットボール","http://blogs.yahoo.co.jp/dukaeeq2004");
sites[idx++] = new Array("湯浅健二のサッカー・ホームページ","http://www.yuasakenji-soccer.com/");

/**
 * ＵＲＬから、サイト名を取得する
 */
exports.getSiteName = function(url) {
	Ti.API.info('   getSiteName. ' + url);
	if(!url) {
		return "";
	}
	for(i=0; i<sites.length; i++) {
		if(url.indexOf(sites[i][1]) != -1) {
			return sites[i][0];
		}
	}

	return "";
};

/**
 * サイト名を最適化する
 * ※不要な部分を削除する
 */
exports.optimizeSiteName = function(siteName) {
	//TODO Googleアラート, Yahoo Pipes
	if(siteName.indexOf("Google") == 0 ||
		siteName.indexOf("Pipes Output") == 0) {
		return "";
	}
	siteName = util.deleteUnnecessaryText(siteName);
    siteName = util.replaceAll(siteName, "Powered by Ameba", "");
    siteName = util.replaceAll(siteName, "浦和レッドダイヤモンズ", "浦和レッズ");
    siteName = unescape(siteName);
    siteName = util.cutToByteLength(siteName, siteNameMaxByteLength);
	return siteName;
};
