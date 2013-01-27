/**
 * Twitter画面UI
 */
function TwitterWindow(tabGroup) {
    var Twitter = require("/model/Twitter");
    
    var util = require("/util/util").util;
    var style = require("/util/style").style;
    var customIndicator = require("/util/CustomIndicator").customIndicator;
    var updating = false;
//    var loadingRow = Ti.UI.createTableViewRow(style.twitter.loadingRow);
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

    var indWin = customIndicator.create();
    // ウィンドウ
    var self = Ti.UI.createWindow(style.twitter.window);
    // インジケータ
//    var indicator = Ti.UI.createActivityIndicator({message : style.common.loadingMsg});
//    self.add(indicator);

    //TODO 更新ボタン---------------------------------------
    var refreshBtn = Ti.UI.createButton({
        backgroundImage: "/images/refresh.png",
        backgroundSelectedImage: "/images/refresh_pressed.png",
        width: 48,
        height: 48,
        top : 5,
        right : 5
    });
    refreshBtn.addEventListener('click', function() {
        indWin.open({modal: true});
        //indicator.show();
        if(table.data[0]) {
            setTimeout(function() {
                beginLoadingNewer();
            },200);
        } else {
            loadTweets("firstTime");
        }
    });
    self.add(refreshBtn);
    

/*
    // ボーダー
    var border = Ti.UI.createView(style.twitter.tableBorder);
    // テーブルヘッダ
    var tableHeader = Ti.UI.createView(style.twitter.tableHeader);
    // fake it til ya make it..  create a 2 pixel
    // bottom border
    tableHeader.add(border);
    // 矢印
    var arrow = Ti.UI.createView(style.twitter.arrow);
    // ステータスラベル
    var statusLabel = Ti.UI.createLabel(style.twitter.statusLabel);
    // 最終更新日時ラベル
    var lastUpdatedLabel = Ti.UI.createLabel(style.twitter.lastUpdatedLabel);
    lastUpdatedLabel.text = "最終更新: "+util.formatDatetime();

    // インジケータ
    var refreshActInd = Titanium.UI.createActivityIndicator(style.twitter.refreshActIndicator);
    // テーブルヘッダに矢印、ステータス、最終更新日時、インジケータを追加し、
    // テーブルにヘッダをセット
    tableHeader.add(arrow);
    tableHeader.add(statusLabel);
    tableHeader.add(lastUpdatedLabel);
    tableHeader.add(refreshActInd);
    table.headerPullView = tableHeader;
*/
    // フラグ
    var pulling = false;
    var reloading = false;
    
    //openイベント
    self.addEventListener('open', function(e) {
        loadTweets("firstTime");
    });
    
    // テーブル
    var table = Ti.UI.createTableView(style.twitter.table);
    table.allowsSelectionDuringEditing = false;
    var twitter = new Twitter();

    /**
     * tweetを読み込んで表示する
     * @param kind (firstTime or olderTweets)
     */
    function loadTweets(kind) {
        Ti.API.info('########### TwitterWindow.js  loadTweets Start.');
        if("firstTime" == kind) {
            indWin.open({modal: true});
            //indicator.show();
        }
        updating = true;
        var loadingRowIdx = -1;
        if(table.data[0]){
            loadingRowIdx = table.data[0].rows.length - 1;
        }
        twitter.loadTweets(kind, {
            setNextPageParam: function(nextPageParam) {
                //TODO?
            }
            ,success: function(tweetList) {
                try {
                    Ti.API.info('### TwitterWindow.js --- success. tweetList.length=' + tweetList.length);
                    var rows = new Array();
                    table.startLayout();
                    Ti.API.info('### TwitterWindow.js --- success2');
                    for(i=0; i<tweetList.length; i++) {
                        var tweet = tweetList[i];
                        // rows.push(createRow(tweet));
                        if("newerTweets" == kind) {
                            table.insertRowBefore(i, createRow(tweet));
                        } else {
//                            Ti.API.info('### TwitterWindow.js --- append ' + i);
                            table.appendRow(createRow(tweet));
                        }
                    }
                    table.finishLayout();

                    if("firstTime" == kind) {
                        self.add(table);
                    } else if("newerTweets" == kind) {
                        endLoadingNewer();
                    } else if("olderTweets" == kind) {
                        if(loadingRowIdx > 0) {
                            // “読み込み中”のローを削除する。
                            Ti.API.info("読み込み中ロー削除：" + loadingRowIdx);
                            table.deleteRow(loadingRowIdx);
                            Ti.API.info("読み込み中ロー削除　完了");
                        }
                    }
                } catch(e) {
                    Ti.API.error(e);
                } finally {
                    table.finishLayout();
                    Ti.API.info("TwitterWindow.js -- finishLayout end");
                    indWin.close();
                    //indicator.hide();
                    Ti.API.info("TwitterWindow.js -- indicator.hide");
                    updating = false;
                }
            },
            fail: function(message) {
                updating = false;
                indWin.close();
                //indicator.hide();
                var dialog = Ti.UI.createAlertDialog({
                    message: message,
                    buttonNames: ['OK']
                });
                dialog.show();
            }
        });
    }
    
    /**
     * TableViewRowを生成して返す
     * @param {Object} tweet (id, userName, text, profileImgUrl, etc...)
     */
    function createRow(tweet) {
//        Ti.API.info('$$$$ TwitterWindow.js >>> createRow1');
        var row = Ti.UI.createTableViewRow(style.twitter.tableViewRow);
        // プロフィール画像
        var profileImg = Ti.UI.createImageView(style.twitter.profileImg);
        profileImg.image = tweet.profileImageUrl;
        // ユーザ名ラベル
        var userNameLabel = Ti.UI.createLabel(style.twitter.userNameLabel);
        userNameLabel.text = tweet.userName;
        // 本文ラベル
        var textLabel = Ti.UI.createLabel(style.twitter.textLabel);
        textLabel.text = tweet.text;
        // 時間ラベル
        var timeLabel = Ti.UI.createLabel(style.twitter.timeLabel);
        var timeText = tweet.timeText;

        timeLabel.text = timeText;
//        Ti.API.info('$$$$ TwitterWindow.js >>> createRow3');
        row.add(userNameLabel);
        row.add(profileImg);
        row.add(textLabel);
        row.add(timeLabel);
//        Ti.API.info('$$$$ TwitterWindow.js >>> createRow3');
        row.tweet = tweet;
        return row;
    }
/*
    var lastDistance = 0; // calculate location to determine direction
    // テーブルのスクロールイベント
    table.addEventListener('scroll', function(e) {
        var offset = e.contentOffset.y;
        var height = e.size.height;
        var total = offset + height;
        var theEnd = e.contentSize.height;
        var distance = theEnd - total;
    
        // going down is the only time we dynamically load,
        // going up we can safely ignore -- note here that
        // the values will be negative so we do the opposite
        if (distance < lastDistance) {
            // adjust the % of rows scrolled before we decide to start fetching
            var nearEnd = theEnd * .90;
            if (!updating && (total >= nearEnd)) {
                beginUpdate();
            }
        }
        lastDistance = distance;
    });
*/

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
        // 更新中じゃなく，テーブルのサイズの75％以上までスクロールしたら。
        if(!updating) {
            if(e.visibleItemCount + e.firstVisibleItem > table.data[0].rows.length-2) {
                if(!updating) { //念のため再度チェック
                    Ti.API.info("-----アップデート開始:" + (new Date()).getTime());
                    updating = true;
    //                loadTweets(nextPageParam, 'olderTweets');
                    beginUpdate();
                    //updating = false; //loadTweets()中のYQL(非同期)処理終了時に実行
                }
            }
        }
    });

    // テーブルのクリックイベント
    table.addEventListener('click', function(e) {
        var t = e.row.tweet;
        var tweetWin = Ti.UI.createWindow({
            navBarHidden: true
        });
        // インジケータ
        // var tweetWinInd = Ti.UI.createActivityIndicator({message : style.common.loadingMsg});
        // tweetWin.add(tweetWinInd);
        // HTMLテンプレート
        var templateFile = Ti.Filesystem.getFile(
            Ti.Filesystem.resourcesDirectory, 'tweetTemplate.txt');
        var template = templateFile.read().toString();
        var html = util.replaceAll(template, "{profileImageUrl}", t.profileImageUrl);
        html = util.replaceAll(html, "{userName}", "@" + t.userName);
        var text = util.tweetTrimer(t.text);
        html = util.replaceAll(html, "{text}", text);
        html = util.replaceAll(html, "{timeText}", t.timeText);

        var webView = Ti.UI.createWebView({
            html: html
        });

        // ロード前のイベント
        var ind;
        webView.addEventListener('beforeload',function(e){
            if(e.navigationType != 5) {//リンク先URLのhtml中の画像やiframeの場合、5
                Ti.API.info('beforeload #################### ');
                for(i in e) {
                    Ti.API.info('   ' + i + ' = ' + e[i]);
                }
                webView.opacity = 0.8;
                // Ti.API.info('インジケータshow');
                // ind = Ti.UI.createActivityIndicator({color: 'red'});
                // webView.add(ind);
                // ind.show();
                webView.url = e.url;
            }
        }); 
        // ロード完了時にインジケータを隠す
        webView.addEventListener("load", function(e) {
            if(ind) {
                Ti.API.info('インジケータhide');
                webView.opacity = 1.0;
                ind.hide();
                ind = null;
            }
        });
        tweetWin.add(webView);
        tabGroup.activeTab.open(tweetWin, {animated: true});
    });

    /**
     * 表示更新を開始する
     */
    function beginUpdate() {
        Ti.API.info("===== beginUpdate =====");
        updating = true;
        // 読み込み中Row
        table.appendRow(loadingRow);
//        loadingInd.show();      
        loadTweets("olderTweets");
    }
    /**
     * 最新ロードを開始する(新しいデータを読み込む)
     */
    function beginLoadingNewer() {
        Ti.API.info("===== beginLoadingNewer =====");
        loadTweets("newerTweets");
    }
    /**
     * 最新ロード終了時処理。
     */
    function endLoadingNewer() {
        Ti.API.debug('====== endLoadingNewer =======');
        // when you're done, just reset
//        table.setContentInsets({top: 0},{animated: false});
        reloading = false;
        //TODO
//        lastUpdatedLabel.text = "最終更新: "+ util.formatDatetime();
//        statusLabel.text = "ひっぱって更新...";
//        refreshActInd.hide();
//        arrow.show();
    }
    
    return self;
}
module.exports = TwitterWindow;
