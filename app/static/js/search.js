// id만 전송 받음
const session_user = $('#search').data().name;
const search_result_list = $('#search').data().search_user;
const user_friend_list = $('#search').data().friend_list; 
const request_friend_list = $('#search').data().session_request_list;
// const user = $('#friend_button_area').data().user;
console.log(search_result_list)
const test_list = [1,3,5,6,7]
let test = 4
if (test_list.includes(test)){
    console.log('in test')
}
function create_btn(){
    for (let user_l in search_result_list){
        user = search_result_list[user_l]
        // const user = $('#friend_button_area').data().user
        console.log('user, user_l =',user, user_l)
        const create_div = document.createElement('div');
        $(create_div).attr({
            'class': 'button_area',
            'id': '_button_area!'+user
        });
        // const di = document.getElementById('friend_button_area_"+user"')
        if (user == session_user){
            console.log(1)
            const newText = document.createElement('button');
            $(newText).attr({
                    "type": "button", 
                    "class": "friend_button none",
                });
            create_div.appendChild(newText);
            let c_url = 'friend_button_area_'+user
            document.getElementById(c_url).appendChild(create_div);
        } else if (user_friend_list.includes(user)){
            console.log(2)
            const newText = document.createElement('button');
            // button 속성 추가
            // 현재 친구인 상태
            // $(newText).attr({
                //   "type": "button", 
                //   "id": "delete_btn",
                //   "class": "",
                //   "value": "친구 삭제"
                // });
            // $(newText).text('친구');

            // a 태그 속성 추가
            // a 태그에 button 노드 추가
            // create_div.appendChild(newText);
                // id값으로 가져온 위치에 a태그 추가
            let c_url = 'friend_button_area_'+user
            document.getElementById(c_url).appendChild(create_div);
        } else {
            console.log(3)
            if (request_friend_list[''].includes(user)){
                const newText = document.createElement('button');
                // 친구 요청을 보낸 상태
                $(newText).attr({
                      "type": "button", 
                      "id": "reject_btn",
                      "class": "request_btn",
                      "value": "요청 취소"
                    });
                $(newText).text('요청 취소');

                create_div.appendChild(newText);
                let c_url = 'friend_button_area_'+user
                document.getElementById(c_url).appendChild(create_div);
            } else {
                const newText = document.createElement('button');
                // 친구 요청을 보낸적 없는 상태
                $(newText).attr({
                      "type": "button",
                      "id": "accept_btn",
                      "class": "request_btn",
                      "value": "친구 요청"
                    });
                $(newText).text('친구 요청');
                
                create_div.appendChild(newText);
                let c_url = 'friend_button_area_'+user
                document.getElementById(c_url).appendChild(create_div);
            }
        }
    }
}

window.onload = create_btn();

$('[id^=_button_area]').click(function(){
    let user = session_user
    var id = $(this).attr("id");
    console.log(id)
    var val = document.getElementById(id).firstChild.value;
    console.log(val)
    var btn = document.getElementById(id).firstChild
    console.log(btn)

    var postdata = {
        'user': user, 'id':id, 'val':val,
    }
    console.log(postdata, typeof(postdata))
    $.ajax({
        type: 'POST',
        url: "request_friend",
        data: JSON.stringify(postdata),
        dataType : 'JSON',
        contentType: "application/json",
        success: function(data){
            // alert('성공! 데이터 값:' + data.result2['user']+' '+data.result2['id']+" " + data.result2['val'])
            if (val =='친구 요청') {
                val = '요청 취소'
                $(btn).text('요청 취소');
                $(btn).attr('id', 'reject_btn')

                var socket = io.connect('http://' + document.domain + ':' + location.port+'/');
                socket.emit('friend_request', postdata);

            } else if (val == '요청 취소') {
                val = '친구 요청'
                $(btn).text('친구 요청');
                $(btn).attr('id', 'accept_btn')

            } else {
                alert('정말 삭제하겠습니까?')
                val = '친구 요청'
                $(btn).text('친구 요청');
                $(btn).attr('id', 'accept_btn')

            }
            document.getElementById(id).firstChild.value = val
        },
        error: function(request, status, error){
            alert('ajax 통신 실패')
            alert(error);
        }
    })
})

// console.log(typeof(request_friend_list))