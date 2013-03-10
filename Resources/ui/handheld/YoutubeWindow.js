
/**
 * Youtube動画一覧を表示するウィンドウ
 * @param {Object} youtubeData
 */
function YoutubeWindow(youtubeData) {
	var util = require("/util/util").util;
	var style = require("/util/style").style;
    var customIndicator = require("/util/CustomIndicator").customIndicator;

	var self = Ti.UI.createWindow({
		navBarHidden: true
	});
	// function
	self.searchYoutube = searchYoutube;

	// create table view data object
	var data = [];
	var maxResults = 10;
	var startIndex = 1;
	var webModal;
	var webModalView;
//    var indicator = Ti.UI.createActivityIndicator({message : style.common.loadingMsg});
//    self.add(indicator);
//	indicator.show();
    // インジケータ
    var indWin = customIndicator.create();
    self.addEventListener('open',function(e){
        setTimeout(function() {
            indWin.open({modal: true});
        }, 150);
    });
    var titleBar = Ti.UI.createLabel(style.common.titleBar);
    titleBar.text = " " + youtubeData.title;
    self.add(titleBar);

	var tableView = Ti.UI.createTableView({
		data : data,
		backgroundColor : "#000000",	//TODO style
		separatorColor : "#000000",
		top : 30
	});

	self.add(tableView);
	tableView.addEventListener('click', function(e) {
		Ti.API.info('>>>>>>>>>> click');
		playYouTube(e.row.videotitle, e.row.guid);
	});

	/**
	 * Youtubeで検索し、一覧表示する。
	 */
	function searchYoutube(searchTerm1, searchTerm2) {
		// オンラインチェック
		if(!Ti.Network.online) {
			//indicator.hide();
			indWin.close();
			util.openOfflineMsgDialog();
			return;
		}
        Ti.App.Analytics.trackPageview('/movieList');
		var replaceKey = '#キーワード#';
		var searchUrlBase = 'http://gdata.youtube.com/feeds/api/videos?alt=rss&q='
			+ replaceKey
			+ '&max-results=' + maxResults + '&start-index=' + startIndex
			+ '&orderby=published'	//relevance（関連度が高い順）、published（公開日順）、viewCount（再生回数順）、rating（評価が高い順） 
			+ '&v=2';
	
		var searchUrl = searchUrlBase.replace(replaceKey, searchTerm1);
		var searchUrl2 = null;
		if(searchTerm2) {
			searchUrl2 = searchUrlBase.replace(replaceKey, searchTerm2);
		}

		var youtubeFeedQuery = "SELECT title,pubDate,link,statistics.viewCount FROM feed WHERE " 
			+ "url='" + searchUrl + "'";
		if(searchUrl2) {
			youtubeFeedQuery += " or " + "url='" + searchUrl2 + "'";
		}
		Ti.API.info("■YQL Query........" + youtubeFeedQuery);
		
		Ti.Yahoo.yql(youtubeFeedQuery, function(e) {
			try {
				if(e.data == null) {
					//indicator.hide();
					indWin.close();
					var row = Ti.UI.createTableViewRow({
						height : 80,
						backgroundSelectedColor : "#f33"
					});
					row.text = style.common.noDataMsg;
					tableView.appendRow(row);
					return;
    			}
//                for(var i=0; i<e.data.item.length; i++) {
//                  Ti.API.info('#### ' + i + '=' + util.toString(e.data.item[i]));
//                }
				var rowsData;
                //TODO なぜか配列でないと判定されてしまうのでjoinメソッド有無で配列判定。
//				if(e.data.item instanceof Array) {
                if(e.data.item.join) {
					rowsData = e.data.item.map(createYoutubeRow);
				} else {
					rowsData = new Array(createYoutubeRow(e.data.item));
				}
//				Ti.API.info('>>>>> map完了');
				tableView.setData(rowsData);
	 			startIndex += maxResults;
	 			indWin.close();
			} catch(e) {
				//indicator.hide();
				indWin.close();
			}
		});
		// Ti.API.debug("youtube: " + searchUrl);
	}

	/**
	 * TableViewRowを生成して返す
	 */
	function createYoutubeRow(item/*, index, array*/) {
	    try {
    		Ti.API.info('###### createYoutubeRow() title=' + item.title);
    		var title = item.title;
    	
    		var summary = "";
    		if(item.pubDate) {
    			var pubDate = new Date(item.pubDate);
    			var minutes = pubDate.getMinutes();
    			if(minutes < 10) {
    				minutes = "0" + minutes;
    			}
    			var viewCount = "";
    			if(item.statistics) {
    			    viewCount = item.statistics.viewCount + "回再生    ";
    			}
    			summary = viewCount
    			    + (pubDate.getMonth() + 1) + "/" 
    				+ pubDate.getDate() + " " + pubDate.getHours() + ":" + minutes;
    		}
    		var link = item.link;
    	
    		var guid = link.substring(link.indexOf("?v=") + 3);
    		guid = guid.substring(0, guid.indexOf("&"));
    	
    		var thumbnail = "http://i.ytimg.com/vi/" + guid + "/2.jpg";
    	
    		var row = Ti.UI.createTableViewRow({
    			height : 90,
    	//		backgroundSelectedColor : "#f33",
    			type : "CONTENT"
    		});
    	
    		row.url = link;
    		row.guid = guid;
    		row.videotitle = title;
    		row.backgroundColor = "#000000";
    		row.color = "#ffffff";
    	   //TODO
    		var labelTitle = Ti.UI.createLabel({
    			text : title,
    			left : 130,
    			right : 10,
    			top : 5,
    			height : 50,
    			font : {
    				fontSize : 14
    			},
    			color : "#ffffff"
    		});
    		row.add(labelTitle);
    	
    		var labelSummary = Ti.UI.createLabel({
    			text : summary,
    			left : 130,
                right : 10,
    			bottom : 9,
    			font : {
    				fontSize : 13
    			},
    			color : "#ffffff"
    		});
    		row.add(labelSummary);
    	
    		var img = Ti.UI.createImageView({
    			image : thumbnail,
    			left : 0,
    			height : 90,
    			width : 120
    		});
    		row.add(img);
            return row;
        } catch(ex) {
            Ti.API.info('Youtube読み込み時エラー : ' + ex);
        }
	}
	
	/**
	 * WEB用ウィンドウを生成して返す。
	 * ※WebViewではなく、Window
	 */
	function createWebView() {
Ti.API.debug('-------createWebView 1');	

		webModal = Ti.UI.createWindow({
		    barColor: 'red'
		});
	
		webModal.orientationModes = [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT];
		webModalView = Ti.UI.createWebView();
		webModalView.scalesPageToFit = true;
Ti.API.debug('-------createWebView 4');	
	
		webModal.add(webModalView);
	
Ti.API.debug('-------createWebView 7');	
		return webModalView;
	}
	
	/**
	 * 動画を再生する（内部でiPhone/Androidの処理分岐あり）
	 */
	function playYouTube(vtitle, vguid) {
        Ti.App.Analytics.trackPageview('/playMovie');
		Ti.API.info('------- playYouTube.. ' + Ti.Platform.name);
		// if(Ti.Platform.name == 'iPhone OS') {
            // var movieUrl = "http://www.youtube.com/embed/" + vguid + "?fs=1&autoplay=1";
// 
            // var videoView = Ti.UI.createWebView({
            	// url : movieUrl
            // });
            // var videoWin = Ti.UI.createWindow({
                // barColor: 'red'
            // });
            // videoWin.add(videoView);
            // Ti.App.tabGroup.activeTab.open(videoWin, {
            	// animated : true
            // });
		// } else {
			Ti.API.info('openURL.....');
			Ti.Platform.openURL('http://www.youtube.com/watch?v=' + vguid);
		// }
	}
	
	/**
	 * modalウィンドウにhtmlを表示する
	 * ※iOSで動画再生時にも使用
	 */
	function showHTMLContent(wTitle, wUrl, wHTMLContent) {
		Ti.API.info("showHTMLContent: " + wHTMLContent);
		// currentLink = wUrl;
	
		createWebView();
Ti.API.info('-------webModal=' + webModal);	
		webModal.title = wTitle;
	
		webModalView.html = wHTMLContent;
		Ti.App.tabGroup.activeTab.open(webModal, {
			animated : true
		});
	}
	return self;
}
module.exports = YoutubeWindow;
