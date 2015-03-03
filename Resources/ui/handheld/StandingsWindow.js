/**
 * 順位表画面UI
 */
function StandingsWindow(tabGroup) {
	var Standings = require("/model/Standings");
	// var util = require("/util/util").util;
	var style = require("/util/style").style;
    var customIndicator = require("/util/CustomIndicator").customIndicator;
    var isLoading = false;

    //TODO 更新ボタン
    var refreshButton = Ti.UI.createButton({
        text: '更新'
    });
    var indWin = customIndicator.create();
	var self = Ti.UI.createWindow({
		title: L('standings'),
		backgroundColor: 'black'
		,barColor: 'red'
//        ,rightNavButton: refreshButton
	});
	//openイベント
	self.addEventListener('open', function(e) {
		loadJ1Standings();
	});
    //大会
    var currentCompeIdx = 0;    //0:J1、1:ACL、2:ナビスコ
    
    //親ビュー
    var containerView = Ti.UI.createView(style.standings.standingsView);
    self.add(containerView);
    //ACLビュー
    var aclView;
    // ヘッダー
    var j1HeaderView;
    var aclHeaderView;
    var table;
    var toolbar = createToolbar2();
    self.add(toolbar);

    // リロードボタン
    refreshButton.addEventListener('click', function(e){
        self.remove(table);
        //indicator.show();
        indWin.open({modal: true});
        loadJ1Standings();
    });
    Ti.API.info('★画面横幅：' + Ti.Platform.displayCaps.platformWidth);
    
    /**
     * ソートボタン ツールバーを生成する。
     */
    function createToolbar2() {
        var platformWidth = Ti.Platform.displayCaps.platformWidth;
        var sortLeft  = 20;
        var sortBtn = Ti.UI.createButton(style.standings.sortButton);
        sortBtn.left = sortLeft;
        // ソートボタン
        sortBtn.addEventListener('click', function(e){
            if(isLoading) {
                return;
            }
            
            var optionsArray = new Array("得点数でソート", "失点数でソート", "得失点差でソート", 
                "勝利数でソート", "敗北数でソート", "引き分け数でソート", "順位でソート", "キャンセル");
            var sortDialog = Ti.UI.createOptionDialog({options: optionsArray});
            sortDialog.addEventListener("click", function(e){
                if(7 == e.index) {
                    return;
                }
                if(0 == e.index) {
                    loadJ1Standings("gotGoal");
                } else if(1 == e.index) {
                    loadJ1Standings("lostGoal");
                } else if(2 == e.index) {
                    loadJ1Standings("diff");
                } else if(3 == e.index) {
                    loadJ1Standings("win");
                } else if(4 == e.index) {
                    loadJ1Standings("lost");
                } else if(5 == e.index) {
                    loadJ1Standings("draw");
                } else if(6 == e.index) {
                    loadJ1Standings();
                }
            });
            sortDialog.show();
        });
        var j1Left  = sortLeft + 110;
        //J1
        var j1 = Ti.UI.createButton(style.standings.j1Button);
        j1.left = j1Left;
        //ACL / Nabisco
        var aclNabisco = Ti.UI.createButton(style.standings.aclNabiscoButtonAndroid);
        aclNabisco.title = Ti.App.aclFlg ? "ACL" : "ナビスコ";
        aclNabisco.left = j1Left + 110;
        
        j1.addEventListener("click", function(e){
            if(currentCompeIdx != 0) {
                currentCompeIdx = 0;
                j1.enabled = false;
                j1.color = "lightgray";
                j1.opacity = 0.5;
                aclNabisco.enabled = true;
                aclNabisco.color = "white";
                aclNabisco.opacity = 1;
                sortBtn.enabled = true;
                sortBtn.color = "white";
                sortBtn.opacity = 1;
                loadJ1Standings();
            }
        });
        aclNabisco.addEventListener("click", function(e){
            if(currentCompeIdx != 1) {
                currentCompeIdx = 1;
                j1.enabled = true;
                j1.color = "white";
                j1.opacity = 1;
                aclNabisco.enabled = false;
                aclNabisco.color = "lightgray";
                aclNabisco.opacity = 0.5;
                sortBtn.enabled = false;
                sortBtn.color = "lightgray";
                sortBtn.opacity = 0.5;
                if (Ti.App.aclFlg) {
                    loadACLStandings();
                } else {
                    loadNabiscoStandings();
                }
            }
        });

        var toolbar = Ti.UI.createView({
            // グラデーションはエラーになるのでイメージで対応
            // https://jira.appcelerator.org/browse/TIMOB-9819
//            backgroundImage: "/images/toolbarBackground.png"
//            ,backgroundRepeat: true
            backgroundColor: "red"
            ,width: Ti.UI.FILL
            ,height: 46
            ,bottom: 0
        });
        toolbar.add(sortBtn);
        toolbar.add(j1);
        toolbar.add(aclNabisco);
        return toolbar;
    }

    /**
     * ヘッダービューを生成する 
     */
    function createHeaderView(aclFlg) {
        var headerView1 = Ti.UI.createView(style.standings.headerView);    
        var rankHeader = createHeaderLabel('位', 5);
        var teamHeader = createHeaderLabel('チーム', 30);
        var leftPos = 100;
        var w = 33;
        if(aclFlg) {
            leftPos += 30;
            w = 28;
        }
        var pointHeader = createHeaderLabel('点', leftPos);
        var winHeader = createHeaderLabel('勝', leftPos+(w*1));
        var drawHeader = createHeaderLabel('分', leftPos+(w*2));
        var loseHeader = createHeaderLabel('負', leftPos+(w*3));
        var gotGoalHeader = createHeaderLabel('得', leftPos+(w*4));
        var lostGoalHeader = createHeaderLabel('失', leftPos+(w*5));
        var diffGoalHeader = createHeaderLabel('差', leftPos+(w*6));
        headerView1.add(rankHeader);
        headerView1.add(teamHeader);
        headerView1.add(pointHeader);
        headerView1.add(winHeader);
        headerView1.add(drawHeader);
        headerView1.add(loseHeader);
        headerView1.add(gotGoalHeader);
        headerView1.add(lostGoalHeader);
        headerView1.add(diffGoalHeader);
        return headerView1;
    }
    
	/**
	 * Yahooスポーツサイトのhtmlを読み込んで表示する
	 */
	function loadJ1Standings(sort) {
	    Ti.API.info('インジケータOPEN');
//		indWin.open({modal: true});
		isLoading = true;
        //ヘッダー
        // if(aclHeaderView) {
            // containerView.remove(aclHeaderView);
        // }
        // j1HeaderView = createHeaderView(false);
        // containerView.add(j1HeaderView);
        // // ボーダー
        // var border = Ti.UI.createLabel(style.standings.border);
        // containerView.add(border);
		var standings = new Standings();
		standings.load(sort, {
			success: function(standingsDataList) {
				try {
				    var rows = new Array();
				    for(i=0; i<standingsDataList.length; i++) {
				        var data = standingsDataList[i];
				        rows.push(createRow(
				            data.rank, data.team, data.point, data.win, data.draw, data.lose
				            , data.gotGoal, data.lostGoal, data.diff)
				        );
				    }
                    //ヘッダー
                    if(aclHeaderView) {
                        containerView.remove(aclHeaderView);
                    }
                    j1HeaderView = createHeaderView(false);
                    containerView.add(j1HeaderView);
                    // ボーダー
                    var border = Ti.UI.createLabel(style.standings.border);
                    containerView.add(border);
                    table = Ti.UI.createTableView(style.standings.table);
                    table.setData(rows);
                    containerView.add(table);
				} catch(e) {
					Ti.API.error(e);
				} finally {
					Ti.API.info('インジケータCLOSE1');
					indWin.close();
					isLoading = false;
				}
			},
			fail: function(message) {
				Ti.API.info('インジケータCLOSE');
				indWin.close();
				isLoading = false;
				var dialog = Ti.UI.createAlertDialog({
					message: message,
					buttonNames: ['OK']
				});
				dialog.show();
			}
		});
	}
    /**
     * ACL順位表を読み込んで表示する
     */
    function loadACLStandings() {
        if(isLoading) {
            return;
        }
        indWin.open({modal: true});
        isLoading = true;
        self.title = "ACL順位表";
        // ヘッダー
        if(j1HeaderView) {
            containerView.remove(j1HeaderView);
        }
        aclNabiscoHeaderView = createHeaderView(true);
        containerView.add(aclNabiscoHeaderView);
        // ボーダー
        var border = Ti.UI.createLabel(style.standings.border);
        containerView.add(border);

        var standings = new Standings("ACL");
        standings.load("seq", {
            success: function(standingsDataList) {
                try {
                    var rows = new Array();
                    for(i=0; i<standingsDataList.length; i++) {
                        var data = standingsDataList[i];
                        Ti.API.info('------- data ');
                        rows.push(createRow(
                            data.rank, data.team, data.point, data.win, data.draw, data.lose
                            , data.gotGoal, data.lostGoal, data.diff, true)
                        );
                        Ti.API.info('------- push ');
                    }
                    table = Ti.UI.createTableView(style.standings.table);
                    table.height = 120;
                    table.setData(rows);
                    containerView.add(table);
                } catch(e) {
                    Ti.API.error(e);
                } finally {
                    indWin.close();
                    isLoading = false;
                }
            },
            fail: function(message) {
                indWin.close();
                isLoading = false;
                var dialog = Ti.UI.createAlertDialog({
                    message: message,
                    buttonNames: ['OK']
                });
                dialog.show();
            }
        });
    }


    /**
     * ナビスコカップ順位表を読み込んで表示する
     */
    function loadNabiscoStandings() {
        if(isLoading) {
            return;
        }
        indWin.open({modal: true});
        isLoading = true;
        self.title = "ナビスコ予選リーグ順位表";
//        compeButtonBar.setLabels([{title: 'J1', enabled: true}, {title: 'ACL', enabled: false}]);
        // ヘッダー
        if(j1HeaderView) {
            containerView.remove(j1HeaderView);
        }
        aclNabiscoHeaderView = createHeaderView(true);
        containerView.add(aclNabiscoHeaderView);
        // ボーダー
        var border = Ti.UI.createLabel(style.standings.border);
        containerView.add(border);

        var standings = new Standings("Nabisco");
        standings.load("seq", {
            success: function(standingsDataList) {
                try {
                    var rows = new Array();
                    for(i=0; i<standingsDataList.length; i++) {
                        var data = standingsDataList[i];
                        if(!data) {
                            continue;
                        }
                        rows.push(createRow(
                            data.rank, data.team, data.point, data.win, data.draw, data.lose
                            , data.gotGoal, data.lostGoal, data.diff, true)
                        );
                    }
                    table = Ti.UI.createTableView(style.standings.table);
                    table.height = 210;
                    table.setData(rows);
                    containerView.add(table);
                } catch(e) {
                    Ti.API.error(e);
                } finally {
                    indWin.close();
                    isLoading = false;
                }
            },
            fail: function(message) {
                indWin.close();
                isLoading = false;
                var dialog = Ti.UI.createAlertDialog({
                    message: message,
                    buttonNames: ['OK']
                });
                dialog.show();
            }
        });
    }
    
    /**
     * ヘッダーラベルを生成して返す
     */
    function createHeaderLabel(name, left) {
        var label = Ti.UI.createLabel(style.standings.headerLabel);
        label.text = name;
        label.left = left;
        return label;
    }
    
    /**
     * TableViewRowを生成して返す
     * @param {Object} rank
     * @param {Object} team
     * @param {Object} point
     * @param {Object} win
     * @param {Object} draw
     * @param {Object} lose
     * @param {Object} gotGoal
     * @param {Object} lostGoal
     * @param {Object} diff
     * @param {Object} aclFlg
  */
    function createRow(rank, team, point, win, draw, lose, gotGoal, lostGoal, diffGoal, aclFlg) {
        var row = Ti.UI.createTableViewRow(style.standings.tableViewRow);
        // 順位
        var rankLabel = createRowLabel(rank, 5, 20, 'center');
        row.add(rankLabel);
        // チーム
        // チーム
        var teamWidth = 60;
        if(aclFlg) teamWidth = 100;
        if(team.length > 4) {
            var idx = team.indexOf("・");
            if (idx != -1) {
                team = team.substring(0, idx);
            } else {
                team = team.substring(0, 4);
            }
        }
        var teamLabel = createRowLabel(team, 30, teamWidth, 'left');
        row.add(teamLabel);
        var leftPos = 93;
        var w = 33;
        var w2 = 26;
        if(aclFlg) {
            leftPos += 30;
            w = 28;
        }
        // 勝点
        var pointLabel = createRowLabel(point, leftPos, w2);
        row.add(pointLabel);
        // 勝
        var winLabel = createRowLabel(win, leftPos+(w*1), w2);
        row.add(winLabel);
        // 分
        var drawLabel = createRowLabel(draw, leftPos+(w*2), w2);
        row.add(drawLabel);
        // 負
        var loseLabel = createRowLabel(lose, leftPos+(w*3), w2);
//Ti.API.info('フォント＝' + loseLabel.font.fontFamily + " : " + loseLabel.font.fontSize);
        row.add(loseLabel);
        // 得
        var gotGoalLabel = createRowLabel(gotGoal, leftPos+(w*4), w2);
        row.add(gotGoalLabel);
        // 失
        var lostGoalLabel = createRowLabel(lostGoal, leftPos+(w*5), w2);
        row.add(lostGoalLabel);
        // 差
        var diffGoalLabel = createRowLabel(diffGoal, leftPos+(w*6), w2);
        row.add(diffGoalLabel);
        // 浦和背景色
        if('浦和' == team) {
            row.backgroundColor = 'red';
        }
        return row;
    }
    
    /**
     * TableViewRowに乗せるラベルを生成して返す
     * @param {Object} text
     * @param {Object} left
     * @param {Object} width
     */
    function createRowLabel(text, left, width, textAlign) {
        if(!textAlign) {
            textAlign = 'right';
        }
        //TODO style
        var label = Ti.UI.createLabel({
            text: text
            ,textAlign: textAlign
            ,left: left
            ,width: width
            ,color: 'white'
            ,font: { fontFamily:'Helvetica Neue', fontSize:16 }
        });
        return label;
    }
	return self;
}
module.exports = StandingsWindow;
