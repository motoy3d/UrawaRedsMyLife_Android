/*
 * A tabbed application, consisting of multiple stacks of windows associated with tabs in a tab group.  
 * A starting point for tab-based application with multiple top-level windows. 
 * Requires Titanium Mobile SDK 1.8.0+.
 * 
 * In app.js, we generally take care of a few things:
 * - Bootstrap the application with any data we need
 * - Check for dependencies like device type, platform version or network connection
 * - Require and open our top-level UI component
 *  
 */

// This is a single context application with mutliple windows in a stack
(function() {
	Ti.include('util/analytics.js');
	startAnalytics();
	initDB();
	
	//determine platform and form factor and render approproate components
	var osname = Ti.Platform.osname,
		version = Ti.Platform.version,
		height = Ti.Platform.displayCaps.platformHeight,
		width = Ti.Platform.displayCaps.platformWidth;
	
	//considering tablet to have one dimension over 900px - this is imperfect, so you should feel free to decide
	//yourself what you consider a tablet form factor for android
	var isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));
	
//	Ti.UI.iPhone.statusBarStyle = Ti.UI.iPhone.StatusBar.OPAQUE_BLACK;
	
	// 全置換：全ての文字列 org を dest に置き換える  
	String.prototype.replaceAll = function (org, dest){  
	  return this.split(org).join(dest);  
	}      
	var ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
	var tabGroup = new ApplicationTabGroup();
	// TabGroupをglobalにセット
	Ti.App.tabGroup = tabGroup;
	// スプラッシュイメージを一定時間表示
	Ti.API.info(new Date() + "-------------- WAIT START ------------------");
	var startTime = (new Date()).getTime();
	var waitMilliSeconds = 2000;
	while (true) {
		if ( ( new Date() ).getTime() >= startTime + waitMilliSeconds ) break;
	}
//    tabGroup.open({transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});
    tabGroup.open();

})();

/**
 * DB初期化
 */
//TODO 古いデータの削除
function initDB() {
    var util = require("/util/util").util;
    var db = Ti.Database.open('urawareds.my.life');
    db.execute('CREATE TABLE IF NOT EXISTS visitedUrl (url TEXT, date INTEGER)');
    var date = new Date();
    var days = 10;
    date.setTime(date.getTime() - 24 * 60 * 60 * 1000 * days);
    var condDate = "'" + util.formatDate(date) + "'";
    // 一定日数以前のデータを削除する
    var deleteSql = "DELETE FROM visitedUrl WHERE date < " + condDate;
    db.execute(deleteSql);
    db.close();
}

/**
 * Google Analyticsの処理を初期化する
 */
function startAnalytics() {
	var analytics = new Analytics('UA-30928840-1');
	Titanium.App.addEventListener('analytics_trackPageview', function(e){
	    var path = "/app/" + Ti.Platform.name;
	    analytics.trackPageview(path + e.pageUrl);
	});
	Ti.App.addEventListener('analytics_trackEvent', function(e){
	    analytics.trackEvent(e.category, e.action, e.label, e.value);
	});
	Ti.App.Analytics = {
	    trackPageview:function(pageUrl){
	        Ti.App.fireEvent('analytics_trackPageview', {pageUrl:pageUrl});
	    },
	    trackEvent:function(category, action, label, value){
	        Ti.App.fireEvent('analytics_trackEvent', {category:category, action:action, label:label, value:value});
	    }
	}
	analytics.start(10);	//10秒に1回データ送信
}