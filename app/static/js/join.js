// 비밀번호 변경 유효성 검사
import {password_validation} from './check_password.js';
document.getElementById('pw').addEventListener('keyup', password_validation);
document.getElementById('pw2').addEventListener('keyup', password_validation);

// 닉네임 중복 확인
import {check_btn, animation_end, input_keyup} from './setting.js';
let input = document.querySelector('#input_nickname');
let nickname_check = document.querySelector('.check_btn');
let check_p = document.querySelector('.nickname_check');

input.addEventListener('keyup', input_keyup);
nickname_check.addEventListener('click', check_btn);
check_p.addEventListener('animationend', animation_end);
