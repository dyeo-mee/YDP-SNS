# from crypt import methods
from enum import Flag
import profile
from time import strftime
from unittest import result
from flask import request, render_template, jsonify, redirect, url_for, session, flash, g
from flask_bcrypt import Bcrypt
from bson.json_util import dumps
from bson.objectid import ObjectId
import json
from . import app, conn
import gridfs
import codecs
from flask_mail import Mail, Message
import random
from .functuion import *
import datetime as dt
import pymongo
from pytz import timezone
from pymongo import ReturnDocument

db = conn.get_database('root')
bcrypt = Bcrypt()
# fs = gridfs.GridFS(db)
email = Mail(app)
@app.route("/login", methods=['GET',"POST"])
def login():
    col = db.get_collection('user')
    if request.method == 'POST':
        user_id = request.form.get('user_id')
        pw =  request.form.get('password')
        find_user = col.find_one({'user_id':user_id})
        if bcrypt.check_password_hash(find_user['password'], pw):
            session['login'] =  user_id
            session['nickname'] = find_user['nickname']
            session['name'] = find_user['user_name']
            session['profile_img'] = find_user['profile_img'][1]
            session['like'] = find_user['like']
            return redirect(url_for('index'))
        else:
            flash("아이디 혹은 비밀번호가 틀렸습니다.")
            return redirect(url_for('login'))
            # return render_template('login.html')
    else:
        return render_template('login.html')

@app.route('/join', methods=['GET',"POST"])
def join():
    col = db.get_collection('user')
    id_list = [user['user_id'] for user in col.find()]
    nickname_list = [user['nickname'] for user in col.find()]
    nickname_dict = {'list': nickname_list}
    json_lis = json.dumps(nickname_dict)

    email_list = [user['user_email'] for user in col.find()]

    if request.method == "POST":
        email = request.form.get('user_email')
        if email in email_list:
            flash('이미 존재하는 이메일입니다.')
            return redirect(url_for('join'))
        user_id = request.form.get('user_id')
        if user_id in id_list:
            flash('이미 존재하는 아이디입니다.')
            return redirect(url_for('join'))
        nickname = request.form.get('nickname')
        if nickname in nickname_list:
            flash('이미 존재하는 닉네임입니다.')
            return redirect(url_for('join'))
        
        pw = bcrypt.generate_password_hash(request.form.get('password'))
        pw2 = request.form.get('password2')
        if bcrypt.check_password_hash(pw, pw2):
            _default = col.find_one({'user_id':'default'})
            user_name = request.form.get('user_name')
            col.insert_one(
                { 'user_id': user_id,
                'password': pw,
                'nickname': nickname,
                'user_name': user_name,
                'friend_list': [],
                'profile_img': _default['profile_img'],
                'background_img': _default['background_img'],
                'bio': None,
                'user_email': email,
                'like': [],
                'commemt': []
                })
            return render_template('join_success.html')
        else:
            flash('비밀번호를 확인해 주세요.')   
        # print(bcrypt.check_password_hash(pw, pw2))
        return redirect(url_for('join'))
        # return redirect('join.html')
    else:
        return render_template('join.html', email_list=email_list, nickname_list=json_lis, id_list=id_list)

@app.route("/password_reset", methods=["GET", "POST"])
def password_reset():
    
    if request.get_json():
        data = request.get_json()
        input_num = data['input_num']
        ran_num = session['certification_num']

        return jsonify(result = 'success')

    else:
        return render_template('password_reset.html')
        

# 이메일 인증번호 발송
@app.route('/send_email', methods=["POST"])
def send_email():
    data = request.get_json()
    send_email = data['send_email'] # 사용자가 입력한 email 주소

    number = "0123456789"
    ran_num = ""  #인증번호 6자리

    for i in range(6):
        ran_num += random.choice(number)

    msg = Message(
        "YDP-SNS 비밀번호 변경 인증번호", #메일 제목
        body = "인증번호 6자리 [ " + ran_num + " ] 를 입력 후 인증해주세요.", #메일 내용
        sender = "ydpsns.project@gmail.com", #발송인
        recipients = [send_email] #수신인
    )
    email.send(msg)

    session['certification_num'] = ran_num
    session['send_email'] = send_email

    # print(session['certification_num'])

    # return redirect(url_for('password_reset'))
    return jsonify(result = 'success', ran_num=ran_num)

@app.route("/join_success")
def join_success():
    return render_template('join_success.html')

# 처음 접속 시 session 정보 확인 후 session 정보가 없다면 login 페이지로 이동
@app.before_first_request
def session_confirm():
    if request.path != "/login" or session.get('login') is None:
        return redirect(url_for('login'))

# 매 페이지 render 이전에 sessoin user의 notice 정보 update
@app.before_request
def base_notice():
    # session_check()
    if request.path != "/login" and session.get('login'):
        col_notice = db.get_collection('notice')
        notices = list(col_notice.find(
            {'$or': [{'notice_user':session['login']}, {'notice_user':session['nickname']}]}
            ).sort("time", pymongo.DESCENDING))

        if len(notices) > 10:
            col_notice.delete_one({'_id':notices[-1]['_id']})

        for i in range(len(notices)):
            notices[i]['_id'] = str(notices[i]['_id'])
        session['notice'] = notices

        session['notice_check'] = True
        for notice in notices:
            if notice['check'] == False:
                session['notice_check'] = False
    # elif request.path == "/login" and session.get('login') is None:
    #     print('login page')
    # elif session.get('login') is None:
    #     return redirect(url_for('login'))

@app.route('/notice', methods=['POST'])
def notice_check():
    col_notice = db.get_collection('notice')
    # data = request.get_json()
    session['notice_check'] = True
    for notics in session['notice']:
        col_notice.update_one({'_id':ObjectId(notics['_id'])}, {'$set': {'check':True}})
    return jsonify(result = "success")


@app.route("/", methods=['GET',"POST"])
def index():
    col_post = db.get_collection('post')

    if session.get('login') is None:
        return redirect(url_for('login'))
        
    if request.form.get('search_btn') == 'topbar_search':
        # input의 name으로 값을 가져옴
        search = request.form.get('search')
        return redirect(url_for('search', search = search))
    
    session_friend_list = get_friend_list(session['login'])
    # 친구 정보 딕셔너리 
    friend_dic = get_friend_dic(session_friend_list)

    post_dic = []
    # 자신의 게시물 목록 추가
    for post in col_post.find({'create_user': session['login']}):
        post['_id'] = str(post['_id'])
        post_dic.append(post)

    # 친구의 게시물 목록 추가
    for friend in session_friend_list:
        # 해당 친구의 post 정보들
        firend_post = col_post.find({'create_user': friend})
        for post in firend_post:
            post['_id'] = str(post['_id'])
            post_dic.append(post)
    
    post_dic = sorted(post_dic, key = lambda t: t['create_time'], reverse=True)
    return render_template('index.html', friend_dic = friend_dic, post_dic=post_dic)

@app.route("/search", methods=['GET',"POST"])
def search():
    email = session['login']
    col_request_friend = db.get_collection('request_friend')
    request_list = col_request_friend.find()
    col_user = db.get_collection('user')
    col_post = db.get_collection('post')
    # if request.method == "POST":
    # if request.form.get('search_btn') == 'topbar_search':
    #     search = request.form.get('search')
    #     return redirect(url_for('search', search = search))
    
    search = request.args.get('search')
    query = { '$or' : 
        [ {'name': { '$regex' :  search, '$options': '$i'}},\
            {'nickname' :  { '$regex' : search, '$options': '$i'}}
        ]
    }
    search_user = list(col_user.find(query))
    # print('----------------', search_user)
    #js 연동을 위한 search user의 nickname, id 딕셔너리
    search_user_id = {}
    for user in search_user:
        search_user_id[user['nickname']] = user['user_id']

    search_user_id = json.dumps(search_user_id, ensure_ascii = False)

    # 검색한 user 목록 dictionary
    search_user_dic = get_friend_dic([user['user_id'] for user in search_user])

    #세션 유저의 친구 목록
    session_friend_list =  get_friend_list(session['login'])

    #세션 유저가 요청한 user 목록
    session_request_list = {}
    session_request_list[''] = [user['request_user'] for user in col_request_friend.find({'user_id': session['login']})]
    session_request_list = json.dumps(session_request_list, ensure_ascii = False)

    # search_post = col_post.find({'hashtag': {'$all': [search]}})
    # search_post = list(col_post.find({'hashtag': search}))
    print(search[1:])
    search_post = []
    # for post in col_post.find({'hashtag': { '$all': [search[1:]]}}):
    for post in col_post.find({'hashtag':[search[1:]]}):
        post['_id'] = str(post['_id'])
        search_post.append(post)

    return render_template('search.html', search = search, search_user_dic=search_user_dic, search_user_id=search_user_id,\
                 session_friend_list=session_friend_list, session_request_list=session_request_list, post_dic = search_post)

# 팝업창 txt와 img를 DB로 전송
@app.route("/content_submit", methods=["POST"])
def content_submit():
    col_post = db.get_collection('post')
    content_txt = request.form.get('content_txt')
    content_file = request.files.getlist("content_file[]")    

    time = dt.datetime.now(timezone('Asia/Seoul')).strftime("%Y-%m-%d-%H-%M-%S")

    img_list = []
    if len(content_file) > 0:
        for img in content_file:
            filename = img.filename.split('.')[0]
            ext = img.filename.split('.')[-1]
            nickname = session['nickname']
            img_name = dt.datetime.now(timezone('Asia/Seoul')).strftime(f"{nickname}-{filename}-%Y-%m-%d-%H-%M-%S.{ext}")
            s3_put_object(s3,'ydpsns',img,img_name,'postimages')
            img_list.append(s3_get_image_url(s3, img_name, 'postimages')) 

    tmp = content_txt.splitlines(True)
    text = []
    for t in tmp:
        text.extend(t.split(' '))
        if '\n' in text[-1]:
            text[-1] = text[-1][:-1]
            text.append('\n')

    hash_tag = [h[1:] for h in text if len(h) and h[0] == '#']

    for i in range(len(text)):
        if text[i][-1] == '\r':
            text[i] = text[i][:-1]

    for i in range(len(hash_tag)):
        if hash_tag[i][-1] == '\r':
            hash_tag[i] = hash_tag[i][:-1]

    col_post.insert_one(
        {'create_user': session['login'],
        'create_user_nickname': session['nickname'],
        'create_user_profile' : session['profile_img'],
        'create_time': time,
        'text': content_txt,
        'split_text' : text,
        'images': img_list,
        'hashtag' : hash_tag,
        'like' : [],
        'comment' : 0
    })
    flash("게시물이 업로드 되었습니다.")
    
    return redirect(url_for('user', user=session['nickname']))

@app.route("/content_submit/<post_id>", methods=["POST"])
def content_update_submit(post_id):
    col_post = db.get_collection('post')
    content_txt = request.form.get('update_textarea') 

    tmp = content_txt.splitlines(True)
    text = []
    for t in tmp:
        text.extend(t.split(' '))
        if '\n' in text[-1]:
            text[-1] = text[-1][:-1]
            text.append('\n')
    hash_tag = [h[1:] for h in text if len(h) and h[0] == '#']

    for i in range(len(text)):
        if text[i][-1] == '\r':
            text[i] = text[i][:-1]

    for i in range(len(hash_tag)):
        if hash_tag[i][-1] == '\r':
            hash_tag[i] = hash_tag[i][:-1]
        
    col_post.update_one(
        {'_id': ObjectId(post_id)},
        {'$set' :
            {'modified' : True,
            'text': content_txt,
            'split_text' : text,
            'hashtag' : hash_tag}
        }
    )
    flash("게시물이 수정 되었습니다.")
    
    return redirect(url_for('user', user=session['nickname']))

@app.route("/content_submit", methods=["DELETE"])
def delete_post():
    col_notice = db.get_collection('notice')
    data = request.get_json()

    delete_post_one(data)
    col_notice.delete_many({'post_info._id':data})
    return jsonify(result = "success")

# 좋아요, 댓글 및 답글 관리(C.R.U.D) Route
@app.route("/content_reaction_submit", methods=["POST"])
def like_submit():
    col_user = db.get_collection('user')
    col_post = db.get_collection('post')
    col_comment = db.get_collection('comment')
    col_notice = db.get_collection('notice')
    time = dt.datetime.now(timezone('Asia/Seoul')).strftime("%Y-%m-%d-%H-%M-%S")
    data = request.get_json()
    # like 버튼을 눌렀을 때에 대한 ajax 통신
    if data['kind'] == 'like':
        # 세션 유저 정보 document에서 nickname, profile_img, like 정보만 가져온 변수
        session_user = col_user.find_one({'user_id':session['login']},{'_id':0, 'nickname':1 ,'profile_img':1, 'like':1})
        if data['flag'] == 'color':
            col_user.update_one({'user_id':session['login']}, {'$push': {'like': data['post_id']}})
            session_user = col_user.find_one({'user_id':session['login']},{'_id':0, 'nickname':1 ,'profile_img':1, 'like':1})
            notice_post = col_post.find_one_and_update({'_id':ObjectId(data['post_id'])}, {'$push': {'like': session_user}}, return_document=ReturnDocument.AFTER)
            # 세션 유저의 좋아요 정보 update
            session['like'] = col_user.find_one({'user_id':session['login']},{'_id':0, 'like':1})['like']
            # print('notice_post', notice_post)
            col_notice.update_many({'post_info._id':data['post_id']}, {'$set' : {'post_info' : get_post(data['post_id'])}})
            if session['nickname'] != data['create_user']:
                # notice를 위한 변수
                notice_img_kind = 'post_img'
                notice_img_data = notice_post['images'][0]

                # 이미지 파일이 없는 경우 첫번째 text로 대체
                if notice_img_data.split('.')[-1] == '':
                    notice_img_kind = 'post_text'
                    notice_img_data = notice_post['split_text'][0]
                
                col_notice.insert_one({
                    'notice_user' : data['create_user'],
                    'notice_info' : { 'nickname': session['nickname'], 'notice_img_kind': notice_img_kind, 'notice_img_data': notice_img_data },
                    'kind' : 'like',
                    'time' : time,
                    'check' : False,
                    'post_info' : get_post(data['post_id'])
                })
        else:
            col_user.update_one({'user_id':session['login']}, {'$pull': {'like': data['post_id']}})
            col_post.update_one({'_id':ObjectId(data['post_id'])}, {'$pull': {'like': { 'nickname' : session['nickname']}}})
            col_notice.update_many({'post_info._id':data['post_id']}, {'$set' : {'post_info' : get_post(data['post_id'])}})
            session['like'] = col_user.find_one({'user_id':session['login']},{'_id':0, 'like':1})['like']
            
        return jsonify(result = "success", session_user=session_user)
    # 댓글 달기 버튼을 눌렀을 때에 대한 ajax 통신
    elif data['kind'] == 'append_comment':
        session_user = col_user.find_one({'user_id':session['login']},{'_id':0, 'nickname':1 ,'profile_img':1})
        comment = data['text'].split(' ')
        comment_info = col_comment.insert_one({
            'post_id' : data['post_id'],
            'comment_user' : session_user,
            'comment_time' : time,
            'comment' : comment,
            'reply_list' : []
        })
        col_user.update_one(
            {'user_id': session['login']},
            {'$push': {'comment': {'comment_id': str(comment_info.inserted_id), 'kind': 'comment', 'time': time}
            }}
        )
        notice_post = col_post.find_one_and_update({'_id': ObjectId(data['post_id'])}, {'$inc': {'comment': 1}}, return_document=ReturnDocument.AFTER)
        # 알림 중 해당 post정보 update
        col_notice.update_many({'post_info._id':data['post_id']}, {'$set' : {'post_info' : get_post(data['post_id'])}})
        # 댓글 전송시 notice 처리
        mention = []
        if data['create_user'] != session['nickname']:
            # notice를 위한 변수
            notice_img_kind = 'post_img'
            notice_img_data = notice_post['images'][0]

            # 이미지 파일이 없는 경우 첫번째 text로 대체
            if notice_img_data.split('.')[-1] == '':
                notice_img_kind = 'post_text'
                notice_img_data = notice_post['split_text'][0]

            col_notice.insert_one({
                    'notice_user' : data['create_user'],
                    'notice_info' : { 'nickname': session['nickname'], 'notice_img_kind': notice_img_kind, 'notice_img_data': notice_img_data },
                    'kind' : 'comment',
                    'time' : time,
                    'check' : False,
                    'post_info' : get_post(data['post_id'])
            })
            for word in comment:
                print(word)
                if word[0] == '@':
                    col_notice.insert_one({
                        'notice_user' : word[1:],
                        'notice_info' : { 'nickname': session['nickname'], 'notice_img_kind': notice_img_kind, 'notice_img_data': notice_img_data },
                        'kind' : 'mention',
                        'time' : time,
                        'check' : False,
                        'post_info' : get_post(data['post_id'])
                     })
                    mention.append(word[1:])
        return jsonify(result = "success", session_user=session_user, comment=comment, time=time, comment_id = str(comment_info.inserted_id), mention=mention)
    # 해당 post의 댓글을 불러오는 ajax 통신
    elif data['kind'] == 'get_comment':
        comment_dic = list(col_comment.find(
            {'post_id': data['post_id']}
        ))#.sort("comment_time", pymongo.DESCENDING))
        for comment in comment_dic:
            comment['_id'] = str(comment['_id'])
        
        return jsonify(result = "success", comment_dic = comment_dic)\
    # 답글 추가 ajax 통신
    elif data['kind'] == 'append_reply':
        time = dt.datetime.now(timezone('Asia/Seoul')).strftime("%Y-%m-%d-%H-%M-%S")
        session_user = col_user.find_one({'user_id':session['login']},{'_id':0, 'nickname':1 ,'profile_img':1})
        reply = data['text'].split(' ')
        # 댓글 document의 reply list에 추가할 정보 dictionary 
        append_reply = {
            'reply_user' : session_user,
            'reply_time' : time,
            'reply' : reply,
        }
        info = col_comment.find_one_and_update(
            {'_id': ObjectId(data['comment_id'])},
            {'$push': {'reply_list': append_reply}},
            { 'returnNewDocument': True })
        col_user.update_one(
            {'user_id': session['login']},
            {'$push': {'comment': 
                {'comment_id': str(info['_id']), 'kind': 'reply', 'time': time}
            }}
        )
        notice_post = col_post.find_one_and_update({'_id': ObjectId(data['post_id'])}, {'$inc': {'comment': 1}}, return_document=ReturnDocument.AFTER)
        col_notice.update_many({'post_info._id':data['post_id']}, {'$set' : {'post_info' : get_post(data['post_id'])}})
        mention = []
        if data['create_user'] != session['nickname']:
            # notice를 위한 변수
            notice_img_kind = 'post_img'
            notice_img_data = notice_post['images'][0]

            # 이미지 파일이 없는 경우 첫번째 text로 대체
            if notice_img_data.split('.')[-1] == '':
                notice_img_kind = 'post_text'
                notice_img_data = notice_post['split_text'][0]

            col_notice.insert_one({
                    'notice_user' : data['create_user'],
                    'notice_info' : { 'nickname': session['nickname'], 'notice_img_kind': notice_img_kind, 'notice_img_data': notice_img_data },
                    'kind' : 'reply',
                    'time' : time,
                    'check' : False,
                    'post_info' : get_post(data['post_id'])
            })
            for word in reply:
                if '@' in word:
                    col_notice.insert_one({
                        'notice_user' : word[1:],
                        'notice_info' : { 'nickname': session['nickname'], 'notice_img_kind': notice_img_kind, 'notice_img_data': notice_img_data },
                        'kind' : 'mention',
                        'time' : time,
                        'check' : False,
                        'post_info' : get_post(data['post_id'])
                     })
                    mention.append(word[1:])
        return jsonify(result = "success", session_user=session_user, reply=reply, time=time, mention=mention)

@app.route("/content_reaction_submit", methods=["DELETE"])
def delete_reply_comment():
    col_notice = db.get_collection('notice')
    col_post = db.get_collection('post')
    col_comment = db.get_collection('comment')
    data = request.get_json()
    print(data)
    post_id = col_comment.find_one({'_id':ObjectId(data['comment_id'])}, {'_id':0, 'post_id':1})['post_id']
    if data['kind'] == 'delete_reply':
        delete_reply(data)
    elif data['kind'] == 'delete_comment':
        delete_comment(data)

    col_notice.update_many({'post_info._id':post_id}, {'$set' : {'post_info' : get_post(post_id)}})
    return jsonify(result = "success")

@app.route("/user/<user>")
def user(user):
    col_user = db.get_collection('user')
    col_request_friend = db.get_collection('request_friend')
    col_post = db.get_collection('post')

    session_friend_list = get_friend_list(session['login'])
    
    search_user = col_user.find_one({'nickname':user})

    # user의 친구 정보 dictionary
    user_friend_list = get_friend_list(search_user['user_id']) 
    friend_dic = get_friend_dic(user_friend_list)

    # session 유저가 친구 요청을 보낸 user의 id 리스트
    session_request_list = [user['request_user'] for user in col_request_friend.find({'user_id': session['login']})]

    post_dic = col_post.find({'create_user_nickname': user}).sort("create_time", pymongo.DESCENDING)  

    return render_template('user.html', user=search_user,session_friend_list=session_friend_list,\
         friend_dic=friend_dic, session_request_list = session_request_list, post_dic=post_dic)

@app.route("/logout", methods=["GET", "POST"])
def logout():
    flash("로그아웃 되었습니다.")
    session.clear()
    return redirect(url_for('login'))

@app.route("/friend", methods=["GET", "POST"])
def friend():
    user = session['login']
    col_user = db.get_collection('user')
    col_request_friend = db.get_collection('request_friend')
    
    request_friend_id = [user['user_id'] for user in col_request_friend.find({'request_user':user})]
    request_friend = get_friend_dic(request_friend_id)

    friend_list = get_friend_list(user)
    friend_dict = get_friend_dic(friend_list)

    recommend_frined_dic = {}
    for friend in friend_list:
        friend_friend_list = get_friend_list(friend)
        friend_friend_dict = get_friend_dic(friend_friend_list)
        for f, recommend_friend in friend_friend_dict.items():
            if f != session['login'] and f not in friend_list:
                friend_dic = col_user.find_one({'user_id':friend})
                if f in recommend_frined_dic.keys():
                    recommend_frined_dic[f]['count'].append(friend_dic)
                else:
                    recommend_frined_dic[f] = recommend_friend
                    recommend_frined_dic[f]['count'] = [friend_dic]

    return render_template('friend.html', request_friend=request_friend, friend_list=friend_dict, recommend_frined_dic=recommend_frined_dic)

@app.route("/friend_respond", methods=["POST"])
def friend_respond():
    data = request.get_json()
    print(data, type(data))
    col_user = db.get_collection('user')
    col_request_friend = db.get_collection('request_friend')

    if data['respond'] == 'accept_btn':
        col_user.update_one({'user_id': session['login']}, {'$push': {'friend_list': data['friend']}})
        col_user.update_one({'user_id': data['friend']}, {'$push': {'friend_list': session['login']}})
    elif data['respond'] == 'delete_btn':
        col_user.update_one({'user_id': session['login']}, {'$pull': {'friend_list': data['friend']}})
        col_user.update_one({'user_id': data['friend']}, {'$pull': {'friend_list': session['login']}})
    col_request_friend.delete_one({'user_id': data['friend'], 'request_user':session['login']})
    col_request_friend.delete_one({'user_id': session['login'], 'request_user':data['friend']})

    return jsonify(result = "success", result2= data)

@app.route("/setting")
def setting():
    col_user = db.get_collection('user')
    session_user = col_user.find_one({'user_id': session['login']})
    nicknames = list(col_user.find({},{'_id':0,'nickname':1}))

    nickname_list = [user['nickname'] for user in nicknames]
    nickname_dict = {'list': nickname_list}
    json_lis = json.dumps(nickname_dict)

    return render_template('setting.html', session_user=session_user, nickname_list=json_lis)

@app.route("/setting", methods= ['POST'])
def post_setting():
    col_user = db.get_collection('user')
    # gridfs를 사용할 colection
    if 'setting_button_profile' in request.form:
        input_profile = request.files.get('setting_input_profile')
        
        filename = input_profile.filename.split('.')[0]
        ext = input_profile.filename.split('.')[-1]
        nickname = session['nickname']
        img_name = dt.datetime.now(timezone('Asia/Seoul')).strftime(f"{nickname}-{filename}-%Y-%m-%d-%H-%M-%S.{ext}")

        s3_put_object(s3,'ydpsns',input_profile,img_name)
        col_user.update_one(
            {'user_id': session['login']},
            {'$set' : {'profile_img': [img_name, s3_get_image_url(s3, img_name)]}}
        )
        session['profile_img'] = [img_name, s3_get_image_url(s3, img_name)][1]

    if 'setting_button_background' in request.form:
        input_background = request.files.get('setting_input_background')

        filename = input_background.filename.split('.')[0]
        ext = input_background.filename.split('.')[-1]
        img_name = dt.datetime.now(timezone('Asia/Seoul')).strftime(f"{session['nickname']}-{filename}-%Y-%m-%d-%H-%M-%S.{ext}")
        s3_put_object(s3,'ydpsns',input_background,img_name)

        col_user.update_one(
            {'user_id': session['login']},
            {'$set' : {'background_img': [img_name, s3_get_image_url(s3, img_name)]}}
        )

    if 'setting_button_ide' in request.form:
        input_ide = request.form.get('setting_input_ide')
        col_user.update_one(
            {'user_id': session['login']},
            {'$set' : {'nickname': input_ide}}
        )
        session['nickname'] = input_ide

    if 'setting_button_bio' in request.form:
        bio = request.form.get('setting_input_bio')
        col_user.update_one(
            {'user_id': session['login']},
            {'$set' : {'bio': bio}}
        )

    if 'setting_button_name' in request.form:
        input_name = request.form.get('setting_input_name')
        col_user.update_one(
            {'user_id': session['login']},
            {'$set' : {'user_name': input_name}}
        )
        session['user_name'] = input_name

    return redirect(url_for('setting'))

# setting 기존 비밀번호 일치 여부 반환
@app.route('/change_pw', methods=['POST'])
def change_pw():
    col_user = db.get_collection('user')

    # print(request.get_json())
    # 사용자가 입력한 기존 pw와 세션 pw가 일치하면 check_password 함수 실행
    if request.get_json():
        data = request.get_json()
        origin_pw = data['origin_pw']
        db_pw = col_user.find_one({ "user_id" : session['login'] })

        if bcrypt.check_password_hash(db_pw['password'], origin_pw):
            flag = 1
            return jsonify(result="success", flag=flag)
        else:
            flag = 0
            return jsonify(result="success", flag=flag)


# 친구 요청, 요청 취소, 친구 삭제 처리
@app.route('/request_friend', methods=['POST'])
def request_frie():
    data = request.get_json()
    col_user = db.get_collection('user')
    col_request_friend = db.get_collection('request_friend')
    col_notice = db.get_collection('notice')

    print(data['user'], data['id'].split('!')[-1], data['val'])
    user = data['user']
    request_user = data['id'].split('!')[-1]
    
    if data['val'] == '친구 요청':
        col_request_friend.insert_one({
            'user_id' : user,
            'request_user' : request_user
        })
        col_notice.insert_one({
            'notice_user' : request_user,
            'notice_info' : { 'nickname': session['nickname'], 'notice_img_kind': 'profile_img', 'notice_img_data': session['profile_img'] },
            'kind' : 'request_friend',
            'time' : dt.datetime.now(timezone('Asia/Seoul')).strftime("%Y-%m-%d-%H-%M-%S"),
            'check' : False,
            'post_info': None
        })
    elif data['val'] == '요청 취소':
        query = { '$or' : 
            [{'user_id': user}, {'request_user' : request_user}]
        }
        col_request_friend.delete_one(query)
    # 친구 삭제 
    else:
        col_user.update_one( {'user_id':user},{'$pull': {'friend_list' : request_user }})
        col_user.update_one( {'user_id':request_user},{'$pull': {'friend_list' : user }})
    
    return jsonify(result = "success", result2= data)

# 탈퇴를 위한 route 함수
@app.route('/secession', methods=["post"])
def user_secession():
    col_user = db.get_collection('user')
    col_request_friend = db.get_collection('request_friend')
    col_post = db.get_collection('post')
    col_comment = db.get_collection('comment')
    col_notice = db.get_collection('notice')
    col_delete = db.get_collection('deleteFile')

    data = request.get_json()
    user = col_user.find_one({'user_id':data['id']})
    if bcrypt.check_password_hash(user['password'], data['pw']):
        # 친구 요청 collection에서 해당 user가 포함된 document 제거
        col_request_friend.delete_many(
            {'$or': [{'user_id': user['user_id']}, {'request_user': user['user_id']}]}
        )

        # 알림 collection에서 해당 user가 포함된 document 제거
        col_notice.delete_many({
             {'$or': [{'notice_user': user['user_id']}, {'notice_user': user['nickname']}, {'notice_info.nickname': user['nickname']}]}
        })

        # 해당 user가 좋아요 누른 게시물 정보 수정
        for post_id in user['like']:
            col_post.update_one({'_id': ObjectId(post_id)}, {'$pull' : {'like' : {'nickname' : user['nickname']}}})

        # 댓글 collection에서 해당 user가 포함된 document 수정 및 제거
        for comment in user['comment']:
            tmp_data = comment
            tmp_data['nickname'] = user['nickname']
            if comment['kind'] == 'reply':
                delete_reply(comment)
            else:
                delete_comment(comment)

        # 해당 user가 작성한 post 제거
        delete_posts = col_post.find({'create_user_nickname': user['nickname']})
        for post in delete_posts:
            delete_post_one(str(post['_id']))
        
        # 해당 user의 profile, background 이미지 제거 
        default_user = col_user.find_one({'nickname': 'default'})
        if default_user['profile_img'][0] != user['profile_img'][0]:
            col_delete.insert_one({
                'file_route': 'images',
                'file_name' : user['profile_img'][0]
            })
        if default_user['background_img'][0] != user['background_img'][0]:
            col_delete.insert_one({
                'file_route': 'images',
                'file_name' : user['background_img'][0]
            })
        
        # 해당 user의 친구 user에 friend_list 수정
        for friend in user['friend_list']:
            col_user.update_one({'user_id': friend}, {'$pull' : {'friend_list': user['user_id']}})

        # 해당 user 최종 삭제
        col_user.delete_one({'nickname': user['nickname']})

        data = True
    else:
        data = '입력된 계정 정보가 잘못되었습니다. 아이디와 비밀번호를 확인해 주세요'
    
    return jsonify(result = "success", result2= data)

@app.route('/test')
def connection_mongodb():
    print(conn.list_database_names())
    print(db.list_collection_names())

    col = db.get_collection('user')
    col_post = db.get_collection('post')
    col_delete = db.get_collection('deleteFile')
    col_comment = db.get_collection('comment')
    col_notice = db.get_collection('notice')
    # print(* list(col.find({},{'user_id':True, 'nickname':True})))
    # col.update_many({},{"$rename":{"name":"user_name"}})
    lis = col.find_one({'nickname':'aa'})
    
    json_lis = dumps(lis)
    # print(json_lis)
    # print('\n\n\n')
    # for i in lis['like']:
    #     f = col_post.find_one({'_id': ObjectId(i)})
    #     print(f, end='\n-------------------------\n')
    # print('post show')
    # for i in col_post.find({}):
    #     print(i, end='\n-------------------------\n')
    # print('comment show')
    # for i in col_comment.find({}):
    #     print(i, end='\n-------------------------\n')
    # print('=================notice======================')
    # for i in col_notice.find({}):
    #     print(i, end='\n-------------------------\n')
    print('post show')
    p =list(col_post.find({'create_user_nickname': 'aa'}))
    for i in p:
        print(i, end='\n-------------------------\n')
    print('comment show')
    for i in col_comment.find({'post_id':str(p[0]['_id'])}):
        print(i, end='\n-------------------------\n')
    data = {
        'time': 123,
        'nickname' : 'aa'
    }
    comment = col_comment.find_one_and_update(
        {'_id': 'qwer'},
        { '$pull': {'reply_list' : {'$and': [{'reply_time': data['time']}, {'reply_user.nickname': data['nickname']}]} }}
    , return_document=ReturnDocument.AFTER)
    print(comment, type(comment))
    return jsonify(json_lis)

