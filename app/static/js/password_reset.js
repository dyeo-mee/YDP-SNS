// 인증번호 발송
// send_email
$('#send_email_btn').click(function(){
    console.log('send email ajax')
    let send_email = $('#send_email').val();
    console.log(send_email)

    $('.certification_img').attr('src','../static/img/protection.png');
    $('.certification_text').text('발급된 인증번호를 확인해주세요.');
    $('.certification_text').css({'color':"#000000"});

    $('.certification_status').addClass('opacity');

    if (send_email == '') {
        alert('인증번호를 받을 이메일을 입력해주세요.')
    }else{
        let input_email = {
            "send_email" : send_email
        };
    
        $.ajax({
            type: 'POST',
            url: 'send_email',
            data: JSON.stringify(input_email),
            dataType: 'JSON',
            contentType: "application/json",
            success: function(data) {
                console.log(data['ran_num'])
                // 메일로 발송한 인증번호 flask->js->html
                $('#input_num_submit').attr('num-data', data['ran_num'])
                count_down();
                //인증번호 확인 요청 문구
                $(".certification_status").attr("class","certification_status");
            },
            error: function(request, status, error){
                alert('ajax 통신 실패')
                alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        })
    };

});

// 인증 유효시간 count-down
function paddedFormat(num) {
    //시간 00:00으로 표기
    return num < 10 ? "0" + num : num; 
}

function startCountDown(duration, element) {
    let secondsRemaining = duration;
    let min = 0;
    let sec = 0;

    let countInterval = setInterval(function () {
        min = parseInt(secondsRemaining / 60);
        sec = parseInt(secondsRemaining % 60);

        element.text(`${paddedFormat(min)}:${paddedFormat(sec)}`);

        secondsRemaining = secondsRemaining - 1;
        //유효시간 내 인증 성공
        if (certification == 'success') {
            clearInterval(countInterval);
            console.log('time stop')
        } 
        //인증 유효시간 만료 시
        if (secondsRemaining < 0) { 
            let certification_img = $('.certification_img');
            let certification_text = $('.certification_text');
        
            clearInterval(countInterval);
            //안내문구 표시
            certification_img.attr('src','../static/img/unprotected_color.png');
            certification_text.text('인증 유효시간이 만료되었습니다.');
            certification_text.attr('style','color:red');
            $('.certification_status').addClass('opacity');
            //인증번호 초기화
            let certification_num = $('#input_num_submit').attr('num-data',`{{ session[''] }}`);
            console.log(certification_num.attr('num-data'))
        };

    }, 1000);
}
let certification = "";

function count_down() {
    let time_minutes = 3; // set minutes
    let time_seconds = 0; // set seconds
    let duration = time_minutes * 60 + time_seconds;

    let element = $('#count_down');
    element.text(`${paddedFormat(time_minutes)}:${paddedFormat(time_seconds)}`);
    startCountDown(--duration, element);
};

$('.certification_status').on('animationend', function(){
    $('.certification_status').removeClass('opacity');
});

// 인증번호 일치 여부
// password_reset
$('#input_num_submit').click(function(e){
    console.log('button ajax')
    // 사용자가 입력한 6자리 session 전달
    const input_num = $('#input_num').val();
    sessionStorage.setItem('input_num', input_num);
    // 발급된 인증번호
    const ran_num = $('#input_num_submit').attr('num-data');

    // 인증번호 일치여부
    let certification_img = $('.certification_img');
    let certification_text = $('.certification_text');

    // 인증번호 일치 시 비밀번호 변경하는 영역 표시
    let password_reset = $('#password_reset');
    // 인증번호 일치 시 인증번호 입력란 가림
    let email_send_container = $('#email_send_container');

    let flag_data = {
        "input_num": input_num,
        "ran_num": ran_num,
    }
    console.log(input_num, certification_img, certification_text, password_reset, email_send_container)
    $.ajax({
        type: 'POST',
        url: 'password_reset',
        data: JSON.stringify(flag_data),
        dataType: 'JSON',
        contentType: "application/json",
        success: function(data){
            if (input_num == ran_num) {
                certification = 'success'
                //animation 적용
                $('.certification_status').addClass('opacity');
                // 번호 일치 img 변경
                certification_img.attr('src','../static/img/protection_color.png');
                // 번호 일치 text 및 style 변경
                certification_text.text('인증에 성공하였습니다.');
                certification_text.attr('style','color:green');
                // 번호 일치 pw 변경 영역 표시
                password_reset.removeClass('none');
                // 번호 일치 email 입력 영역 가림
                email_send_container.addClass('none');
            } 
            // 번호 불일치 시
            else {
                certification = 'fail'
                //animation 및 css 적용
                $('.certification_status').addClass('opacity');
                certification_img.attr('src','../static/img/unprotected_color.png');
                certification_text.text('인증에 실패하였습니다.');
                certification_text.attr('style','color:red');
                password_reset.addClass('none');
                email_send_container.removeClass('none');
            };
        },
        error: function(request, status, error){
            alert('ajax 통신 실패')
            console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            // alert(error);
        }
    })
});

// 비밀번호 변경 유효성 검사
import { password_validation } from './check_password.js';
document.getElementById('pw').addEventListener('keyup', password_validation);
document.getElementById('pw2').addEventListener('keyup', password_validation);
