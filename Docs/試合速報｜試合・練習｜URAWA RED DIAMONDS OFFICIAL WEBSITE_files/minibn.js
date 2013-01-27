var minibnHref = new Array("OSwwLDE=","MTAsMCwx","NywwLDE=","NiwwLDE=","OCwwLDE=");

var minibnSrc = new Array("bns02.gif","bns03.gif","bns05.gif","bns06.gif","ceremony.gif");

var minibnName = new Array("阪急交通社","埼玉縣信用金庫","Lufthansa","ファミリー引越センター","セレモニー");

var miniNum = new Array(0,1,2,3,4,5);


ml = minibnHref.length;


for(var i = 0;i < ml; i++){

	tgt = (Math.floor(Math.random()*ml) + i) % ml;
	
	data1 = miniNum[i];
	data2 = miniNum[tgt];
	miniNum[i] = data2;
	miniNum[tgt] = data1;
}

function minibnDw(){
	
	for(var i = 0; i < ml; i++){
		document.write('<li><a href="http://www.urawa-reds.co.jp/wp-content/plugins/adrotate/adrotate-out.php?track=' + minibnHref[miniNum[i]] + '"  target="new"><img src="http://www.urawa-reds.co.jp/img/' + minibnSrc[miniNum[i]] + '" border="0" alt="' + minibnName[miniNum[i]] + '"></a></li>');
	}
}