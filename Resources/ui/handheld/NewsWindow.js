/**
 * ニュース画面UI
 * loadFeed フィードを読み込む
 * beginLoadingOlder 追加ロードを開始する
 * endLoadingOlder 追加ロード終了時処理
 * beginLoadingNewer 最新ロードを開始する
 * endLoadingNewer 最新ロード終了時処理
 */
function NewsWindow(tabGroup) {
    // 自前モジュールによりStrictModeを回避
    var androidignorestrictmode = require('motoy3d.android.ignore.strictmode');
    Ti.API.info("自前モジュール => " + androidignorestrictmode);
    var _result = androidignorestrictmode.disablePolicy();
    Ti.API.info('結果： ' + _result);    
    
	var News = require("/model/News");
	var WebWindow = require("/ui/handheld/WebWindow");
    var ConfigWindow = require("/ui/handheld/ConfigWindow");
	var util = require("/util/util").util;
	var style = require("/util/style").style;
    var customIndicator = require("/util/CustomIndicator").customIndicator;
	var news = new News();
	var isOpeningNews = false;

    var indWin = customIndicator.create();

    // ウィンドウ
	var self = Ti.UI.createWindow({
		title: L('news')
		,backgroundColor: 'black'
	});
    //TODO 更新ボタン---------------------------------------
    var refreshBtn = Ti.UI.createButton({
        backgroundImage: "/images/refresh.png",
        backgroundSelectedImage: "/images/refresh_pressed.png",
        width: 48,
        height: 48,
        top : 2,
        right : 5 + 48 + 10
    });
    refreshBtn.addEventListener('click', function() {
        indWin.open({modal: true});
//        indicator.show();
        setTimeout(function() {
            beginLoadingNewer();
        },100);
    });
    self.add(refreshBtn);
    
    // 設定ボタン---------------------------------------
    var configButton = Ti.UI.createButton({
        backgroundImage: "/images/gear.png",
        backgroundSelectedImage: "/images/gear_pressed.png",
        width: 38,
        height: 38,
        top : 2,
        right : 5
    });
    configButton.addEventListener('click', function() {
        var configWindow = new ConfigWindow();
        tabGroup.activeTab.open(configWindow, {animated: true});
    });
    self.add(configButton);

	// テーブル
	var table = Ti.UI.createTableView(style.news.table);
	table.allowsSelectionDuringEditing = false;

    try {
        // ボーダー
        var border = Ti.UI.createView(style.news.tableBorder);
        // テーブルヘッダ
        var tableHeader = Ti.UI.createView(style.news.tableHeader);
        // fake it til ya make it..  create a 2 pixel
        // bottom border
        tableHeader.add(border);
        // 矢印
        var arrow = Ti.UI.createView(style.news.arrow);
        // ステータスラベル
        var statusLabel = Ti.UI.createLabel(style.news.statusLabel);
        // 最終更新日時ラベル
        var lastUpdatedLabel = Ti.UI.createLabel(style.news.lastUpdatedLabel);
        lastUpdatedLabel.text = "最終更新: "+util.formatDatetime();
    
        // インジケータ
        var refreshActInd = Titanium.UI.createActivityIndicator(style.news.refreshActIndicator);
        // テーブルヘッダに矢印、ステータス、最終更新日時、インジケータを追加し、
        // テーブルにヘッダをセット
        tableHeader.add(arrow);
        tableHeader.add(statusLabel);
        tableHeader.add(lastUpdatedLabel);
        tableHeader.add(refreshActInd);
        table.headerPullView = tableHeader;
        // フラグ
        var pulling = false;
        var reloading = false;
    	
    	// 読み込み中Row+indicator
    	var updating = false;
    	var loadingRow = Ti.UI.createTableViewRow(style.news.loadMoreRow);
    	var loadingImg = Ti.UI.createImageView(style.news.loadMoreImg);
    	//TODO
    	var loadingMsg = Ti.UI.createLabel({
    	    text : style.common.loadingMsg
    	    ,left : 20
    	    ,height : 80
    	});
        loadingRow.add(loadingImg);
    	loadingRow.add(loadingMsg);
    /*
    	var loadingInd = Ti.UI.createActivityIndicator({
    		color: 'white'
    		,message: style.common.loadingMsg
    		,width: Ti.UI.FILL
    		,height: 50
    	});
    	loadingRow.add(loadingInd);
    */  
    	var lastRow = news.loadFeedSize;
    	var visitedUrls = new Array();
    	// ニュース選択時のアクション
    	table.addEventListener("click", function(e) {
            table.allowsSelection = false;
    		Ti.API.info("  サイト名＝＝＝＝＝＝＝＝＝" + e.row.siteName + ", link=" + e.row.linkUrl);
    		visitedUrls.push(e.row.linkUrl);
    		e.row.backgroundColor = style.news.visitedBgColor;
    		news.saveVisitedUrl(e.row.linkUrl);
    		var webData = {
    			title : e.row.pageTitle
    			,siteName : e.row.fullSiteName
    			,link : e.row.linkUrl
    			,content : e.row.content
    			,pubDate : e.row.pubDate
    			,toolbarVisible : true
    		};
    		var webWindow = new WebWindow(webData);
    Ti.API.info('-------webWindow = ' + webWindow);
    		// navGroup.open(webWindow, {animated: true});
    		tabGroup.activeTab.open(webWindow, {animated: true});
    Ti.API.info('-------------activeTab.open');
            Ti.App.Analytics.trackPageview('/newsDetail');
            table.allowsSelection = true;
    	});
    
    	/**
    	 * 追加ロードを開始する(古いデータを読み込む)
    	 */
    	function beginLoadingOlder() {
    		Ti.API.info("===== beginLoadingOlder =====");
    		updating = true;
    		// 読み込み中Row
    		table.appendRow(loadingRow);
    		// loadingInd.show();
    		loadFeed(news, 'olderEntries');
    	}	
    	/**
    	 * 追加ロード終了時処理。ローディングRowの削除、スクロール
    	 */
    	function endLoadingOlder() {
    		updating = false;
    		Ti.API.info(" endLoadingOlder. lastRow=" + lastRow + ", table.size=" + table.data[0].length);
    	}
        /**
         * 最新ロードを開始する(新しいデータを読み込む)
         */
        function beginLoadingNewer() {
            Ti.API.info("===== beginLoadingNewer =====");
            loadFeed(news, 'newerEntries');
        }
        /**
         * 最新ロード終了時処理。
         */
        function endLoadingNewer() {
            Ti.API.debug('====== endLoadingNewer =======');
            // when you're done, just reset
            //table.setContentInsets({top: 0},{animated: false});
            reloading = false;
            //lastUpdatedLabel.text = "最終更新: "+ util.formatDatetime();
            //statusLabel.text = "ひっぱって更新...";
            //refreshActInd.hide();
            //arrow.show();
            indWin.close();
        }
        
        // テーブルに対するスクロールイベントハンドラを追加。
        table.addEventListener('scroll', function(e) {
            //Ti.API.info('scrollイベント:' + e);
            // for(var v in e) {
                // Ti.API.info("  " + v + "=" + e[v]);
            // }
            // Ti.API.info('----------------------');
            
            // 距離が前回の距離より短くなっている＝テーブルが上に向かってスクロールしている。
            if(!table.data[0]) {
                return;
            }
            // 更新中でなく，テーブルの最後の方までスクロールしたら。
            if(!updating) {
                if(e.visibleItemCount + e.firstVisibleItem > table.data[0].rows.length-2) {
                    if(!updating) { //念のため再度チェック
                        beginLoadingOlder();
                        //updating = false; //loadTweets()中のYQL(非同期)処理終了時に実行
                    }
                }
            }
        });
        

    	var lastDistance = 0; // calculate location to determine direction
    	// テーブルのスクロールイベント
//    	table.addEventListener('scroll',function(e) {
    //		var offset = e.contentOffset.y;
    //		var height = e.size.height;
    //		var total = offset + height;
    //		var theEnd = e.contentSize.height;
    //		var distance = theEnd - total;
    	
    		// going down is the only time we dynamically load,
    		// going up we can safely ignore -- note here that
    		// the values will be negative so we do the opposite
    //		if (distance < lastDistance) {
    //			// adjust the % of rows scrolled before we decide to start fetching
    //			var nearEnd = theEnd * .90;
    //			if (!updating && (total >= nearEnd)) {
    //				beginLoadingOlder();
    //			}
    //		}
            // pull to refresh
            // else if (offset <= -65.0 && !pulling && !reloading) {
                // var t = Ti.UI.create2DMatrix();
                // t = t.rotate(-180);
                // pulling = true;
                // arrow.animate({transform: t, duration: 180});
                // statusLabel.text = "ひっぱって更新...";
            // }
            // else if (pulling && (offset > -65.0 && offset < 0) && !reloading ) {
                // pulling = false;
                // var t = Ti.UI.create2DMatrix();
                // arrow.animate({transform:t,duration:180});
                // statusLabel.text = "ひっぱって更新...";
            // }
    //		lastDistance = distance;
//    	});
        
        // ドラッグ終了イベント（pull to refresh）
    /*
        var event1 = 'dragEnd';
        if (Ti.version >= '3.0.0') {
            event1 = 'dragend';
        }
        table.addEventListener(event1,function(e) {
            if (pulling && !reloading) {
                reloading = true;
                pulling = false;
                arrow.hide();
                refreshActInd.show();
                statusLabel.text = "読み込み中...";
                table.setContentInsets({top:60},{animated:true});
                arrow.transform=Ti.UI.create2DMatrix();
                beginLoadingNewer();
            }
        });
    */
    
    	/**
    	 * フィードを取得して表示する
    	 */
    	function loadFeed(news, kind) {
            if("firstTime" == kind) {
                //indicator.show();
                indWin.open({modal: true});
            }
    		var style = require("/util/style").style;
    		Ti.API.debug(new Date() + '  loadFeed.................................tableView=' + table);
    		//alert('loadFeed : ' + news + ", kind=" + kind);
            //alert(news.loadNewsFeed);
    		news.loadNewsFeed(
			    kind, news.newest_item_timestamp, news.oldest_item_timestamp,
    		    { //callback
        			success: function(rowsData, newest_item_timestamp, oldest_item_timestamp) {
        				try {
        					// 読み込み中Row削除
    //    					loadingInd.hide();
        					
    //    					Ti.API.info("rowsData■" + rowsData);
                            // 初回ロード時
        					if("firstTime" == kind) {
                                self.add(table);
                                if(rowsData) {
                                    table.setData(rowsData);
	                                news.newest_item_timestamp = newest_item_timestamp;
    	                            news.oldest_item_timestamp = oldest_item_timestamp;
                                }
                                //indicator.hide();
                                indWin.close();
                                Ti.API.debug('■■■newest_item_timestamp = ' + news.newest_item_timestamp);
        					}
        					// 2回目以降の追加ロード時
        					else if("olderEntries" == kind) {
                                lastRow = table.data[0].rows.length - 1;
        						var scrollToIdx = table.data[0].rows.length;
        						if(rowsData) {
        							var len = rowsData.length;
                                    for(i=0; i<len; i++) {
                                        Ti.API.debug("appendRow. " + i + "  " + rowsData[i].children[0].text);
                                        table.appendRow(rowsData[i]);
                                    }
                                    news.oldest_item_timestamp = oldest_item_timestamp;
        						}
        						Ti.API.debug("読み込み中Row削除：" + lastRow);
        						table.deleteRow(lastRow);
        						endLoadingOlder();
        					}
                            // 最新データロード時
                            else if("newerEntries" == kind) {
                                if(rowsData) {
                                    Ti.API.debug('最新データ読み込み  件数＝' + rowsData.length);
                                    table.startLayout();
                                    for(i=0; i<rowsData.length; i++) {
                                        Ti.API.info("insertRowBefore. " + i + "  " + rowsData[i].pubDate + "  " 
                                            + rowsData[i].pageTitle);
                                        table.insertRowBefore(i, rowsData[i]);
                                    }
                                    table.finishLayout();
                                    if(news.newest_item_timestamp < newest_item_timestamp) {
                                        news.newest_item_timestamp = newest_item_timestamp;
                                    }
                                    Ti.API.debug('■newest_item_timestamp = ' + news.newest_item_timestamp);
                                }
                                endLoadingNewer();
        					}
        					else {
        					    Ti.API.error('NewsWindow#loadFeedに渡すkindが不正です。kind=' + kind);
        					}
        				} finally {
        				    //indicator.hide();
        					indWin.close();
        				}
        			},
        			fail: function(message) {
        			    //indicator.hide();
        			    indWin.close();
        				var dialog = Ti.UI.createAlertDialog({
        					message: message,
        					buttonNames: ['OK']
        				});
        				dialog.show();
        			}
        		}
    		);
    	}
//openイベント
self.addEventListener('open', function(e) {
    loadFeed(news, 'firstTime');
});
//    	loadFeed(news, 'firstTime');	
    } finally {
        //indicator.hide();
        indWin.close();
    }
	return self;
};
module.exports = NewsWindow;
