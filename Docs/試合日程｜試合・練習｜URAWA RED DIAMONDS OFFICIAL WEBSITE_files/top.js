rot_num = 0;
//画像書き出し
function write_img(num) {
	var temp = '<A href="' + rot_ary[num][1] + '" target="_blank"><IMG src="' +rot_ary[num][0] + '" width="150" height="300" alt="" border="0" name="浦和レッドダイヤモンズオンラインショッピング"></A>';
	document.getElementById('bn').innerHTML = temp;
}

//ローテーション関数

function rot_img() {

	if(document.getElementById) {

		rot_num ++;

		if (rot_num >= rot_ary.length) {

			rot_num = 0;

		}
		
		 write_img(rot_num);
		 
	}

}



//タイマー設定

tm = setInterval('rot_img()',5000);



//画像キャッシュ

function init(){

	var preimage = new Array();

	for(i = 0 ; i < rot_ary.length; i++) {

		preimage[i] = new Image();

		preimage[i].src = rot_ary[i][0];

	}
	write_img(0);
}



window.onload = init;