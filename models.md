# aws -ec2 주소 : 15.164.96.105

# 모델 스키마

## user
	- user_id : 로그인 ID
    - password : 로그인 PW
    - nickname : 사용자 닉네임
	- user_name : 사용자 이름
	- friend_list : 사용자 친구 목록
    - profile_img : 사용자 프로필 이미지
    - background_img : 사용자 백그라운드 이미지
    - bio : 소개글
    - like : 좋아요 누른 post의 id 리스트
    - commemt
        - comment_id : comment id
        - kind : 댓글인지 답글인지 구분
        - time : 작성시간

## request_friend
	- user_id : 요청을 보낸 사용자 ID
	- request_user : 요청을 받는 사용자 ID
	
## post
    - create_user : 작성한 사용자 ID
    - create_user_nickname : 작성한 사용자 nickname
    - create_user_profile : 작성한 사용자 profile  
    - create_time : 작성 시간(24시간 전까지는 ~시간 전, 지난 후에는 일자 표시)
	- text : text data
    - split_text : 개행문자 \n 처리 및 split한 text list
	- images : 이미지 리스트
    - hash_tag : 해시 태그 리스트
    - like : 좋아요 누른 user 딕셔너리 리스트
    - comment : 댓글 개수
    - modified : 수정 여부(True, False)

## comment
    - post_id : 기준 post 
    - comment_user : 댓글을 단 사용자 
    - comment_time : 작성 시간(24시간 전까지는 ~시간 전, 지난 후에는 일자 표시)
    - comment : 댓글
    - reply_list : 답글 리스트
        - reply_user : 답글을 단 사용자 ID
        - reply_time : 작성 시간(24시간 전까지는 ~시간 전, 지난 후에는 일자 표시)
        - reply : 답글

## deleteFile
    - file_route : s3의 파일 경로
    - file_name : 삭제할 이미지 파일 명

## notice
    - notice_user : 알림을 받을 user
    - notice_info : 알림에 해당하는 img 정보 및 nickname 정보 딕셔너리
                        1. notice_img_kind -> user profile인지, post img 인지, post text 인지
                        2. notice_img_data -> 해당 이미지 및 text 데이터
                        3. nickname      -> 알림에 해당하는 행위를 한 user의 nickname
    - kind : 어떤 알림인지에 대한 구분 (친구 요청, post(좋아요, 댓글, 태그))
    - time : 해당 행위를 한 시간
    - check : 해당 알림을 확인 했는지에 대한 구분
    - post_info : post 관련 알림 일시 해당 post 정보와 해당 post의 댓글 리스트(comment_info), 친구 요청의 경우 None 값

# session 정보
    session['login'] : id(로그인 id)
    session['nickname'] = nickname
    session['name'] = name
    session['profile_img'] = 프로필 사진
    session['like'] = user가 좋아요 누른 post id 리스트 
    session['notice] = 해당 user의 알림 list

