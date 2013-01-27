/**
 * WebViewを表示するウィンドウ
 * @param {Object} webData
 */
function WebWindow(webData) {
	var util = require("/util/util").util;
    var style = require("/util/style").style;
    var customIndicator = require("/util/CustomIndicator").customIndicator;
	var newsSource = require("/model/newsSource");
	Ti.API.info('--------------1');
	//TODO
	var self = Ti.UI.createWindow({
		title: webData.title
		,navBarHidden: true
	});
    Ti.API.info('--------------2 ' + self);
    var title = " " + util.removeLineBreak(webData.title);
    if(title.length > 21) {
        title = title.substring(0, 21) + "...";
    }
    var titleBar = Ti.UI.createLabel(style.common.titleBar);
    titleBar.text = title;
	self.add(titleBar);
	
	var webView = Ti.UI.createWebView({
	    width: Ti.UI.FILL
	    ,top: 30
	});
    Ti.API.info('--------------3');
	Ti.API.info("##### webData.content=[" + webData.content + "]" + ", webData.link=[" + webData.link + "]");
	if(webData.content && 
		(webData.content != "" && 
		 webData.content.indexOf('<img src="http://feeds.feedburner.com') == -1 
		 )
	) {
		Ti.API.info("----------- 4");
		var content = 
			webData.content + "<br/><br/>" 
			+ "<a href=\"" + webData.link + "\">サイトを開く</a>"
            ;
		webView.html = content;
		self.add(webView);
        Ti.API.info('--------------5');
	} else {
	    webView.setBackgroundColor('black');
        var indWin = customIndicator.create();
        var loaded = false;
        self.addEventListener('open',function(e){
            setTimeout(function() {
                if(!loaded) {
                    indWin.open({modal: true});
                }
            }, 200);
        });
		webView.addEventListener("load", function(e) {
		    loaded = true;
            indWin.close();
		});
        Ti.API.info("----------- 8");
		webView.setUrl(webData.link);
		self.add(webView);	
        Ti.API.info("----------- 9");
	}
	return self;
};
module.exports = WebWindow;
