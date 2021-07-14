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


# group 그룹 id 검색
@bp.route('/<group_id>', methods=['GET'])
def search_group_by_id(group_id):
    err = ''
    group = database.groups.find_one({'_id': ObjectId(group_id)})

    if len(group) == 0:
        err = '그룹을 찾을 수 없습니다'

    group_place = []
    for member in group['member']:
        user_info = database.users.find_one({'id': member})
        group_place.extend(user_info['place'])

    group_place = set(group_place) # 중복 제거

    places = []
    for p in group_place:
        place_info = database.places.find_one({'_id': p})
        places.append(place_info)

    # ObjectId to String
    group['_id'] = str(group['_id'])
    for i in range(len(places)):
        places[i]['_id'] = str(places[i]['_id'])

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
    if 'user_id' in session:
        db.add_group_member(request.form['group_id'], request.form['member_id'])
    else:
        err = '먼저 로그인을 해주세요'
    return {'result': 'OK', 'errMsg': err}
