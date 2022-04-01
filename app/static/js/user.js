// 세션에 로그인 된 사용자의 user 페이지가 아닐 경우,
// 친구 추가, 요청 취소, 친구 삭제 버튼 활성화
function create_btn(){
    var request_btn = document.querySelector('.request_btn')
    console.log(request_btn.value)

    if (request_btn.value == 'friend'){
        $(request_btn).attr('id', 'delete_btn');
    } else if($(request_btn).attr('friend_list').includes($(request_btn).attr('user'))){
        $(request_btn).attr('id', 'reject_btn');
        $(request_btn).text('요청 취소');
    } else {
        $(request_btn).attr('id', 'accept_btn');
        $(request_btn).text('친구 요청');
    }
}

window.onload = create_btn();
user = $('.request_btn').data().name;

$('[id$=_btn]').click(function(){
    var btn_value = $(this).attr('user');
    var txt = $(this).text();

    var request_data = {
        "user": user,
        "id": btn_value, 
        "val" : txt
    }
    $.ajax({
        type: 'POST',
        url: "/request_friend",
        data: JSON.stringify(request_data),
        dataType: 'JSON',
        contentType: "application/json",
        success: function(data){
            if (txt == "친구 요청") {
                $(".request_btn").attr('id', 'reject_btn')
                $(".request_btn").text('요청 취소');

                // '요청 취소' button
            } else if (txt == "요청 취소") {
                $(".request_btn").attr('id', 'accept_btn')
                $(".request_btn").text('친구 요청');

            }else{ // '친구 삭제' button
                $(".request_btn").attr('id', 'accept_btn')
                $(".request_btn").text('친구 추가');
            }
        },
        error: function(request, status, error){
            alert('ajax 통신 실패')
            alert(error);
        }
    })
});

// other user friend list
$('html').click(function(e){
    console.log(e.target)
    // 더보기 버튼
    if (e.target.className == 'other_user_friend') {
        $('.more_icon_popup_back').attr('class','more_icon_popup_back');
        document.querySelector(".body").className = "body scroll_hidden";
    }  //close 버튼 혹은 팝업 영역 외 클릭
    else if (e.target.id == 'popup_friend_close' || e.target.className == 'more_icon_popup_back') {
        $('.more_icon_popup_back').attr('class','more_icon_popup_back none');
        document.querySelector(".body").className = "body";
        console.log("close modal")
    }
    else { //팝업창 영역
        console.log('modal area')
    };
});