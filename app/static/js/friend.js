// 추천 친구 - 함께아는 친구
$('html').click(function(e){
    let recommended = document.querySelectorAll('.recommended_friend');
    console.log(e.target)
    recommended.forEach(friend => {
        // 함께아는 친구 목록 클릭
        if (e.target == friend) {
            let friend_popup = $(friend).next();
            friend_popup.attr('class','more_icon_popup_back');
            document.querySelector(".body").className = "body scroll_hidden";
            console.log("friend list")
        }  //close 버튼 혹은 팝업 영역 외 클릭
        else if (e.target.className == 'top_bar_icon' || e.target.className == 'more_icon_popup_back') {
            let friend_popup = $(friend).next();
            friend_popup.attr('class','more_icon_popup_back none');
            document.querySelector(".body").className = "body";   
            console.log("close modal")
        }
        else { //팝업창 영역 클릭
            console.log('modal area')
        };
     });
});

// request_btn인 class 요소를 클릭한 경우
$('.request_btn').click(function(){
    // 클릭한 버튼에 해당하는 div 요소를 가져옴
    var div = $(this).parent()
    // div의 모든 자식 요소(button)
    var div_btn = $(this).parent().children();

    // 요청한 유저의 버튼이 맞는지 확인(및 flask data 전송)
    var btn_data_value = $(this).attr('btn-data-value');
    // console.log(btn_data_value)

    // (ajax)클릭한 버튼의 id 값으로 p태그 문구 변경
    var id = $(this).attr("id")

    // 모든 자식 요소(button)에 none class 추가
    $(div_btn).addClass('none');
    // console.log(div_btn)

    // p 태그 생성
    var create_p = document.createElement('p');
    $(create_p).addClass('request_btn_p');

    // div 영역에 p 태그 추가
    $(div).append(create_p);
    
    // console.log(create_p)

    var request_data = {
        "friend": btn_data_value, 
        "respond" : id
    }
    $.ajax({
        type: 'POST',
        url: 'friend_respond',
        data: JSON.stringify(request_data),
        dataType: 'JSON',
        contentType: "application/json",
        success: function(data){
            console.log(id, typeof(id), data)
            // alert('성공! 데이터 값:')
            // id 값에 따른 p태그 innerText 변경
            if (id == "accept_btn") {
                $(create_p).text('요청이 수락됐습니다.');

            } else if (id == "reject_btn") {
                $(create_p).text('요청이 거절됐습니다.');

            }else{
                var del = $(create_p).text('친구 목록에서\n삭제됐습니다.');
                del.html(del.html().replace(/\n/g, '<br/>'));
            }
        },
        error: function(request, status, error){
            alert('ajax 통신 실패')
            console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
        }
    })
});
// console.log('test')
