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
    var shortTitle = title;
    if(title.length > 21) {
        shortTitle = title.substring(0, 21) + "...";
    }
    var titleBar = Ti.UI.createLabel(style.common.titleBar);
    titleBar.text = shortTitle;
	self.add(titleBar);
	var referrer = "";
	var webView = Ti.UI.createWebView({
	    width: Ti.UI.FILL
	    ,top: 30
        ,bottom: 46
	});
    var simpleDispModeProp = Ti.App.Properties.getBool("simpleDispMode");
	Ti.API.info("##### webData.content=[" + webData.content + "]" + ", webData.link=[" + webData.link + "]");
	
	if(simpleDispModeProp &&
	    webData.content && 
		(webData.content != "" && 
		 webData.content.indexOf('<img src="http://feeds.feedburner.com') == -1 
		 )
	) {
		webView.html = createWebContent(webData);
		self.add(webView);
	} else {
        var indWin = customIndicator.create();
        var loaded = false;
        self.addEventListener('open',function(e){
            setTimeout(function() {
                if(!loaded) {
                    indWin.open({modal: true});
                }
            }, 120);
            //TODO ３秒で消す？
            setTimeout(function() {
                indWin.close();
            }, 4000);
        });
		webView.addEventListener("load", function(e) {
		    loaded = true;
            indWin.close();
		});
		webView.setUrl(webData.link);
		self.add(webView);	
        Ti.API.info("----------- 9");
	}

    //ツールバー
    var back = Ti.UI.createButton({
        image: "/images/arrow_left_grey.png"
        ,backgroundColor: 'transparent'
        ,backgroundSelectedImage: "/images/arrow_left_grow.png"
        ,enabled: false
        ,height: 36
        ,top: 5
        ,right: 95
    });
    back.addEventListener("click", function(e){
        referrer = webView.evalJS("document.referrer");
        Ti.API.info("referrer=" + referrer);
        //alert("referrer=" + referrer);
        if(referrer == "") {
            webView.url = "";
            webView.html = createWebContent(webData);
            titleBar.text = shortTitle;
            Ti.API.info('■webData.link=' + webData.link + ", content = " + webView.html);
            //TODO title
        } else {
            webView.goBack();
        }
    });
    //TODO style.js
    var forward = Ti.UI.createButton({
        image: "/images/arrow_right_grey.png"
        ,backgroundColor: 'transparent'
        ,backgroundSelectedImage: "/images/arrow_right_grow.png"
        ,enabled: false
        // ,width: 40
        ,height: 36
        ,top: 5
        ,right: 10
    });
    forward.addEventListener("click", function(e){
        webView.goForward();
    });
    var twitter = Ti.UI.createButton({
        image: "/images/twitter_icon.png"
        ,enabled: false
    });
    var facebook = Ti.UI.createButton({
        image: "/images/facebook_icon_grey.png"
        ,backgroundSelectedImage: "/images/facebook_icon_grow.png"
        ,enabled: false
        ,backgroundColor: 'transparent'
        // ,width: 40
        ,height: 36
        ,top: 5
        ,right: 180
    });
    // WebViewロード前
    var beforeLoadFunc = function(e) {
        Ti.API.info('beforeload-------------------------');
        Ti.API.info(util.toString(e));
        if(referrer && e.url && e.url.indexOf("file://") == 0) {
            //referrerがnullでない場合があり、エラーになる。
            Ti.API.info('★★★★★★★★e.url=' + e.url);
            //TODO
            // webView.url = "";
            // webView.html = createWebContent(webData);
            // titleBar.text = shortTitle;
        }
    };
    webView.addEventListener('beforeload', beforeLoadFunc);
    
    // WebViewロード時、戻るボタン、次へボタンの有効化、無効化
    var loadFunc = function(e) {
        if(e.url.indexOf("http") == 0) {
            title = webView.evalJS("document.title");
            shortTitle = title;
            if(title && title.length > 21) {
                shortTitle = title.substring(0, 21) + "...";
            }
        }
        Ti.API.info('load★ title=' + title + "  e.url=" + e.url);
        titleBar.text = shortTitle;
        if(e.url && e.url.indexOf("file://") == 0) {
            back.setEnabled(false);
        } else {
            back.setEnabled(webView.canGoBack());
        }
        back.image = back.enabled? "/images/arrow_left.png" : "/images/arrow_left_grey.png";
        forward.setEnabled(webView.canGoForward());
        forward.image = forward.enabled? "/images/arrow_right.png" : "/images/arrow_right_grey.png";
        facebook.setEnabled(webView.url.indexOf("facebook.com") == -1);
        facebook.image = facebook.enabled? "/images/facebook_icon.png" : "/images/facebook_icon_grey.png";
    };
    webView.addEventListener('load', loadFunc);

    // facebookボタン
    facebook.addEventListener("click", function(e){
        if(!Ti.Facebook.loggedIn) {
            // ログイン済みでない場合はログインする
            Ti.Facebook.appid = '130375583795842';
            Ti.Facebook.permissions = ['publish_stream', 'read_stream']; // facebook開発者ページで設定
            Ti.Facebook.addEventListener('login', function(e) {
                if (e.success) {
                    facebookShare();    //ログイン成功後シェア
                } else if (e.error) {
                    Ti.API.error('-----facebookログインエラー');
                } else if (e.cancelled) {
                    Ti.API.info('-----facebookログインキャンセル');
                }
            });
            Ti.Facebook.authorize();    //認証実行
        } else {
            facebookShare();
        }
    });
    var toolbar = Ti.UI.createView({
        // グラデーションはエラーになるのでイメージで対応
        // https://jira.appcelerator.org/browse/TIMOB-9819
        backgroundImage: "/images/toolbarBackground.png"
        ,backgroundRepeat: true
        ,width: Ti.UI.FILL
        ,height: 46
        ,bottom: 0
    });
    toolbar.add(facebook);
    toolbar.add(back);
    toolbar.add(forward);
    self.add(toolbar);
    
    /**
     * 簡易ページに表示するコンテンツを生成する。
     */
    function createWebContent(webData) {
        return webData.content + "<br/><br/>" 
            + "<a href=\"" + webData.link + "\">サイトを開く</a><br/><br/>";
    }
    
    /**
     * facebookでシェアする
     */ 
    function facebookShare() {
        // var image = webData.image;
        Ti.API.info('webView.url＝＝＝' + webView.url);
        var link = webData.link; //簡易表示の場合はwebData.link
        if(webView.url.indexOf("http") == 0) {
            link = webView.url;
        }
        Ti.API.info('facebookシェア link=' + link);
        var data = {
            link : link
//            ,name :  title
//                ,message :  "message"
//            ,caption : ""
//                ,picture : image
            ,locale : "ja_JP"
//                description : "ユーザの投稿文"
        };
        Ti.App.Analytics.trackPageview('/fbShareDialog');   //ダイアログを開く
        //投稿ダイアログを表示
        Ti.Facebook.dialog(
            "feed", 
            data, 
            function(r){
                if(r.success) {
                    Ti.App.Analytics.trackPageview('/fbShare'); //投稿成功
                }
            }
        );
    }

	return self;
};
module.exports = WebWindow;
