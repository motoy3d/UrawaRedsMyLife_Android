/******** BrowserCheck **********/

browserEnv = new Object();
browserEnv.ua = navigator.userAgent;
browserEnv.na = navigator.appName;
browserEnv.nv = navigator.appVersion;
browserEnv.osSmp = 'unknown';
browserEnv.brsSmp = 'unknown';
browserEnv.verSmp = 0;
browserEnv.osDtl = 'unknown';
browserEnv.brsDtl = 'unknown';
browserEnv.verDtl = 0;
browserEnv.setEnv = function() {
	var tempindex;
	if(this.ua.indexOf('Netscape6') >= 0) {
		this.ua = this.ua.replace('Netscape6','Netscape');
	}
	if (this.na.indexOf('Netscape') >= 0) {
		this.brsSmp = 'ns';
		this.verSmp = this.nv;
	} else if (this.na.indexOf('Microsoft') >= 0) {
		this.brsSmp = 'ie';
		tempindex = this.nv;
		this.verSmp = tempindex.substring(tempindex.indexOf('MSIE') + 5,tempindex.length);
	} else if (this.na.indexOf('Opera') >= 0){
		this.brsSmp = 'op';
		this.verSmp = this.nv;
	} else {
		this.brsSmp = 'other';
		this.verSmp = this.nv;
	}
	this.verSmp = parseFloat(this.verSmp);
	if(this.ua.indexOf('Safari') >= 0) {
		this.brsDtl = 'safari';
		tempindex = this.ua.indexOf('Safari');
		this.verDtl = this.ua.substring(tempindex + 7,this.ua.length);
	} else if (this.ua.indexOf('Opera') >= 0) {
		this.brsDtl = 'opera';
		tempindex = this.ua.indexOf('Opera');
		this.verDtl = this.ua.substring(tempindex + 6,this.ua.length);
	} else if (this.ua.indexOf('Netscape') >= 0) {
		this.brsDtl = 'netscape';
		tempindex = this.ua.indexOf('Netscape');
		this.verDtl = this.ua.substring(tempindex + 9,this.ua.length);
	} else if (this.ua.indexOf('Firefox') >= 0) {
		this.brsDtl = 'firefox';
		tempindex = this.ua.indexOf('Firefox/');
		this.verDtl = this.ua.substring(tempindex + 8,this.ua.length);
	} else if (this.ua.indexOf('Gecko') >= 0) {
		this.brsDtl = 'mozilla';
		tempindex = this.ua.indexOf('rv:');
		this.verDtl = this.ua.substring(tempindex + 3,this.ua.length);
	} else if (this.ua.indexOf('MSIE') >= 0) {
		this.brsDtl = 'ie';
		tempindex = this.ua.indexOf('MSIE');
		this.verDtl = this.ua.substring(tempindex + 5,this.ua.length);
	} else if (this.na.indexOf('Netscape') >= 0){
		this.brsDtl = 'netscape';
		this.verDtl = this.nv;
	} else {
		this.brsDtl = 'other';
		this.verDtl = this.nv;
	}
	this.verDtl = parseFloat(this.verDtl);
	if (this.ua.indexOf('Win') >= 0) {
		this.osSmp = 'win';
		tempindex = this.ua.indexOf('Windows ');
		this.osDtl = this.ua.substring(tempindex,this.ua.length);
		this.osDtl = this.osDtl.replace(')',';');
		this.osDtl = this.osDtl.substring(0,this.osDtl.indexOf(';'));
		this.osDtl = this.osDtl.replace('NT 5.1','XP');
		this.osDtl = this.osDtl.replace('NT 5.0','2000');
		if(this.ua.indexOf('SV1') >= 0) {
			this.osDtl = this.osDtl.replace('XP','XP_SP2');
		}
	} else if (this.ua.indexOf('Mac') >= 0) {
		this.osSmp = 'mac';
		if((this.ua.indexOf('Mac OS X') >= 0) || ((this.brsDtl == 'ie') && (this.verDtl >= 5.2))) {
			this.osDtl = 'Mac OS X';
		} else {
			this.osDtl= 'Mac OS';
		}
	} else {
		this.osSmp = 'other';
		this.osDtl = 'other';
	}
}
browserEnv.setEnv();





/******** window open **********/

function openwin(wname,w,h){
	win_set = 'toolbar=no,location=0,directories=no,status=yes,menubar=0,scrollbars=no,resizable=no,width='+w+',height='+h;
	swin = window.open('',wname,win_set);
}

function openwinResizable(wname,w,h){
	win_set = 'toolbar=no,location=0,directories=no,status=yes,menubar=0,scrollbars=yes,resizable=yes,width='+w+',height='+h;
	swin = window.open('',wname,win_set);
}

function openwinLegacy(path,wname,w,h){
	win_set = 'toolbar=no,location=0,directories=no,status=yes,menubar=0,scrollbars=no,resizable=no,width='+w+',height='+h;
	swinL = window.open(path,wname,win_set);
}





/******** menu **********/

if(document.getElementById){
	document.writeln('<style type="text/css" media="all">');
	document.writeln('<!--');
	document.writeln('.sidehide{display:none;}');
	document.writeln('-->');
	document.writeln('</style>');
}

function showHide(id){
	var disp = document.getElementById(id).style.display;

	if(disp == "block"){
		document.getElementById(id).style.display = "none";
	}else{
		document.getElementById(id).style.display = "block";
	}
	return false;
}


function showHidemenu(id){
	

	
	var disp = document.getElementById(id).style.display;
	
	
	if(id == 'rank01') {
		document.getElementById('rank01').style.display = "block";
		document.getElementById('rank02').style.display = "none";
		//document.getElementById('rank03').style.display = "none";
	} else if(id == 'rank02') {
		document.getElementById('rank01').style.display = "none";
		document.getElementById('rank02').style.display = "block";
		//document.getElementById('rank03').style.display = "none";
	} else if (id == 'rank03') {
		document.getElementById('rank01').style.display = "none";
		document.getElementById('rank02').style.display = "none";
		//document.getElementById('rank03').style.display = "block";
	}


	//if(id != 'rank01') document.getElementById('rank01').style.display = "none";
	//if(id != 'rank02') document.getElementById('rank02').style.display = "none";

	/*if(disp == "block"){
		document.getElementById(id).style.display = "none";
	}else{
		document.getElementById(id).style.display = "block";
	}*/
	
	return false;

}