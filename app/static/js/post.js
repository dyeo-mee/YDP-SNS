// 동일한 content 구조가 들어가는 page에 export

// socket 통신을 위한 session user, socket 정보
const session_user = $('#content').attr('session_nicnkname');
var socket = io.connect('http://' + document.domain + ':' + location.port+'/');

// session user 더보기 btn
$(function(){    
    let more_icon = document.querySelectorAll(".more_icon");
    more_icon.forEach(more => {
        $(more).click(function(index){
            $(more).next().removeClass('none');
            document.querySelector(".body").className = "body scroll_hidden";    
        });
    });
    let more_icon_cancel = document.querySelectorAll(".more_icon_cancel");
    more_icon_cancel.forEach(cancel => {
        $(cancel).click(function(){
            let post_text = $(cancel).siblings('.update_form').children('.update_textarea');
            //수정한 이력이 존재하면
            if (post_text.val() != post_text.attr('value')) {
                if (confirm('작성하신 내용이 초기화됩니다.')==true) {
                    //팝업창 닫힘
                    $(cancel).parent().parent().addClass('none');
                    document.querySelector(".body").className = "body";    
                    //게시물 삭제 영역 닫힘
                    $(cancel).siblings('.post_delete_container').css({"max-height":"0"});
                    //게시물 수정 영역 닫힘
                    $(cancel).siblings('.update_form').css({"max-height":"0"});
                    //수정하기 전 내용으로 초기화
                    post_text.val(post_text.attr('value'));
                } else{
                    return false
                };
            } 
            //수정한 이력이 없다면 창닫힘
            else if (post_text.val() == post_text.attr('value')){
                $(cancel).parent().parent().addClass('none');
                document.querySelector(".body").className = "body";    
                $(cancel).siblings('.post_delete_container').css({"max-height":"0"});
                $(cancel).siblings('.update_form').css({"max-height":"0"});
            };
        });
    });
});

//Post Update-area show Button
$('[id$=_update_btn]').click(function(){
    console.log("update")
    // let post_id = $(this).attr('value');
    $(this).siblings(".update_form").css({"max-height":"110px"});
    //게시글 삭제 영역 숨김
    $(this).siblings(".post_delete_container").css({"max-height":"0"});
});

//취소 버튼을 눌렀을 때
$('[class$=_cancel_btn]').click(function(){
    //update 취소 버튼일 경우
    if ($(this).attr('class').includes('update_cancel_btn')) {
        console.log('includes')
        let textarea = $(this).parent().siblings();
        //기존 post text에서 변경된 내용이 있으면
        if (textarea.val() != textarea.attr("value")){
            //수정 초기화하고 창 닫힘
            if (confirm("작성하신 내용이 초기화됩니다.") == true) {
                textarea.val(textarea.attr("value"));
                $(this).parent().parent().css({"max-height":"0"});
            } else{
                return false
            };
        }else{
            $(this).parent().parent().css({"max-height":"0"});
        }
    }
    //delete 취소 버튼일 경우
    else if($(this).attr('class').includes('delete_cancel_btn')){
        $(this).parent().parent().css({"max-height":"0"});
    };
});

//게시글 삭제 메뉴 버튼을 눌렀을 때
$('[id$=t_delete]').click(function(){
    let textarea = $(this).siblings('.update_form').children('.update_textarea');
    //게시글 수정 이력이 존재하는 경우
    if (textarea.val() != textarea.attr("value")){
        console.log("change")
        //수정 취소
        if (confirm("작성하신 내용이 초기화됩니다.") == true) {
            console.log("update reset")
            //기존 내용으로 되돌리고 update hide
            textarea.val(textarea.attr("value"));
            $(this).siblings('.update_form').css({"max-height":"0"});
            //delete show
            $(this).siblings('.post_delete_container').css({"max-height":"80px"});
            console.log('delete height 80')
        }
        //계속 수정
        else{
            console.log("keep update")
            $(this).siblings('.update_form').css({"max-height":"fit-content"});
            $(this).siblings('.post_delete_container').css({"max-height":"0"});
        };
    }
    //게시글 수정 이력이 없으면
    else{
        console.log("nothing change")
        $(this).siblings('.post_delete_container').css({"max-height":"80px"});
        $(this).siblings('.update_form').css({"max-height":"0"});
    };
});

//Post Delete Button
$('[id$=_delete_btn]').click(function(){
    let post_id = $(this).attr('value');
    let close_div = $(this).parent().parent().parent().parent().parent().parent();
    $.ajax({
        type: 'DELETE',
        url: "/content_submit",
        data: JSON.stringify(post_id),
        dataType: 'JSON',
        contentType: "application/json",
        success: function(data){
            // $(close_div).addClass('none')
            $(close_div).css("display" ,"none");
            document.querySelector(".body").className = "body";
            alert('게시글이 삭제되었습니다.')
        },
        error: function(request, status, error){
            alert('ajax 통신 실패')
            alert(error);
        }
    });
});

// 이미지 슬라이드
//1.페이지 처음 로드 시 이미지의 개수에 따라 화살표 버튼 및 이미지 번호 표시를 구분 함
$(function(){   
    let total_img = document.querySelectorAll('.img_album');
    // 페이지에서 불러들인 모든 img_album을 돌며
    total_img.forEach(img_album => {
        //해당 태그의 value 속성
        let total_img_val = $(img_album).data().length;
        //해당 태그의 양쪽 화살표 버튼
        let img_arrow_btn = $(img_album).siblings('.img_arrow_btn');
        //img 개수 p태그
        let img_number = $(img_album).parent().parent().siblings('.content_footer').children('.img_number');
        // notice post p태그
        if (img_album.id == 'notice_img_album') {
            console.log("post notice p태그")
            $(img_album).siblings('#post_notice_img_num').css({"display":"none"});
        };
        //업로드한 이미지가 한 장일 경우 화살표 & img_num 표시 X
        if (total_img_val == "1") {
            $(img_arrow_btn).css({"display":"none"});
            img_number.css({"display":"none"});
        };
    });
    //페이지 처음 로드 시, 모든 게시물의 왼쪽 버튼 비활성화
    $('.left_arrow').css({"display":"none"});
});

//2.여러 이미지의 transform 및 현재 이미지 번호 표시
function imgSlide(){
    //모든 이미지 앨범을 가져옴
    let img_albums = document.querySelectorAll('.img_album');

    //각 이미지 앨범마다 다른 변수를 지정
    img_albums.forEach(img_album => {
        //해당 게시물의 총 이미지 개수
        let total_img_num = $(img_album).data().length;

        let img_index = 0; // 이미지 index
        let translate = 0; //이미지 이동 거리(x축)
        let present_img = 1; //현재 보이는 이미지의 순서

        //현재 게시물의 버튼
        let arrow_btn = $(img_album).siblings(".img_arrow_btn"); 
        //현재 게시물의 p태그
        let p_tag = $(img_album).parent().parent().siblings(".content_footer").children('.img_number');
        //현재 게시물의 textarea
        let content_text = $(img_album).parent().parent().siblings(".content_text");
        
        //img의 마지막 문자열 추출(file type check)
        let image_type = $(img_album).children().data().src.slice(-1);

        //img null인 경우(마지막 문자열이 dot)
        if (image_type == ".") {
            //image 영역 숨김
            let img_area = $(img_album).parent().parent('.content_image_viewer');
            img_area.css({"display":"none"});
        }
        //text null인 경우
        else if (content_text.children() == null) {
            let content_text = $(img_album).parent().parent().siblings('.content_text');
            content_text.css({"display":"none"});
        };

        $(arrow_btn).click(function(){
            //해당 게시물에서 누른 버튼이 right인 경우
            if ($(this).attr("class") == "img_arrow_btn right_arrow") {
                console.log("right")
                img_index += 1;
                present_img += 1;
                console.log("총 이미지",total_img_num)
                console.log("현재 이미지",present_img)

                //해당 게시물의 총 이미지 개수보다 index 번호가 작으면
                if (img_index < total_img_num) {
                    //해당 게시물 왼쪽 화살표 display 되돌림
                    $(img_album).siblings('.left_arrow').css({"display":""});
                    //앨범 x축 이동 거리(-) 추가 & 이동
                    translate -= 402;
                    $(img_album).css({
                        "transform":`translateX(${translate}px)`
                    });
                    //현재 이미지 번호 +1 & text 변경
                    p_tag.text(present_img +` / `+ p_tag.attr('value'));
                }
            };
            //해당 게시물에서 누른 버튼이 left인 경우
            if ($(this).attr("class") == "img_arrow_btn left_arrow") {
                console.log("left")
                img_index -= 1;
                present_img -= 1;
                console.log("총 이미지",total_img_num)
                console.log("현재 이미지",present_img)

                //해당 게시물의 총 이미지 개수보다 index 번호가 작으면
                if (img_index < total_img_num) {
                    //해당 게시물 오른쪽 화살표 display 되돌림
                    $(img_album).siblings('.right_arrow').css({"display":""});
                    //앨범 x축 이동 거리(+) 추가 & 이동
                    translate += 402;
                    $(img_album).css({
                        "transform":`translateX(${translate}px)`
                    });
                    //현재 이미지 번호 -1 & text 변경
                    p_tag.text(present_img +` / `+ p_tag.attr('value'));
                }
            };
            //image의 양 끝에 도달한 경우 버튼 display:none 설정
            //img_album의 transition이 끝났을 때
            $(img_album).on("transitionend", function(){
                //index 번호와 총 이미지 개수가 같다면
                if (img_index == (total_img_num -1)) {
                    console.log(img_index, total_img_num, "right end")
                    //해당 게시물 right 버튼 비활성화 & 현재 이미지 번호와 index 번호 일치
                    $(img_album).siblings('.right_arrow').css({"display":"none"});
                    p_tag.text(p_tag.attr('value') +` / `+ p_tag.attr('value'));
                }
                //index 번호가 0이면
                if (img_index == 0) {
                    console.log(img_index, total_img_num, "left end")
                    //해당 게시물 left 버튼 비활성화 & 처음 이미지 번호 표시
                    $(img_album).siblings('.left_arrow').css({"display":"none"});
                    p_tag.text(`1 / `+ p_tag.attr('value'));
                }
            });
        });

    });
};
// img slide Event
window.addEventListener('DOMContentLoaded', imgSlide);

import indicate_time from './time_information.js';
// upload time
$(function(){
    let create_time = document.querySelectorAll('.create_time');
    //각 게시물 별 업로드 시간
    create_time.forEach(time => {
        indicate_time(time)
        // time.addEventListener('load', indicate_time);
    });
});

// like list btn
$('html').click(function(e){
    // 더보기 버튼
    let like_container = $(e.target).siblings('.like_container_back');
    if (e.target.className == 'content_like') {
        $(like_container[0]).attr('class','like_container_back');
        console.log(like_container.className)
        document.querySelector(".body").className = "body scroll_hidden";
    }  //close 버튼 혹은 팝업 영역 외 클릭
    if (e.target.className == 'content_icon like_close' || e.target.className == 'like_container_back') {
        e.target.closest('.like_container_back').classList += ' none';
        document.querySelector(".body").className = "body";
        console.log("close modal")
    }
    else { //팝업창 영역
        console.log('modal area')
    };
});

//like btn ajax
$('[id$=like_icon]').click(function(){
    let btn_value = $(this).attr('value');
    let post_id = $(this).attr('post_id');
    let btn = $(this)
    let create_user = $(this).parents('#content').attr('create_user_nickname')

    var request_data = {
        "kind" : "like",
        "flag": btn_value,
        "post_id": post_id,
        "create_user": create_user,
        'session_user': session_user
    }
    // 해당 post의 좋아요 버튼
    let content_like = $(btn).parent().children('.content_like')
    // 해당 post의 좋아요 누른 user 수
    let like_count = Number($(content_like).text().slice(0,1))
    // 클릭한 버튼의 해당 post의 like_container_back를 찾기 위해 parent 및 children을 사용
    let like_div = $(btn).parent().children('.like_container_back').children().children('.like_user_list_container')[0]

    $.ajax({
        type: 'POST',
        url: "/content_reaction_submit",
        data: JSON.stringify(request_data),
        dataType: 'JSON',
        contentType: "application/json",
        success: function(data){
            // session user가 이미 좋아요를 누른 상태
            if (btn_value == "empty") {
                $(btn).attr('value', 'color')
                $(btn).attr('src', '../static/img/empty_like.png')
                like_count -= 1
                $(content_like).text(String(like_count) + '개')

                let chiled = $(like_div).children()
                //해당 div의 모든 자식 요소를 돌며
                for (let i = 0; i < chiled.length; i++) {
                    console.log($(chiled[i]).attr('value'))
                    //입력한 값과 일치하는 속성 값을 가진 자식요소를 찾고
                    if ($(chiled[i]).attr('value') == data['session_user']['nickname']) {
                        // 해당 요소를 지움
                        $(chiled[i]).remove();
                    }
                }
            // session user가 좋아요를 누르지 않은 상태
            }else{ 
                $(btn).attr('value', 'empty')
                $(btn).attr('src', '../static/img/color_like.png')
                like_count += 1
                $(content_like).text(String(like_count) + '개')
                
                // 좋아요 누른 user 리스트에 추가할 user 태그들 생성
                const create_div = document.createElement('div');
                const create_a_img = document.createElement('a');
                const create_a_nickname = document.createElement('a');
                const create_img = document.createElement('img');
                // 좋아요 리스트에 추가할 div 태그
                $(create_div).attr({
                    'class': 'like_user_list',
                    'value': data['session_user']['nickname']
                });
                // 이미지를 감쌀 a 테그
                $(create_a_img).attr({
                    'href': '/user/'+data['session_user']['nickname']
                });
                // 닉네임 태그
                $(create_a_nickname).attr({
                    // 'href': '/user/'+data['session_user']['nickname'],
                    'class': 'like_user_nickname',
                });
                $(create_a_nickname).text(data['session_user']['nickname'])
                // 이미지 테그
                $(create_img).attr({
                    'src': data['session_user']['profile_img'][1],
                    'class': 'content_user_img'
                });
                // 생성한 태그들 구조에 맞게 append
                create_a_img.appendChild(create_img);
                create_div.appendChild(create_a_img);
                create_div.appendChild(create_a_nickname);
                // 좋아요 리스트에 최종적으로 div 태그 append
                like_div.appendChild(create_div);

                //알림 리스트
                if(session_user != create_user){
                    socket.emit('like_post', request_data); 
                }         
            }
        },
        error: function(request, status, error){
            alert('ajax 통신 실패')
            alert(error);
        }
    })
});

import { indicate_comment, indicate_reply } from './create_comment.js';

// comment list btn
$(function(){
    //모든 댓글 영역
    let comment_area = document.querySelectorAll(".content_comment_container");
    //각 게시물의 댓글 영역
    comment_area.forEach(comment => {
        //각 게시물의 댓글 버튼
        let comment_btn = $(comment).siblings(".content_footer").children(".comment").children();
        //toggle 상태
        let change = false;
        //해당 게시물의 comment_btn 클릭 시
        $(comment_btn).click(function(){
            console.log(comment_btn)
            if (change) {
                change = false; 
                console.log("false")
                let chiled = $(this).parent().parent().next().children('.comment_list').children()
                for (let i = 0; i < chiled.length; i++) {
                    // 생성된 댓글 div tag 지움
                    if ($(chiled[i]).attr('class') == 'user_img_nickname' || $(chiled[i]).attr('class') == 'reply_container') {
                        $(chiled[i]).remove();
                    }
                }
            } else {
                change = true;
                console.log("true")
                let post_id = $(this).attr('post_id')
                // 댓글이 나올 div 태그
                let comment_div = $(this).parent().parent().next().children('.comment_list')
                console.log(comment_div)

                let request_data = {
                    'kind' : 'get_comment',
                    'post_id' : post_id
                }
                $.ajax({
                    type: "POST",
                    url: "/content_reaction_submit",
                    data: JSON.stringify(request_data),
                    dataType: 'JSON',
                    contentType: "application/json",
                    success: function(data){
                        // console.log(data['comment_dic'])
                        for (let i in data['comment_dic']){
                            let comment_data = {
                                'comment_id': data['comment_dic'][i]['_id'],
                                'session_user': data['comment_dic'][i]['comment_user'],
                                'time' : data['comment_dic'][i]['comment_time'],
                                'comment': data['comment_dic'][i]['comment'],
                                'reply_list': data['comment_dic'][i]['reply_list']
                            }
                            indicate_comment(comment_data,comment_div)
                        }                        
                    },
                    error: function(request, status, error){
                        // alert('ajax 통신 실패')
                        // alert(error);
                    }
                })       
            };
            //댓글 영역 show/hide toggle
            $(comment).toggleClass('comment_height');
        })

        // 해당 게시글의 댓글 입력란 높이 조절
        let comment_textarea = $(comment).children(".comment_form").children(".comment_textarea");
        //댓글 입력란에서 keyup이 일어날 때 마다 실행
        $(comment_textarea).on('keyup',function(){
            console.log("typing")
            // 높이가 줄어들 경우 height값 초기화
            $(comment_textarea)[0].style.height = 'auto';
        
            // prop, 스크롤 높이 계산
            let textarea_height = $(comment_textarea).prop('scrollHeight');
            // 계산한 높이를 textarea의 css style로 지정
            $(comment_textarea).css('height', textarea_height);
        });
    });
});

// 댓글 전송 ajax
$('.comment_submit').click(function(){
    // 댓글 내용
    let text = $(this).prev().val();
    console.log(text)
    // 해당 버튼이 있는 post의 id 값
    let post_id = $(this).parent().attr('value');
    let btn = $(this)
    let add_comment_list = $(this).parent().siblings(".comment_list")
    let create_user = $(this).parents('#content').attr('create_user_nickname')
    
    // 댓글 수 변경을 위한 변수들
    let content_footer = $(this).parents('.content_comment_container').siblings('.content_footer')
    let content_comment = $(content_footer).find('.content_comment')
    let comment_count = Number($(content_comment).text().slice(0,1))

    var request_data = {
        "kind" : "append_comment",
        "text": text,
        "post_id": post_id,
        "create_user": create_user,
        "session_user": session_user
    }
    $.ajax({
        type: "POST",
        url: "/content_reaction_submit",
        data: JSON.stringify(request_data),
        dataType: 'JSON',
        contentType: "application/json",
        success: function(data){
            indicate_comment(data, add_comment_list)
            //comment textarea reset
            let textarea = $(add_comment_list).siblings('.comment_form').children('.comment_textarea');
            textarea[0].value = '';
            
            comment_count += 1
            $(content_comment).text(String(comment_count) + '개')

            socket.emit('comment_post', request_data);
            if(data['mention'].length > 0){
                for(let i = 0; i < data['mention'].length; i++){
                    console.log(data['mention'][i])
                    var mention_data = {
                        "kind" : "append_reply",
                        "text": text,
                        "post_id": post_id,
                        'create_user': create_user,
                        'session_user': session_user,
                        'mention' : data['mention'][i]
                    }
                    if (create_user != session_user){
                        socket.emit('mention', mention_data);
                    }
                }
            }
        },
        error: function(request, status, error){
            alert('ajax 통신 실패')
            alert(error);
        }
    })
});

// 답글 칸 생성 ajax
$(document).on("click",".reply",function(){
    const value = $(this).attr('value')
    const comment_id = $(this).attr('comment_id')

    const div_tag = $(this).parent().parent().parent().parent()
    // 답글 전체를 감쌀 div tag
    const create_div = document.createElement('div');
    // 답글에 대한 맨션 tag
    // const create_mention = document.createElement('p');

    // 답글을 작성할 textarea tag
    const create_textarea = document.createElement('textarea');
    // 답글을 누를 button
    const create_btn = document.createElement('button');
    // 답글 취소 button
    const create_btn_cancel = document.createElement('button');
    
    //댓글 입력칸 hidden
    $(this).parent().parent().parent().siblings('.comment_form').hide();

    $(create_div).attr({
        'class': 'comment_form reply_form',
        'value': comment_id,
    });
    // $(create_mention).attr({
    //     'class': 'reply_metion',
    // });

    $(create_textarea).attr({
        'class': 'comment_textarea reply_textarea'
    });
    $(create_textarea).text('@'+value+ ' ')

    $(create_btn).text('답글 달기')
    $(create_btn).attr({
        'class': 'comment_submit reply_submit',
        'type' : 'submit'
    });

    $(create_btn_cancel).text('취소')
    $(create_btn_cancel).attr({
        'id': 'reply_cancel_id',
        'class': 'reply_cancel comment_submit',
    });

    // create_div.appendChild(create_mention)
    create_div.appendChild(create_textarea)
    create_div.appendChild(create_btn);
    create_div.appendChild(create_btn_cancel);
    $(div_tag).append(create_div);
});

// import indicate_reply from './create_comment.js';
// 답글을 달았을 때 댓글 정보와 댓글을 단 유저 정보를 답글 목록에 추가하는 함수

//답글 전송 ajax
$(document).on("click",".reply_submit",function(){
    console.log('apply test')
    // 답글 내용
    let text = $(this).prev().val();
    // 해당 버튼이 있는 comment
    let this_comment = $(this).parent()
    console.log(this_comment)
    // 해당 버튼이 있는 comment의 id 값
    let comment_id = this_comment.attr('value');
    let comment_form = $(this).parent().siblings('.comment_form')
    // 해당 답글이 달린 comment가 있는 post id 값
    let post_id = comment_form.attr('value');
    // 답글 전송시 답글 입력 tag 삭제
    let remove_tag = $(this).parent()
    // 해당 post 작성 user
    let create_user = $(this).parents('#content').attr('create_user_nickname')

    let add_comment_list = $(this).parent().siblings(".comment_list")
    let chiled = add_comment_list.children()

    let standard_div = null
    for(let i = 0; i < chiled.length; i++){
        if ($(chiled[i]).attr('comment_id') == comment_id & $(chiled[i]).attr('class') == 'reply_container'){
            standard_div = chiled[i]
        }
    }
    var request_data = {
        "kind" : "append_reply",
        "text": text,
        "post_id": post_id,
        "comment_id": comment_id,
        'create_user': create_user,
        'session_user': session_user
    }

    // 댓글 수 변경을 위한 변수들
    let content_footer = $(this).parents('.content_comment_container').siblings('.content_footer')
    let content_comment = $(content_footer).find('.content_comment')
    let comment_count = Number($(content_comment).text().slice(0,1))

    $.ajax({
        type: "POST",
        url: "/content_reaction_submit",
        data: JSON.stringify(request_data),
        dataType: 'JSON',
        contentType: "application/json",
        success: function(data){
            indicate_reply(data, add_comment_list, standard_div)
            //해당 댓글의 답글 list show
            $(standard_div).attr('style','display:flex;');
            $(remove_tag).remove()
            $(comment_form).show()

            comment_count += 1
            $(content_comment).text(String(comment_count) + '개')

            socket.emit('comment_post', request_data);

            console.log('mention = ',data['mention'])
            if(data['mention'].length > 0){
                for(let i = 0; i < data['mention'].length; i++){
                    console.log(data['mention'][i])
                    var mention_data = {
                        "kind" : "append_reply",
                        "text": text,
                        "post_id": post_id,
                        "comment_id": comment_id,
                        'create_user': create_user,
                        'session_user': session_user,
                        'mention' : data['mention'][i]
                    }
                    socket.emit('mention', mention_data);
                    // console.log(request)
                }
            }
        },
        error: function(request, status, error){
            alert('ajax 통신 실패')
            alert(error);
        }
    })
});

// 답글 취소시 해당 답글 tag 삭제 및 댓글 tag show
$(document).on("click",".reply_cancel",function(){
    $(this).parent().siblings('.comment_form').show()
    $(this).parent().remove()
})
// 답글 보기 시 해당 답글 show
$(document).on("click",".reply_show",function(){
    console.log('reply show')
    $(this).parent().next().attr('style','display:flex;');
})

// 답글 삭제 ajax
$(document).on("click",".delete_reply",function(){
    console.log('delete test')
    const time = $(this).siblings('.user_comment').children('.comment_nickname_time').children('.comment_time').attr('value')
    const nickname = $(this).siblings('.user_comment').children('.comment_nickname_time').children('.comment_nickname').text()
    const comment_id = $(this).parent().parent().attr('comment_id')
    const remove_tag = $(this).parent()

    // 댓글 수 변경을 위한 변수들
    let content_footer = $(this).parents('.content_comment_container').siblings('.content_footer')
    let content_comment = $(content_footer).find('.content_comment')
    let comment_count = Number($(content_comment).text().slice(0,1))

    var request_data = {
        "kind" : "delete_reply",
        "time": time,
        "nickname": nickname,
        "comment_id": comment_id
    }
    $.ajax({
        type: "DELETE",
        url: "/content_reaction_submit",
        data: JSON.stringify(request_data),
        dataType: 'JSON',
        contentType: "application/json",
        success: function(data){
            $(remove_tag).remove()

            comment_count -= 1
            $(content_comment).text(String(comment_count) + '개')
        },
        error: function(request, status, error){
            alert('ajax 통신 실패')
            alert(error);
        }
    })
});

// 댓글 삭제 ajax
$(document).on("click",".delete_comment",function(){
    console.log('delete test')
    const time = $(this).siblings('.user_comment').children('.comment_nickname_time').children('.comment_time').attr('value')
    const nickname = $(this).attr('value')
    const comment_id = $(this).attr('comment_id')
    const remove_tag = $(this).parent()
    const remove_reply_tag = $(this).parent().next()

    // 댓글 수 변경을 위한 변수들
    let content_footer = $(this).parents('.content_comment_container').siblings('.content_footer')
    let content_comment = $(content_footer).find('.content_comment')
    let comment_count = Number($(content_comment).text().slice(0,1))

    var request_data = {
        "kind" : "delete_comment",
        "time": time,
        "nickname": nickname,
        "comment_id": comment_id
    }
    $.ajax({
        type: "DELETE",
        url: "/content_reaction_submit",
        data: JSON.stringify(request_data),
        dataType: 'JSON',
        contentType: "application/json",
        success: function(data){
            $(remove_tag).remove()
            let chiled = remove_reply_tag.children()
             for(let i = 0; i < chiled.length; i++){
                 $(chiled[i]).remove();
                 comment_count -= 1
             }
             comment_count -= 1
            $(content_comment).text(String(comment_count) + '개')
        },
        error: function(request, status, error){
            alert('ajax 통신 실패')
            alert(error);
        }
    })
});

