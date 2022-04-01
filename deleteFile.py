import pymongo
import os
from app import conn
import boto3

# for item in os.environ:
#   print("%s = %s" % (item, os.environ[item]))

delete_access_key_id = os.environ['AWS_ACCESS_KEY_ID']
delete_secret_access_key_id = os.environ['AWS_SECREAT_ACCESS_KEY']

db = conn.get_database('root')

def s3_connection():
    try:
        s3 = boto3.client(
            service_name="s3",
            region_name="ap-northeast-2", # 자신이 설정한 bucket region
            aws_access_key_id = delete_access_key_id,
            aws_secret_access_key = delete_secret_access_key_id
        )
    except Exception as e:
        print(e)
    else:
        print("s3 bucket connected!")
        return s3

def s3_delete_image(filename, file_kind ='images'):
    print('delete =', f'{file_kind}/{filename}')
    # try:
        # s3.delete_object(Bucket='ydpsns',Key=f'{file_kind}/{filename}')
    # except Exception as e:
        # return False
    s3.delete_object(Bucket='ydpsns', Key=f'{file_kind}/{filename}')

def delete_file():
    col_delete = db.get_collection('deleteFile')
    for file in col_delete.find({}):
        s3_delete_image(file['file_name'], file_kind='postimages')

if __name__ == "__main__" :
    s3 = s3_connection()
    delete_file()
    col_delete = db.get_collection('deleteFile')
    col_delete.delete_many({})

