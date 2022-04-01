// 사이드 네비게이션
// 1. '프로필 편집' 버튼
$('#profile_setting_btn').click(function(){
    $('#profile_setting').removeClass('none');
    $('#account_setting').addClass('none');
    $('#profile_setting_btn').addClass('nav_btn_focus');
    $('#account_setting_btn').removeClass('nav_btn_focus');
});

// 2. '계정' 버튼
$('#account_setting_btn').click(function(){
    $('#account_setting').removeClass('none');
    $('#profile_setting').addClass('none');
    $('#account_setting_btn').addClass('nav_btn_focus');
    $('#profile_setting_btn').removeClass('nav_btn_focus');
});


// 프로필 이미지 변경
$(function() {
    $("#profile_image_input").on('change', function(){
    readURL(this, 1);
    });
});
// 배경 이미지 변경
$(function() {
    $("#background_image_input").on('change', function(){
        readURL(this, 2);
    });
});

function readURL(input, n) {
    // $('.profile_img').attr('src', '../static/img/user_profile_gray.png');
    // $('.background_img').attr('src', '../static/img/login_background.png');

    if (input.files && input.files[0]) {
        var reader = new FileReader();
        // 1 -> 프로필 이미지 변경
        if (n == 1) {
            reader.onload = function (e) {
                $('.profile_img').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        } else {
        // 2 -> 배경 이미지 변경
            reader.onload = function (e) {
                $('.background_img').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
}

//닉네임 변경 중복 검사
let nickname_check = document.querySelector('.check_btn');
let input = document.querySelector('#input_nickname');
let check_p = document.querySelector('.nickname_check');
let nickname_submit = document.querySelector('.nickname_submit');

function input_keyup() {
    let input_nickname = input.value;
    //닉네임 공백 허용 X
    if (input_nickname.includes(" ")) {
        check_p.innerText = '공백은 입력할 수 없습니다.';
        check_p.style.color = '#000';
        check_p.className = 'nickname_check check';
        //모든 버튼 disabled
        nickname_submit.disabled = true;
        nickname_check.disabled = true;
    } //닉네임 null이면 disabled
    else if (input_nickname == ''){
        nickname_submit.disabled = true;
        nickname_check.disabled = true;
    } 
    else {
        nickname_check.disabled = false;
    }
}

function check_btn(){
    //사용자가 입력한 닉네임
    let input_nickname = input.value;
    //db 닉네임 list
    let db_nicknames = $(input).data().nickname_list;
    let nickname_array = db_nicknames.list;

    // db list에 입력한 닉네임이 포함 된 경우
    if (nickname_array.includes(input_nickname)) {
        check_p.innerText = '이미 존재하는 닉네임입니다.';
        check_p.style.color = 'red';
        check_p.className = 'nickname_check check';
        nickname_submit.disabled = true;
    } 
    //닉네임을 입력하지 않고 중복 확인 누른 경우
    else if (input_nickname == "") {
        check_p.innerText = '닉네임을 입력해주세요.';
        check_p.style.color = '#000';
        check_p.className = 'nickname_check check';
        nickname_submit.disabled = true;
    }
    else {
        check_p.innerText = '사용 가능한 닉네임입니다.';
        check_p.style.color = 'green';
        check_p.className = 'nickname_check check';
        nickname_submit.disabled = false;
    }
}
//check 애니메이션이 끝나면 class 제거
function animation_end() {
    check_p.className = 'nickname_check';
}

input.addEventListener('keyup', input_keyup);
nickname_check.addEventListener('click', check_btn);
check_p.addEventListener('animationend', animation_end);
export {check_btn, animation_end, input_keyup}

// change_pw
// 사용자가 입력한 기존 pw를 ajax로 전달
$('#origin_pw_btn').click(function(){
    let origin_pw = $('#origin_pw').val();

    var input_pw = {
        "origin_pw": origin_pw
    }

    $.ajax({
        type: 'POST',
        url: 'change_pw',
        data: JSON.stringify(input_pw),
        dataType: 'JSON',
        contentType: "application/json",
        success: function(data){
            if (data['flag'] == 1) {
                // 사용자 입력 허용 disabled false
                $('#change_pw_btn').attr('disabled', false);
                $('.lock_icon').attr('disabled', false);
                // 영역 흐림 해제
                $('#setting_pw_form').removeClass('opacity');
                // 비밀번호 틀림 문구 해제
                $('.wrong_origin_pw').addClass('none');
                $('#origin_pw').removeAttr('style', 'outline:none; border: solid 2px red;');        
                
            } else {
                // 사용자 입력 차단 disabled true
                $('#change_pw_btn').attr('disabled', true);
                $('.lock_icon').attr('disabled', true);
                // 영역 흐림 표시
                $('#setting_pw_form').addClass('opacity');
                // 비밀번호 틀림 문구 표시 및 border:red
                $('.wrong_origin_pw').removeClass('none');
                $('#origin_pw').attr('style', 'outline:none; border: solid 2px red;');        
            }
            
        },
        error: function(request, status, error){
            alert('ajax 통신 실패')
            console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
        }
    })
});

// 비밀번호 변경 유효성 검사
import {password_validation} from './check_password.js';
document.getElementById('pw2').addEventListener('keyup', password_validation);
document.getElementById('pw').addEventListener('keyup', password_validation);

//로그아웃 confirm
$('#setting_logout').click(function(){
    if (confirm("현재 계정에서 로그아웃합니다.") == true) {
        $.ajax({
            type: "GET",
            url: "/logout",
            dataType: 'JSON',
            contentType: "application/json",
            success: function(){
                console.log("logout")
                location.replace("http://localhost:5000/login");
            },
            error: function(request, status, error){
                alert('ajax 통신 실패')
                console.log(error)
            }
        })
    } else {
        return false
    };
});

//회원 탈퇴
$("html").click(function(e){
    let withdrawal = document.getElementById("withdrawal_popup_back");
    let withdrawal_info = document.getElementsByClassName("withdrawal_info");
    let withdrawal_info2 = document.getElementsByClassName('withdrawal_info2');
    let withdrawal_step = document.getElementsByClassName('withdrawal_step');
    let withdrawal_complete = document.getElementsByClassName('withdrawal_complete');
    console.log(withdrawal)
    
    console.log(e.target.id)
    //탈퇴 버튼
    if (e.target.className == 'withdrawal') {
        withdrawal.classList.remove('none');
        console.log(withdrawal.className)
    } //탈퇴 진행(확인) 버튼
    else if (e.target.id == 'withdrawal_btn') {
        withdrawal_info2[0].style.maxHeight = '0px';
        withdrawal_step[0].style.maxHeight = '250px';
        console.log("withdrawal_btn")
    } //탈퇴 취소 버튼(각 요소 원위치)
    else if (e.target.id == 'withdrawal_cancel_btn') {
        withdrawal.className = 'more_icon_popup_back none';
        withdrawal_info[0].style = '';
        withdrawal_info2[0].style = '';
        withdrawal_step[0].style = '';
    } //탈퇴 진행 완료 버튼(로그인 페이지 이동)
    else if (e.target.id == 'withdrawal_submit') {
        let id = document.getElementById('user_id').value;
        let pw = document.getElementById('user_password').value;
        let confirm = document.getElementById('confirm').value;
        let request_data = {
            'id' : id,
            'pw' : pw
        }
        if(confirm == "탈퇴를 진행합니다.") {
            $.ajax({
                type: 'POST',
                url: 'secession',
                data: JSON.stringify(request_data),
                dataType: 'JSON',
                contentType: "application/json",
                success: function(data){
                    console.log(data)
                    // 탈퇴 성공 시 애니메이션 동작
                    if (data['result2']== true) {
                        withdrawal_info[0].style.maxHeight = '0px';
                        withdrawal_step[0].style = '';
                        withdrawal_complete[0].style.maxHeight = '100px'; 

                        // delay 후 로그아웃 -> login 페이지로 이동
                        setTimeout(function() {
                            $.ajax({
                                type: 'POST',
                                url: 'logout',
                                success: function(data){
                                    window.location.href = 'http://' + document.domain + ':' + location.port+'/login';
                                },
                                error: function(request, error){
    
                                }
                            })
                          }, 8000);
                    // 탈퇴 실패 시 alert
                    } else {
                        alert(data['result2'])
                    }
                },
                error: function(request, status, error){
                    alert('ajax 통신 실패')
                    console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
                }
            })
        } else {
            alert('파란 글씨 확인 후 다시 한번 입력해주세요')
        }
    };

});