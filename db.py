from pymongo import MongoClient
client = MongoClient('localhost', 27017)
db = client.dbmatchelin


def get_db():
    return db


# 카카오 로그인 했을때 DB에 id없으면 계정 새로 만들고, 있으면 그대로 진행
def login(user_id):
    user = db.users.find_one({'id':user_id})
    print(user)


def regist_if_not_exists(id, kakao_account):
    if not get_user(id):
        db.users.insert_one({'id': id, 'kakao_account': kakao_account, 'place':[], 'group':[]})
        print('사용자 생성 : ', id)


def get_user(id):
    user = db.users.find_one({'id': id})
    # print(user)
    return user
