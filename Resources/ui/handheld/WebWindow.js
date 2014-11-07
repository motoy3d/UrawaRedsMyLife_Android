/**
 * WebViewを表示するウィンドウ
 * @param {Object} webData
 */
function WebWindow(webData) {
	var util = require("/util/util").util;
    var style = require("/util/style").style;
    var customIndicator = require("/util/CustomIndicator").customIndicator;
	var newsSource = require("/model/newsSource");
	var twitterInstalled = util.isAppInstalled("com.twitter.android");
    var facebookInstalled = util.isAppInstalled("com.facebook.katana");
    var lineInstalled = util.isAppInstalled("jp.naver.line.android");
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
//        ,scalesPageToFit : true   //TODO
	});
    if(!webData.toolbarVisible) { //twitter画面から遷移した場合
        webView.bottom = 0;
    }
    webView.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;

    var simpleDispModeProp = Ti.App.Properties.getBool("simpleDispMode");
	Ti.API.info("##### webData.content=[" + webData.content + "]" + ", webData.link=[" + webData.link + "]");
	
    if(webData.html) {  //tweet
        webView.html = webData.html;
        webView.scalesPageToFit = false;
        self.add(webView);
    }
	else if(simpleDispModeProp &&
	    webData.content && 
		(webData.content != "" && 
		 webData.content.indexOf('<img src="http://feeds.feedburner.com') == -1 
		 )
	) {
        webView.scalesPageToFit = false;
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
            //TODO 4秒で消す？
            setTimeout(function() {
                indWin.close();
            }, 4000);
        });
		webView.addEventListener("load", function(e) {
		    loaded = true;
            indWin.close();
		});
        webView.scalesPageToFit = true;
		webView.setUrl(webData.link);
		self.add(webView);	
        Ti.API.info("----------- 9");
	}

    //ツールバー
    if(webData.toolbarVisible) { //twitter画面以外から遷移した場合
        createToolbar();
    }
    
    /**
     * ツールバーを生成する。
     */
    function createToolbar() {
        var back = Ti.UI.createButton(style.webWindow.backButton);
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
        var forward = Ti.UI.createButton(style.webWindow.forwardButton);
        forward.addEventListener("click", function(e){
            webView.goForward();
        });
        var twitter = Ti.UI.createButton(style.webWindow.twitterButton);
        var facebook = Ti.UI.createButton(style.webWindow.facebookButton);
        var line = Ti.UI.createButton(style.webWindow.lineButton);
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
//            webView.scalesPageToFit = true;
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
            twitter.setEnabled(true);
            facebook.setEnabled(webView.url.indexOf("facebook.com") == -1);
//            facebook.image = facebook.enabled? "/images/facebook_icon.png" : "/images/facebook_icon_grey.png";
            facebook.image = "/images/facebook_icon.png";
            line.setEnabled(true);
        };
        webView.addEventListener('load', loadFunc);
    
        // twitterボタン
        twitter.addEventListener("click", function(e){
            if(twitterInstalled) {
                Ti.App.Analytics.trackPageview('/tweetDialog');
                sendToApp("com.twitter.android", "com.twitter.applib.composer.TextFirstComposerActivity");
            } else {
                alert("Twitterアプリをインストールしてください");
            }
        });
        // facebookボタン
        facebook.addEventListener("click", function(e){
            if(facebookInstalled) {
                Ti.App.Analytics.trackPageview('/fbShareDialog');
                //sendToApp("com.facebook.katana", "com.facebook.katana.ShareLinkActivity");
                sendToApp("com.facebook.katana", null);
            } else {
                alert("Facebookアプリをインストールしてください");
            }
/*
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
            */
        });
        // LINEボタン
        line.addEventListener("click", function(e){
            if(lineInstalled) {
                Ti.App.Analytics.trackPageview('/lineSendDialog');
                sendToApp("jp.naver.line.android", "jp.naver.line.android.activity.selectchat.SelectChatActivity");
            } else {
                alert("LINEアプリをインストールしてください");
            }
        });
        
        var toolbar = Ti.UI.createView(style.webWindow.toolbar);
        toolbar.add(line);
        toolbar.add(twitter);
        toolbar.add(facebook);
        toolbar.add(back);
        toolbar.add(forward);
        self.add(toolbar);

    }
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
    
    /**
     * Twitter/Facebook/LINEの公式アプリにテキストを引き渡す。
     * @packageName
     * @activityClassName
     */
    function sendToApp(packageName, activityClassName) {
        var intent = Ti.Android.createIntent({
             action: Ti.Android.ACTION_SEND,
             packageName: packageName,
             className: activityClassName,
             flags: Ti.Android.FLAG_ACTIVITY_NEW_TASK,
             type: "text/plain"
         });
         var text;
//         if(webView.url && webView.url.indexOf("file://") != 0) {
         if(!webView.html) {
             text = title + " " + webView.url;
         } else {
             text = title + " " + webData.link;
         }
         intent.putExtra(Ti.Android.EXTRA_TEXT, text); //twitter supports any kind of string content (link, text, etc)
         Ti.Android.currentActivity.startActivityForResult(intent, function(e) {
             Ti.API.info(packageName + ' >>>>>>>>>>>>>>>> e.resultCode = ' + e.resultCode);
         });
    }
	return self;
};
module.exports = WebWindow;
