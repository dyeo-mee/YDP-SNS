### 이미지 지정 함수 
# from crypt import methods
from sre_constants import SUCCESS
import gridfs
import codecs
import re
from . import app, conn
from flask import request, render_template, jsonify, redirect, url_for, session, flash
from flask_bcrypt import Bcrypt
import boto3
from bson.objectid import ObjectId
import datetime as dt
import pymongo
from pymongo import ReturnDocument

bcrypt = Bcrypt()
db = conn.get_database('root')
fs = gridfs.GridFS(db)

def session_check():
    if session.get('login') is None:
        session['login'] = 'default'
        return redirect(url_for('login'))

def get_post(id):
    # post 정보
    col_post = db.get_collection('post')
    post = col_post.find_one({'_id':ObjectId(id)})
    post['_id'] = str(post['_id'])
    # 댓글 정보
    col_comment = db.get_collection('comment')
    comment_list = list(col_comment.find({'post_id': id}))
    for i in range(len(comment_list)):
        comment_list[i]['_id'] = str(comment_list[i]['_id']) 

    post['comment_info'] = comment_list
    return post

def s3_connection():
    try:
        s3 = boto3.client(
            service_name="s3",
            region_name="ap-northeast-2", # 자신이 설정한 bucket region
            aws_access_key_id = 'AKIAYFTWJFXVMPGDXDHY  ',
            aws_secret_access_key = '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'
        )
    except Exception as e:
        print(e)
    else:
        print("s3 bucket connected!")
        return s3

s3 = s3_connection()

## db에 저장된 이미지 가지고 오는 함수
def get_user_image(user, kind_img):
    user_img = fs.get(user[kind_img])
    base64_data = codecs.encode(user_img.read(), 'base64')
    user[kind_img] = base64_data.decode('utf-8')
     
def get_friend_list(user):
    col_user = db.get_collection('user')
    return col_user.find_one({'user_id' : user}, {'_id':0, 'friend_list':1})['friend_list']

def get_friend_dic(search_list, background=False):
    friend_dic = {}
    col_user = db.get_collection('user')
    for _user in search_list:
        friend_dic[_user] = col_user.find_one({'user_id': _user})
    
    # for key in friend_dic:
    #     get_user_image(friend_dic[key], 'profile_img')
    #     if background:
    #         get_user_image(friend_dic[key], 'background_img')
    return friend_dic

def s3_put_object(s3, bucket, file, filename, file_kind = 'images'):
    """
    s3 bucket에 지정 파일 업로드
    :param s3: 연결된 s3 객체(boto3 client)
    :param bucket: 버킷명
    :param file: 저장할 파일
    :param filename: 저장 파일명
    :return: 성공 시 True, 실패 시 False 반환
    """
    try:
        s3.put_object(
            Body = file,
	        Bucket = bucket,
            Key = f'{file_kind}/{filename}',
            ContentType = file.content_type
        )
    except Exception as e:
        return False
    return True

def s3_get_image_url(s3, filename, file_kind = 'images'):
    """
    s3 : 연결된 s3 객체(boto3 client)
    filename : s3에 저장된 파일 명
    """
    location = s3.get_bucket_location(Bucket='ydpsns')["LocationConstraint"]
    return f"https://{'ydpsns'}.s3.{location}.amazonaws.com/{file_kind}/{filename}"

def delete_reply(data):
    col_user = db.get_collection('user')
    col_post = db.get_collection('post')
    col_comment = db.get_collection('comment')

    comment = col_comment.find_one_and_update(
        {'_id': ObjectId(data['comment_id'])},
        { '$pull': {'reply_list' : {'$and': [{'reply_time': data['time']}, {'reply_user.nickname': data['nickname']}]} }}
    , return_document=ReturnDocument.AFTER)
    if comment is not None:
        col_post.update_one({'_id': ObjectId(comment['post_id'])}, {'$inc': {'comment': -1}})
    col_user.update_one({'nickname': data['nickname']}, 
    {'$pull': 
        { 'comment' : 
            {'$and':[{'kind':'reply'}, {'comment_id':data['comment_id']}, {'time': data['time']}]}
        }
    })

def delete_comment(data):
    col_user = db.get_collection('user')
    col_post = db.get_collection('post')
    col_comment = db.get_collection('comment')
    
    comment = col_comment.find_one( {'_id': ObjectId(data['comment_id'])},{'_id':1,'reply_list':1,'post_id':1})
    for reply in comment['reply_list']:
        reply_data = {
            'time': reply['reply_time'],
            'nickname': reply['reply_user']['nickname'],
            'comment_id': str(comment['_id'])
        }
        delete_reply(reply_data)
    col_comment.delete_one({'_id': ObjectId(data['comment_id'])})
    col_post.update_one({'_id': ObjectId(comment['post_id'])}, {'$inc': {'comment': -1}})
    col_user.update_one({'nickname': data['nickname']}, 
        {'$pull': 
            { 'comment' : 
                {'$and':[{'kind':'comment'}, {'comment_id':data['comment_id']}, {'time': data['time']}]}
            }
        })

# post id값을 받아서 해당 post에 대한 삭제 처리
# 좋아요 목록, 댓글 및 답글 목록에 대한 사용자 정보 처리
def delete_post_one(data):
    col_user = db.get_collection('user')
    col_post = db.get_collection('post')
    col_comment = db.get_collection('comment')
    col_delete = db.get_collection('deleteFile')
    
    del_post = col_post.find_one({'_id':ObjectId(data)})

    # 해당 게시물에 해당하는 s3의 이미지 파일들 삭제
    for img in del_post['images']:
        tmp_img = img.split('/')[-1]
        if 'postimages' in tmp_img :
            tmp_img = tmp_img.split('/')[-1]
        col_delete.insert_one({
            'file_route' : 'postimages',
            'file_name' : tmp_img
        })

    # 해당 게시물 좋아요 누른 사용자에 대한 document 정리
    for user in del_post['like']:
        col_user.update_one({'nickname': user['nickname']}, {'$pull' : {'like': data}})

    # 해당 게시물 댓글 및 답글단 사용자에 대한 document 정리
    comments = col_comment.find({'post_id':data})
    for comment in comments:
        comment_data = {
            'time': comment['comment_time'],
            'nickname': comment['comment_user']['nickname'],
            'comment_id': str(comment['_id'])
        }
        delete_comment(comment_data)
    # 최종 해당 post 삭제 
    col_post.delete_one({'_id':ObjectId(data)})

@app.route('/check_password', methods=['GET','POST'])
def check_password():

    if 'password' in request.form:
        print('request post!')
        # data = request.get_json()
        col_user = db.get_collection('user')        
        
        reset_pw = request.form['password']
        print(reset_pw)

        reset_pw = bcrypt.generate_password_hash(reset_pw)

        try:
            #password_reset 비밀번호 변경
            col_user.update_one(
                    {'user_email': session['send_email']},
                    {'$set' : {'password': reset_pw}}
                )
        except:
            #setting 비밀번호 변경
            col_user.update_one(
                    {'user_id': session['login']},
                    {'$set' : {'password': reset_pw}}
                )

        flash('비밀번호가 정상적으로 변경되었습니다! 새로운 비밀번호로 로그인 해주세요 :)')
        
        session['login'] = None

        return redirect(url_for('login'))
    