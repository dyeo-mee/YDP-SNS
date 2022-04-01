from email.policy import default
import pymongo
from bson.objectid import ObjectId
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()
conn = pymongo.MongoClient("mongodb://root:study111@15.164.96.105:27017/root?authSource=admin")
db = conn.get_database('root')
col = db.get_collection('user')
col_post = db.get_collection('post')
col_comment = db.get_collection('comment')
col_notice = db.get_collection('notice')
def modify_user():
    lst = []
    ''' 유저마다 닉네임 추가'''
    # for i in col.find({},{'user_id':True, 'nickname':True}):
    #     lst.append(i['user_id'])
    # # print(lst)
    # name = ['test', 'aa', 'bb', 'cc', 'dd', "ee"]
    # # for i in range(len(lst)):
    # #     col.update_one(
    # #         {'user_id':lst[i]},
    # #         {'$set':{'name':name[i]}}
    # #     )
    # for i in col.find({},{'user_id':True, 'nickname':True}):
    #     print(i)
    '''유저에 친구 목록 리스트 추가'''
    for user in col.find():
        print(user)
    return

def modify_user_one():
    '''유저에 친구 목록 리스트 추가'''
    # result = col.update_one(
        # {'nickname': 'fff'},
        # {'$set':{'like':[]}}
    # )
    # result = col.update_many(
    #     {},
    #     {'$set': {'comment':[]}}
    # )
    # result = col_post.update_one(
    #     {'_id':ObjectId('6201d33f299b641572be24b9')},
    #     {'$set': {'like':[]}}
    # )
    result = col_post.update_many(
        {},
        {'$set': {'modified':False}}
    )
    # return
    # id = col.find_one({'user_id':'default'})
    # background_img = id['background_img'] 
    # print(profile_id)
    # result = col.update_many(
    #     {},
    #     {'$set': {'background_img': background_img }}
    # )
    # result = col.update_many({}, {'$rename': {'user_ide':'nickname'}})

def del_user():
    lst = []
    for i in col.find({}):
        # lst.append(i['user_id'])
        print(i)
    # print(lst)
    result = col.delete_one({
        # '_id': ObjectId('61d00cdeba8833acb1019a6b')
        '_id': ObjectId('61efc1b8a94321fa3d464725')
    })
    print(result.deleted_count)

def del_post():
    # result = col_post.delete_many({
    #     # '_id': ObjectId('61d00cdeba8833acb1019a6b')
    #     # '_id': ObjectId('61efc1b8a94321fa3d464725')
    # })
    # print(result.deleted_count)
    # result = col_comment.delete_many({

    # })
    # print(result.deleted_count)
    result = col_notice.delete_many({

    })
    print(result.deleted_count)

def search():
    search_user = col.find({})
    for i in search_user:
        print(i)
    # s = col.aggregate([ 
    #     {"$group": {"_id": "$user_id", "unique_ids": {"$addToSet": "$_id"},
    #      "count": {"$sum": 1}}}, {"$match": {"count": { "$gte": 2 }}} 
    #      ])
    # print(list(s['_id']))

# def insert():
#     col.insert_one({ 
#         'user_id': 'default',
#         'password': bcrypt.generate_password_hash('default'),
#         'nickname': 'default',
#         'user_name': 'default',
#         'friend_list': [],
#         'profile_img': None,
#         'background_img': None,
#         'bio' : 'default'
#     })


# del_user()
del_post()
# search()
# modify_user_one()
# insert()
# print(dir(col_comment))
