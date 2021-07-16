import bson
from flask import Blueprint, session, request
import db
from bson.objectid import ObjectId

database = db.get_db()
bp = Blueprint('group', __name__, url_prefix='/group')

# group 그룹 만들기
@bp.route('/', methods=['POST'])
def create_group():
    result = {}
    err = ''
    if 'user_id' in session:
        group_name = request.form['group_name']
        group_desc = request.form['group_desc']
        group_color = request.form['group_color']

        _id = database.groups.insert_one({
            'group_name': group_name,
            'desc': group_desc,
            'color': group_color,
            'group_owner': session['user_id'],
            'member': [session['user_id']]
        })

        # 사용자 정보 갱신
        database.users.update_one({'id': session['user_id']},
                                  {'$addToSet': {
                                       'group': _id.inserted_id
                                   }
                                   })
    else:
        err = '먼저 로그인을 해주세요'
    return {'group_id': result, 'errMsg': err}

import random
def get_rand_nickname():
    nickname = ['오소리', '토끼', '너구리', '치와와', '푸들', '플라밍고']
    rand_num = random.randrange(0, len(nickname))
    return nickname[rand_num]

# group 그룹 id로 검색
@bp.route('/<group_id>', methods=['GET'])
def search_group_by_id(group_id):
    err = ''
    group = database.groups.find_one({'_id': ObjectId(group_id)})

    if len(group) == 0:
        err = '그룹을 찾을 수 없습니다'

    member_list = []
    group_place = []
    for member in group['member']:
        user_info = database.users.find_one({'id': member})
        group_place.extend(user_info['place'])
        if user_info['kakao_account']['profile'] is not None:
            member_list.append(user_info['kakao_account']['profile']['nickname'])
        else:
            member_list.append('익명의 ' + get_rand_nickname()) # 카카오 닉네임이 없을 경우 임의로 생성하여 표시함

    group_place = set(group_place) # 중복 제거

    places = []
    for p in group_place:
        place_info = database.places.find_one({'_id': p})
        # 그룹 멤버의 별점만 따로 집계
        rate_sum = 0
        mber_num = 0
        for r in place_info['rates']:
            if r['user_id'] in group['member']:
                rate_sum = rate_sum + r['point']
                mber_num += 1

        if mber_num > 0:
            place_info['rate_avg'] = rate_sum/mber_num

        place_info['rate_mber_num'] = mber_num # 별점 남긴 회원 수 field 추가

        places.append(place_info)

    places.sort(key=lambda p: p['rate_avg'], reverse=True)

    # ObjectId to String
    group['_id'] = str(group['_id'])
    for i in range(len(places)):
        places[i]['_id'] = str(places[i]['_id'])

    # group 회원 정보 field를 member_list로 대체
    group['member'] = member_list;

    return {'group': group, 'places': places, 'errMsg': err}


# group 나의 그룹 가져오기
@bp.route('/', methods=['GET'])
def get_my_groups():
    groups = []
    err = ''
    if 'user_id' in session:
        user_info = database.users.find_one({'id': session['user_id']})
        group_id_list = user_info['group']
        for group_id in group_id_list:
            g = database.groups.find_one({'_id': group_id})
            g['_id'] = str(g['_id'])
            groups.append(g)
    else:
        err = '먼저 로그인을 해주세요'
    return {'groups': groups, 'errMsg': err}


# group 그룹원 추가하기
@bp.route('/member', methods=['POST'])
def add_group_member():
    err = ''
    result = 'OK'

    if 'user_id' in session:
        try:
            group_id = ObjectId(request.form['group_id'])
            if database.groups.find_one({'_id': group_id}) is None:
                err = '잘못된 그룹 초대 코드입니다.'
            else:
                database.groups.update_one({'_id': ObjectId(request.form['group_id'])},
                                           {'$addToSet':
                                                {'member': session['user_id']}
                                            })
                database.users.update_one({'id': session['user_id']},
                                          {'$addToSet':
                                               {'group': ObjectId(request.form['group_id'])}
                                           })
        except bson.errors.InvalidId:
            err = '잘못된 그룹 초대 코드입니다.'
            result = 'ERR'
    else:
        err = '먼저 로그인을 해주세요'
        result = 'ERR'

    return {'result': result, 'errMsg': err}
