/**
 * 順位表取得サービス
 * Yahoo スポーツから読み込み
 */
function Standings() {
	var util = require("/util/util").util;
    var style = require("/util/style").style;

	var self = {};
	self.load = load;
	// YQL
	var standingsQuery = "select * from html where url="
		+ "'http://soccer.yahoo.co.jp/jleague/standings/j1' "
		+ " and xpath=\"//div[@id='team_ranking']/table/tr\"";

	/**
	 * Yahooスポーツサイトのhtmlを読み込んで表示する
	 */
	function load(callback) {
	    Ti.API.info('---------------------------------------------------------------------');
	    Ti.API.info(util.formatDatetime() + '  順位表読み込み');
        Ti.API.info('---------------------------------------------------------------------');
        
		// オンラインチェック
		if(!Ti.Network.online) {
            callback.fail(style.common.offlineMsg);
            return;
		}
		Ti.App.Analytics.trackPageview('/standings');
		var before = new Date();
		var standingBody = "";
		Ti.API.info('★★順位表YQL ' + standingsQuery);
		Ti.Yahoo.yql(standingsQuery, function(e) {
			try {
				if(e.data == null) {
				    callback.fail(style.common.loadingFailMsg);
					return;
				}
				var standingsDataList = new Array();
				Ti.API.debug("e.data.tr■" + e.data.tr.length);
				var dataList = e.data.tr;			
				for(i=1; i<dataList.length; i++) {
					// タグからデータ抽出
					var tdList = dataList[i]["td"];
					var rank = tdList[0].em;
	//				var image = tdList[2].a.img.src;
					var team = util.getTeamName(tdList[3].a.content);
					var point = tdList[4].strong;
					var win = tdList[6].p;
					var draw = tdList[7].p;
					var lose = tdList[8].p;
					var gotGoal = tdList[9].p;
					var lostGoal = tdList[10].p;
					var diff = tdList[11].p;
					// var gridRow = new GridRow(gridRowClassName);
					//Ti.API.info(i + "★gridRow=" + gridRow);
					Ti.API.debug(rank + ' : ' + team + ' : ' + point);
					
					var standingsData = {
					    rank: rank
					    ,team: team
					    ,point: point
					    ,win: win
					    ,draw: draw
					    ,lose: lose
					    ,gotGoal: gotGoal
					    ,lostGoal: lostGoal
					    ,diff: diff
					};
					standingsDataList.push(standingsData);
				}
				callback.success(standingsDataList);
				Ti.API.info('+++++++++++++++++++ YQL終了')
			} catch(ex) {
				Ti.API.error('---------------------\n' + ex);	
                callback.fail(style.common.loadingFailMsg);
			} finally {
			}
			var after = new Date();
			Ti.API.info("Standings.js#load() 処理時間★" 
				+ (after.getTime()-before.getTime())/1000.0 + "秒");
		});
	}
	return self;
}
module.exports = Standings;