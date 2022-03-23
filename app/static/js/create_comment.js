import indicate_time from './time_information.js';
// 댓글을 달았을 때 댓글 정보와 댓글을 단 유저 정보를 댓글 목록에 추가하는 함수
function indicate_comment(data, comment_div, notice = false){
    if (!notice){ 
        // 댓글 전체를 감쌀 div tag
        const create_div = document.createElement('div');
        // 이미지를 감쌀 a tag
        const create_a_img = document.createElement('a');
        // user profile img tag
        const create_img = document.createElement('img');
        // comment div tag
        const create_div_user_comment = document.createElement('div');
        // comment nickname time div tag
        const create_div_comment_nickname_time = document.createElement('div');
        // nickname a tag
        const create_a_nickname = document.createElement('a');
        // 시간 나타날 p tag
        const create_p_time = document.createElement('p');
        // 댓글 내용이 담길 div tag
        const create_div_comment_txt = document.createElement('div');
        // 답글 달기 button
        const create_btn = document.createElement('button');
        // 답글 보기 button
        const create_btn_reply = document.createElement('button');
        // 답글이 들어갈 div tag
        const create_div_reply = document.createElement('div');

        // 답글 user div 태그
        $(create_div).attr({
            'class': 'user_img_nickname',
            'value': data['session_user']['nickname'],
            'comment_id': data['comment_id']
        });
        // 이미지를 감쌀 a 테그
        $(create_a_img).attr({
            'href': '/user/'+ data['session_user']['nickname']
        });
        // 해당 user의 profile img tag
        $(create_img).attr({
            'src': data['session_user']['profile_img'][1],
            'class': 'comment_user_img'
        });
        // user_comment div tag
        $(create_div_user_comment).attr({
            'class': 'user_comment',
        });
        // user_comment div tag
        $(create_div_comment_nickname_time).attr({
            'class': 'comment_nickname_time',
        });
        // 닉네임 태그
        $(create_a_nickname).attr({
            'href': '/user/'+ data['session_user']['nickname'],
            'class': 'comment_nickname',
        });
        $(create_a_nickname).text(data['session_user']['nickname'])
        // time p tag
        $(create_p_time).attr({
            'class': 'comment_time',
            'value': data['time']
        });
        indicate_time(create_p_time)

        // comment div tag
        $(create_div_comment_txt).attr({
            'class': 'comment_txt',
        });
        for (let i in data['comment']){
            let comment_text = null
            if (data['comment'][i].includes('@')){
                comment_text = document.createElement('a');
                $(comment_text).attr({
                    'href': "/user/" + data['comment'][i].slice(1),
                    'class': 'comment_nickname',
                    'id' : 'mention'
                });
                $(comment_text).text(data['comment'][i])
            }
            else {
                comment_text = document.createElement('span');
                $(comment_text).text(data['comment'][i])
            }
            create_div_comment_txt.appendChild(comment_text)
        }
        //답글 button
        $(create_btn).text('답글 달기')
        $(create_btn).attr({
            'class': 'recomment reply',
            'value': data['session_user']['nickname'],
            'comment_id' : data['comment_id']
        });
        $(create_btn_reply).text('답글 보기')
        $(create_btn_reply).attr({
            'class': 'recomment reply_show',
            // 'value': data['session_user']['nickname'],
            // 'comment_id' : data['comment_id']
        });
        //
        $(create_div_reply).attr({
            'class': 'reply_container',
            'comment_id': data['comment_id']
        });


        // 생성한 태그들 구조에 맞게 append
        create_div_comment_nickname_time.appendChild(create_a_nickname);
        create_div_comment_nickname_time.appendChild(create_p_time);
        create_div_user_comment.appendChild(create_div_comment_nickname_time);
        create_div_user_comment.appendChild(create_div_comment_txt);
        create_div_user_comment.appendChild(create_btn);
        create_a_img.appendChild(create_img)
        create_div.appendChild(create_a_img);
        create_div.appendChild(create_div_user_comment);
        // 좋아요 리스트에 최종적으로 div 태그 append
        if (typeof data['reply_list'] != "undefined") {
            create_div.appendChild(create_btn_reply);
        }

        // session user와 댓글 작성한 user가 같을 시 삭제 버튼 추가 
        if (data['session_user']['nickname'] == $(comment_div).attr('session_user')){
            // 댓글 삭제 button
            const create_btn_delete = document.createElement('button');

            $(create_btn_delete).attr({
                'class': 'recomment delete_comment',
                'value': data['session_user']['nickname'],
                'comment_id' : data['comment_id']
            });
            $(create_btn_delete).text('댓글 삭제')
            create_div.appendChild(create_btn_delete);
        }

        $(comment_div).prepend(create_div_reply);
        console.log(comment_div)
        console.log(data['reply_list'])
        for (let i in data['reply_list']){
            let reply_data = {
                'comment_id': data['comment_dic'],
                'session_user': data['reply_list'][i]['reply_user'],
                'time' : data['reply_list'][i]['reply_time'],
                'reply': data['reply_list'][i]['reply'],
            }
            indicate_reply(reply_data,comment_div, create_div_reply)
        }
        $(comment_div).prepend(create_div);
    } else {
        // 댓글 전체를 감쌀 div tag
        const create_div = document.createElement('div');
        // 댓글 전체를 감쌀 header div tag
        const create_div_comment_header = document.createElement('div');
        // 이미지를 감쌀 a tag
        const create_a_img = document.createElement('a');
        // user profile img tag
        const create_img = document.createElement('img');
        // notice user comment div tag
        const create_div_notice_user_comment = document.createElement('div');
        // comment div tag
        const create_div_user_comment = document.createElement('div');
        // comment nickname time div tag
        const create_div_comment_nickname_time = document.createElement('div');
        // nickname a tag
        const create_p_nickname = document.createElement('p');
        // 시간 나타날 p tag
        const create_p_time = document.createElement('p');
        // 답글 달기 button
        const create_btn = document.createElement('button');
        // 댓글 내용이 담길 div tag
        const create_div_comment_txt = document.createElement('div');
        // 답글 보기 button
        const create_btn_reply = document.createElement('button');
        // 답글이 들어갈 div tag
        const create_div_reply = document.createElement('div');
        
        // 답글 user div 태그
        $(create_div).attr({
            'class': 'post_notice_comment'
        });
        // 답글 user div 태그
        $(create_div_comment_header).attr({
            'id' : 'post_notice_comment_header',
            'class': 'user_img_nickname',
            'value': data['session_user']['nickname'],
            'comment_id': data['comment_id']
        });
        // 이미지를 감쌀 a 테그
        $(create_a_img).attr({
            'href': '/user/'+ data['session_user']['nickname'],
            'class' : 'notice_a'
        });
        // 해당 user의 profile img tag
        $(create_img).attr({
            'src': data['session_user']['profile_img'][1],
            'class': 'comment_user_img'
        });
        // notice_user_comment div tag
        $(create_div_notice_user_comment).attr({
            'class': 'user_comment',
        });
        // user_comment div tag
        $(create_div_user_comment).attr({
            'class': 'user_comment',
        });
        // user_comment div tag
        $(create_div_comment_nickname_time).attr({
            'class': 'comment_nickname_time',
        });
        // 닉네임 태그
        $(create_p_nickname).attr({
            'class': 'comment_nickname',
        });
        $(create_p_nickname).text(data['session_user']['nickname'])
        // time p tag
        $(create_p_time).attr({
            'class': 'comment_time',
            'value': data['time']
        });
        indicate_time(create_p_time)

        //답글 button
        $(create_btn).text('답글 달기')
        $(create_btn).attr({
            'class': 'notice_recomment notice_reply',
            'value': data['session_user']['nickname'],
            'comment_id' : data['comment_id']
        });
        // comment div tag
        $(create_div_comment_txt).attr({
            'class': 'comment_txt',
        });
        for (let i in data['comment']){
            let comment_text = null
            if (data['comment'][i].includes('@')){
                comment_text = document.createElement('a');
                $(comment_text).attr({
                    'href': "/user/" + data['comment'][i].slice(1),
                    'class': 'comment_nickname',
                    'id' : 'mention'
                });
                $(comment_text).text( data['comment'][i] + ' ')
            }
            else {
                comment_text = document.createElement('span');
                $(comment_text).text( data['comment'][i] + ' ' )
            }
            create_div_comment_txt.appendChild(comment_text)
        }
        
        $(create_btn_reply).text('답글 보기')
        $(create_btn_reply).attr({
            'class': 'notice_recomment notice_reply_show',
        });
        $(create_div_reply).attr({
            'class': 'reply_container',
            'comment_id': data['comment_id']
        });
    
    
        // 생성한 태그들 구조에 맞게 append
        create_div_comment_nickname_time.appendChild(create_p_nickname);
        create_div_comment_nickname_time.appendChild(create_p_time);
        create_div_comment_nickname_time.appendChild(create_btn);
        create_div_user_comment.appendChild(create_div_comment_nickname_time);
        create_div_user_comment.appendChild(create_div_comment_txt);
        create_div_notice_user_comment.appendChild(create_div_user_comment);
        create_a_img.appendChild(create_img)
        create_div_comment_header.appendChild(create_a_img);
        create_div_comment_header.appendChild(create_div_user_comment);
        create_div.appendChild(create_div_comment_header);
        // 좋아요 리스트에 최종적으로 div 태그 append
        console.log(data['reply_list'])
        // if (data['reply_list'].length > 0) {
        //     create_div_notice_user_comment.appendChild(create_btn_reply);
        // }
    
        // session user와 댓글 작성한 user가 같을 시 삭제 버튼 추가 
        if (data['session_user']['nickname'] == $(comment_div).attr('session_user')){
            // 댓글 삭제 button
            const create_btn_delete = document.createElement('button');
        
            $(create_btn_delete).attr({
                'class': 'notice_recomment notice_delete_comment',
                'value': data['session_user']['nickname'],
                'comment_id' : data['comment_id']
            });
            $(create_btn_delete).text('댓글 삭제')
            create_div_comment_nickname_time.appendChild(create_btn_delete);
        }
    
        // $(comment_div).prepend(create_div_reply);
        // console.log(comment_div)
        // console.log(data['reply_list'])
        // for (let i in data['reply_list']){
        //     let reply_data = {
        //         'comment_id': data['comment_dic'],
        //         'session_user': data['reply_list'][i]['reply_user'],
        //         'time' : data['reply_list'][i]['reply_time'],
        //         'reply': data['reply_list'][i]['reply'],
        //     }
        //     indicate_reply(reply_data,comment_div, create_div_reply)
        // }
        $(comment_div).prepend(create_div);
    }
}

function indicate_reply(data, comment_div, standard_div, notice = false){
    if (notice) { 
        // 답글 전체를 감쌀 div tag
        const create_div = document.createElement('div');
        // user profile img tag
        const create_img = document.createElement('img');
        // comment div tag
        const create_div_user_comment = document.createElement('div');
        // comment nickname time div tag
        const create_div_comment_nickname_time = document.createElement('div');
        // nickname a tag
        const create_p_nickname = document.createElement('p');
        // 시간 나타날 p tag
        const create_p_time = document.createElement('p');
        // "유저가 남긴 댓글"을 담을 p tag
        const create_p_comment_txt = document.createElement('p');
        // 답글 내용이 담길 div tag
        const create_div_comment_txt = document.createElement('div');

        // 좋아요 리스트에 추가할 div 태그
        $(create_div).attr({
            'class': 'reply_item',
            'value': data['session_user']['nickname']
        });
        // 해당 user의 profile img tag
        $(create_img).attr({
            'src': data['session_user']['profile_img'][1],
            'class': 'comment_user_img'
        });
        // user_comment div tag
        $(create_div_user_comment).attr({
            'class': 'user_comment',
        });
        // user_comment div tag
        $(create_div_comment_nickname_time).attr({
            'class': 'comment_nickname_time',
        });
        // 닉네임 태그
        $(create_p_nickname).attr({
            'class': 'comment_nickname'
        });
        $(create_p_nickname).text(data['session_user']['nickname'])
        // time p tag
        $(create_p_time).attr({
            'class': 'comment_time',
            'value': data['time']
        });
        indicate_time(create_p_time)

        // "유저가 남긴 댓글" p 태그
        $(create_p_comment_txt).attr({
            'class': 'comment_txt'
        });
        $(create_p_comment_txt).text("유저가 남긴 댓글")

        // comment div tag
        $(create_div_comment_txt).attr({
            'class': 'comment_txt',
        });
        for (let i in data['reply']){
            let comment_text = null
            if (data['reply'][i].includes('@')){
                comment_text = document.createElement('a');
                $(comment_text).attr({
                    'href': "/user/" + data['reply'][i].slice(1),
                    'class': 'notice_a',
                    'id' : 'mention'
                });
                $(comment_text).text(data['reply'][i])
            }
            else {
                comment_text = document.createElement('span');
                $(comment_text).text(data['reply'][i])
            }
            create_div_comment_txt.appendChild(comment_text)
        }
        //

        // 생성한 태그들 구조에 맞게 append
        create_div_comment_nickname_time.appendChild(create_p_nickname);
        create_div_comment_nickname_time.appendChild(create_p_time);
        create_div_user_comment.appendChild(create_div_comment_nickname_time);
        create_div_user_comment.appendChild(create_p_comment_txt);
        create_div_user_comment.appendChild(create_div_comment_txt);
        create_div.appendChild(create_img)
        create_div.appendChild(create_div_user_comment);
        // 좋아요 리스트에 최종적으로 div 태그 append
        // create_div.appendChild(create_btn);
        
        // session user와 댓글 작성한 user가 같을 시 삭제 버튼 추가 
        if (data['session_user']['nickname'] == $(comment_div).attr('session_user')){
            // 댓글 삭제 button
            const create_btn_delete = document.createElement('button');

            $(create_btn_delete).attr({
                'class': 'recomment delete_reply',
                'value': data['session_user']['nickname'],
                'comment_id' : data['comment_id']
            });
            $(create_btn_delete).text('답글 삭제')
            create_div_comment_nickname_time.appendChild(create_btn_delete);
        }

        // $(standard_div).prepend(create_div);
        $(standard_div).append(create_div);
    } else {
        // 답글 전체를 감쌀 div tag
        const create_div = document.createElement('div');
        // 이미지를 감쌀 a tag
        const create_a_img = document.createElement('a');
        // user profile img tag
        const create_img = document.createElement('img');
        // comment div tag
        const create_div_user_comment = document.createElement('div');
        // comment nickname time div tag
        const create_div_comment_nickname_time = document.createElement('div');
        // nickname a tag
        const create_a_nickname = document.createElement('a');
        // 시간 나타날 p tag
        const create_p_time = document.createElement('p');
        // 답글 내용이 담길 div tag
        const create_div_comment_txt = document.createElement('div');

        // 좋아요 리스트에 추가할 div 태그
        $(create_div).attr({
            'class': 'reply_item',
            'value': data['session_user']['nickname']
        });
        // 이미지를 감쌀 a 테그
        $(create_a_img).attr({
            'href': '/user/'+ data['session_user']['nickname']
        });
        // 해당 user의 profile img tag
        $(create_img).attr({
            'src': data['session_user']['profile_img'][1],
            'class': 'comment_user_img'
        });
        // user_comment div tag
        $(create_div_user_comment).attr({
            'class': 'user_comment',
        });
        // user_comment div tag
        $(create_div_comment_nickname_time).attr({
            'class': 'comment_nickname_time',
        });
        // 닉네임 태그
        $(create_a_nickname).attr({
            'href': '/user/'+ data['session_user']['nickname'],
            'class': 'comment_nickname',
        });
        $(create_a_nickname).text(data['session_user']['nickname'])
        // time p tag
        $(create_p_time).attr({
            'class': 'comment_time',
            'value': data['time']
        });
        indicate_time(create_p_time)

        // comment div tag
        $(create_div_comment_txt).attr({
            'class': 'comment_txt',
        });
        for (let i in data['reply']){
            let comment_text = null
            if (data['reply'][i].includes('@')){
                comment_text = document.createElement('a');
                $(comment_text).attr({
                    'href': "/user/" + data['reply'][i].slice(1),
                    'class': 'comment_nickname',
                    'id' : 'mention'
                });
                $(comment_text).text(data['reply'][i])
            }
            else {
                comment_text = document.createElement('span');
                $(comment_text).text(data['reply'][i])
            }
            create_div_comment_txt.appendChild(comment_text)
        }
        //

        // 생성한 태그들 구조에 맞게 append
        create_div_comment_nickname_time.appendChild(create_a_nickname);
        create_div_comment_nickname_time.appendChild(create_p_time);
        create_div_user_comment.appendChild(create_div_comment_nickname_time);
        create_div_user_comment.appendChild(create_div_comment_txt);
        create_a_img.appendChild(create_img)
        create_div.appendChild(create_a_img);
        create_div.appendChild(create_div_user_comment);
        // 좋아요 리스트에 최종적으로 div 태그 append
        // create_div.appendChild(create_btn);
        
        // session user와 댓글 작성한 user가 같을 시 삭제 버튼 추가 
        if (data['session_user']['nickname'] == $(comment_div).attr('session_user')){
            // 댓글 삭제 button
            const create_btn_delete = document.createElement('button');

            $(create_btn_delete).attr({
                'class': 'recomment delete_reply',
                'value': data['session_user']['nickname'],
                'comment_id' : data['comment_id']
            });
            $(create_btn_delete).text('답글 삭제')
            create_div.appendChild(create_btn_delete);
        }

        // $(standard_div).prepend(create_div);
        $(standard_div).append(create_div);
    }
}

export {indicate_comment, indicate_reply}