from flask import session
from flask_socketio import emit
from bson.objectid import ObjectId
import pymongo

conn = pymongo.MongoClient("mongodb://root:study111@15.164.96.105/root?authSource=admin")
db = conn.get_database('root')
col_user = db.get_collection('user')
col_post = db.get_collection('post')
col_comment = db.get_collection('comment')
col_notice = db.get_collection('notice')
def socketio_init(socketio):
    
    @socketio.on('connect')
    def test():
        retMessage = { 'msg' : "hello response11" }
        emit('connect', retMessage)
    
    @socketio.on('friend_request')
    def request_friend_notice(message):
        notice_user = col_user.find_one({'user_id': message['user']}, {'_id': 0, 'nickname':1})

        notice = col_notice.find(
            {'$and': [
                    {'notice_user' : message['id'].split('!')[-1]},
                    {'notice_info.nickname' : notice_user['nickname']},
                    {'kind' : 'request_friend'}]
            }).sort('time', pymongo.DESCENDING).limit(1)
        notice = list(notice)
        print('message = ',notice)
        if len(notice):
            notice[0]['_id'] = str(notice[0]['_id'])
        emit('request_notice',notice, broadcast=True)
    
    @socketio.on('like_post')
    def like_notice(message):
        notice = col_notice.find(
            {'$and': [
                    {'notice_user' : message['create_user']},
                    {'notice_info.nickname' : message['session_user']},
                    {'kind' : message['kind']}]
            }).sort('time', pymongo.DESCENDING).limit(1)
        notice = list(notice)
        if len(notice):
            notice[0]['_id'] = str(notice[0]['_id'])
        emit('like_notice',notice, broadcast=True)

    @socketio.on('comment_post')
    def comment_notice(message):
        if message['kind'] == 'append_reply':
            notice = col_notice.find(
                {'$and': [
                        {'notice_user' : message['create_user']},
                        {'notice_info.nickname' : message['session_user']},
                        {'kind' : 'reply'}]
                }).sort('time', pymongo.DESCENDING).limit(1)
            notice = list(notice)
            if len(notice):
                notice[0]['_id'] = str(notice[0]['_id'])
            if message['create_user'] != session['nickname']:
                emit('comment_notice',notice, broadcast=True) 
        else :
            notice = col_notice.find(
                {'$and': [
                        {'notice_user' : message['create_user']},
                        {'notice_info.nickname' : message['session_user']},
                        {'kind' : 'comment'}]
                }).sort('time', pymongo.DESCENDING).limit(1)
            notice = list(notice)
            if len(notice):
                notice[0]['_id'] = str(notice[0]['_id'])
            if message['create_user'] != session['nickname']:
                emit('comment_notice',notice, broadcast=True)  

    @socketio.on('mention')
    def mention_notice(message):
        notice = col_notice.find(
            {'$and': [
                    {'notice_user' : message['mention']},
                    {'notice_info.nickname' : message['session_user']},
                    {'kind' :'mention'}]
            }).sort('time', pymongo.DESCENDING).limit(1)
        notice = list(notice)
        if len(message):
            notice[0]['_id'] = str(notice[0]['_id'])
        emit('mention_notice',notice, broadcast=True) 
