import indicate_time from './time_information.js';
// upload time
$(function(){
    let create_time = document.querySelectorAll('.notice_time');
    //각 게시물 별 업로드 시간
    create_time.forEach(time => {
        indicate_time(time)
        // time.addEventListener('load', indicate_time);
    });
});
//user icon
// let user_icon = document.getElementsByClassName('.top_bar_user');
let user_popup = document.getElementById('user_popup');
let user_triangle = document.getElementById('triangle');
// notice icon
let notice_icon = document.getElementsByClassName('notice_icon');
let notice_popup = document.getElementById('notice_container');
let notice_dot = document.getElementById('notice_dot');
let notice_triangle = document.getElementById('notice_triangle');

// post notice modal
let post_modal = document.querySelectorAll('.notice_modal_background');

//maintain notice dot
$(function(){
    let notice_check = $('.notice_list').attr('notice_check')
    if (notice_check == 'False'){
        notice_dot.className = 'notice_dot'
    }
})

//상단바 아이콘 팝업창 토글
$('html').click(function(e){
    // console.log(e.target)
    //user modal area
    if (e.target == user_popup){
        return console.log('user modal');
    } //notice modal area
    else if (e.target.className == 'notice_txt') {
        return console.log('notice item');
    } //post notice modal show
    else if (e.target.className.includes('post_notice_click')) {
        return console.log('post notice link')
    } //notice post area
    else if (e.target.closest('.post_notice_area')) {
        // post notice like modal 창
        if (e.target.className.includes('like_close') || e.target.className == 'like_container_back'){
            //close btn or background 클릭시 none class
            let notice_like_modal = e.target.closest('.like_container_back')
            notice_like_modal.classList += ' none';
        }
        else {
            return console.log('notice post');
        };
    } //withdrawal btn
    else if(e.target.className == 'withdrawal'){
        return console.log('withdrawal')
    } //not modal area
    else if(e.target != user_popup || e.target != notice_popup || e.target.className == 'notice_modal_background' || e.target.id == 'notice_modal_close_img'){
        //user icon click
        if (e.target.className == 'top_bar_user') {
            //user modal toggle
            user_popup.classList.toggle('none');
            user_triangle.classList.toggle('none');
            //notice hide
            notice_popup.className = 'none notice_popup user_popup';
            notice_triangle.className = 'triangle none';
            //notice icon change
            $(notice_icon[0]).attr('src', '../static/img/notification.png');
            
            console.log('user_icon');
        } 
        //notice icon click
        else if (e.target.className.includes('notice_icon')) {
            //notice modal toggle
            notice_popup.classList.toggle('none');
            notice_triangle.classList.toggle('none');
            //notice icon change
            if (notice_popup.classList.contains('none')) {
                //if notice popup has class 'none', show empty icon
                $(notice_icon[0]).attr('src', '../static/img/notification.png');
            } else {
                $(notice_icon[0]).attr('src', '../static/img/notification_fill.png');
            }
            //notice dot hide
            notice_dot.className = 'notice_dot none';
            //user hide
            user_popup.className = 'user_popup none';
            user_triangle.className = 'triangle none';
            $.ajax({
                type: "POST",
                url: "/notice",
                success: function(data){
                    
                },
                error: function(request, status, error){
                    alert('ajax 통신 실패')
                    alert(error);
                }
            })
        } // post notice의 modal 창만 닫힘
        else if (e.target.className == 'notice_modal_background' || e.target.id == 'notice_modal_close_img') {
            post_modal.forEach(post => {
                post.style.display = 'none';
                console.log('post display none');
            });
            document.querySelector(".body").className = "body";
        } 
        else { //if not icon clicked, hide to all modal
            user_popup.className = 'user_popup none';
            user_triangle.className = 'triangle none';
            notice_popup.className = 'none notice_popup user_popup';
            notice_triangle.className = 'triangle none';
            $(notice_icon[0]).attr('src', '../static/img/notification.png');
            // post_modal.forEach(post => {
            //     post.style.display = 'none';
            //     console.log('post display none');
            // });
            console.log('close area');
        };
    };
});


//현재 페이지 navigation 표시
let url = document.location.href.split('/');

$(function(){
    let top_bar_icon = document.querySelectorAll('.top_bar_icon');
    top_bar_icon.forEach(icon => {
        let alt = icon.getAttribute('alt');
        //index 페이지 일 경우
        if(url[3] == ''){
            //home_icon만 가져와서 변경
            if (alt == 'home_icon') {
                $(icon).attr('src', '../static/img/home_fill.png');
                console.log("home")
            };
        } //friend 페이지 일 경우
        else if(url[3] == 'friend'){
            //friend_icon만 가져와서 변경
            if(alt == 'friend_icon'){
                $(icon).attr('src', '../static/img/friends_fill.png');
                console.log("friend")
            };
        }; 
    });
});
function make_notice_div(notice){
    // notice가 추가될 위치
    const notice_list = document.querySelector(".notice_list");
    // 각 notice 전체를 감쌀 div tag 
    const create_div = document.createElement('div');
    // img를 감쌀 div tag
    const create_div_img = document.createElement('div');

    // 알림에 해당하는 img or text 데이터의 img, p 태그
    let create_notice_info = null
    if (notice['notice_info']['notice_img_kind'] == 'post_text'){
        create_notice_info = document.createElement('p');
    } else {
        create_notice_info = document.createElement('img');
    }
    
    // 시간 정보, 닉네임 정보, 알림 정보를 담을 div tag
    const create_div_notice_content = document.createElement('div');
    // 알림 정보를 작성할 p 태그
    const create_p_notice_txt = document.createElement('p');
    // 닉네임을 감쌀 a 태그
    const create_a_notice_a = document.createElement('a');
    // 시간 정보를 담을 p 태그
    const p_notice_a = document.createElement('p');

    // notice 리스트에 추가할 div 태그
    if(notice['kind'] =='request_friend'){
        $(create_div).attr({
            'class': 'notice_item friend_notice',
            'value': notice['notice_info']['nickname']
        });
    } else {
        $(create_div).attr({
            'class': 'notice_item post_notice',
            'value': notice['notice_info']['nickname']
        });
    }
    // 이미지를 감쌀 a 테그
    $(create_div_img).attr({
        'href': '/user/'+notice['notice_info']['nickname'],
        'class': 'notice_a img'
    });
    // 이미지 테그
    if(notice['notice_info']['notice_img_kind'] =='profile_img'){
        $(create_notice_info).attr({
            'src': notice['notice_info']['notice_img_data'],
            'class': 'friend_notice_img'
        });
    } else if(notice['notice_info']['notice_img_kind'] =='post_img') {
        $(create_notice_info).attr({
            'src': notice['notice_info']['notice_img_data'],
            'class': 'post_notice_img',
            'value': notice['post_id']
        });
    } else {
        $(create_notice_info).text('"' + notice['notice_info']['notice_img_data'] + '"');
    }
    $(create_div_notice_content).attr({
        'class': 'notice_content'
    });
    // 알림 내용
    $(create_p_notice_txt).attr({
        'class': 'notice_txt',
    });
    if (notice['kind'] =='request_friend'){
        $(create_p_notice_txt).text('님이 친구 요청을 보냈습니다.')
    } else if (notice['kind'] =='like') {
        $(create_p_notice_txt).text('님이 게시물을 좋아합니다.')
    } else if (notice['kind'] =='reply') {
        $(create_p_notice_txt).text('님이 답글을 달았습니다.')
    } else if (notice['kind'] =='comment') {
        $(create_p_notice_txt).text('님이 댓글을 달았습니다.')
    } else {
        $(create_p_notice_txt).text('님이 회원님을 멘션 했습니다.')
    }

    $(create_a_notice_a).attr({
        'class': 'notice_a notice_nickname',
        'href': '/user/'+notice['notice_info']['nickname']
    });
    $(create_a_notice_a).text(notice['notice_info']['nickname'])

    $(p_notice_a).attr({
        'class': 'notice_a notice_time',
        'value': notice['time']
    });
    indicate_time(p_notice_a)

    // 생성한 태그들 구조에 맞게 append
    create_p_notice_txt.prepend(create_a_notice_a);
    create_p_notice_txt.appendChild(p_notice_a);
    create_div_notice_content.appendChild(create_p_notice_txt);
    create_div_img.appendChild(create_notice_info);
    create_div.appendChild(create_div_img);
    create_div.appendChild(create_div_notice_content);
    // 좋아요 리스트에 최종적으로 div 태그 append
    notice_list.prepend(create_div);
}


let session_nickname = $('.notice_list').attr('session_nickname')
let session_id = $('.notice_list').attr('session_id')

socket.on('request_notice', function(retMessage) {
    let message = retMessage[0]
    if(message['notice_user'] == session_id){
        make_notice_div(message)
        notice_dot.className = 'notice_dot';
    }
});

socket.on('like_notice', function(retMessage) {
    let message = retMessage[0]
    if(message['notice_user'] == session_nickname){
        make_notice_div(message)
        notice_dot.className = 'notice_dot';
    }
});

socket.on('comment_notice', function(retMessage) {
    let message = retMessage[0]
    if(message['notice_user'] == session_nickname){
        make_notice_div(message)
        notice_dot.className = 'notice_dot';
    }
});

socket.on('mention_notice', function(retMessage) {
    let message = retMessage[0]
    if(message['notice_user'] == session_nickname){
        make_notice_div(message)
        notice_dot.className = 'notice_dot';
    }
});


console.log($('.user_friend').attr('value'))