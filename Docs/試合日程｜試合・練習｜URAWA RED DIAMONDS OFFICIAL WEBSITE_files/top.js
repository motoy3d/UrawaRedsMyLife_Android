rot_num = 0;
//�摜�����o��
function write_img(num) {
	var temp = '<A href="' + rot_ary[num][1] + '" target="_blank"><IMG src="' +rot_ary[num][0] + '" width="150" height="300" alt="" border="0" name="�Y�a���b�h�_�C�������Y�I�����C���V���b�s���O"></A>';
	document.getElementById('bn').innerHTML = temp;
}

//���[�e�[�V�����֐�

function rot_img() {

	if(document.getElementById) {

		rot_num ++;

		if (rot_num >= rot_ary.length) {

			rot_num = 0;

		}
		
		 write_img(rot_num);
		 
	}

}



//�^�C�}�[�ݒ�

tm = setInterval('rot_img()',5000);



//�摜�L���b�V��

function init(){

	var preimage = new Array();

	for(i = 0 ; i < rot_ary.length; i++) {

		preimage[i] = new Image();

		preimage[i].src = rot_ary[i][0];

	}
	write_img(0);
}



window.onload = init;