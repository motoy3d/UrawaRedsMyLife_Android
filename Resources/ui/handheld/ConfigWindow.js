/**
 * 設定画面を表示するウィンドウ
 */
function ConfigWindow(webData) {
	var util = require("/util/util").util;
    var style = require("/util/style").style;
	var self = Ti.UI.createWindow({
		title: "浦和レッズ My Life 設定"
		,navBarHidden: false
		,backgroundColor: "black"
		,barColor: 'red'
	});
    var table = Ti.UI.createTableView({
        backgroundColor: "black"
        ,separatorColor: '#666'
        ,allowsSelection: false
        ,width: Ti.UI.FILL
        ,height: Ti.UI.FILL
    });
    self.add(table);
    
    // 簡易記事モード
    {
        var dispModeRow = Ti.UI.createTableViewRow({
            width: Ti.UI.FILL
            ,height: 80
        });
        var simpleDispModeLabel = Ti.UI.createLabel({
            text: "簡易記事モード(高速)"
            ,color: "white"
            ,left: 10
        });
        dispModeRow.add(simpleDispModeLabel);
        
        var simpleDispModeProp = Ti.App.Properties.getBool("simpleDispMode");
        Ti.API.info('dispModeProp=========' + simpleDispModeProp);
        if(simpleDispModeProp == null || simpleDispModeProp == undefined) {
            simpleDispModeProp = false;
        }
        var simpleDispModeSwitch = Ti.UI.createSwitch({
            value: simpleDispModeProp
            ,right: 10
            ,top: 20
            ,verticalAlign: "center"
        });
        //プロパティ保存
        simpleDispModeSwitch.addEventListener("change", function(){
            Ti.App.Properties.setBool("simpleDispMode", simpleDispModeSwitch.value);
        });
        dispModeRow.add(simpleDispModeSwitch);
        table.appendRow(dispModeRow);
    }
    
    
	return self;
};
module.exports = ConfigWindow;