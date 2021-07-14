from bson import ObjectId
from flask import Blueprint, session, request, redirect, url_for, jsonify
import db

database = db.get_db()
bp = Blueprint('place', __name__, url_prefix='/place')

# place 나의 맛집 조회
@bp.route('/', methods=['GET'])
def find_my_places():
    if 'user_id' in session:
        my_places = database.users.find_one({'id': session['user_id']})

        places = []
        for place in my_places['place']:
            places.append(database.places.find_one({'_id': place}))

        return jsonify({"places": places})
    else:
        err = '먼저 로그인을 해주세요'
        return redirect(url_for('home'))


# place 맛집 정보 조회
@bp.route('/<place_id>', methods=['GET'])
def get_place_info(place_id):
    place_info = database.places.find_one({'_id': place_id})

    return jsonify({"place": place_info})


# place 나의 맛집 추가
@bp.route('/', methods=['POST'])
def add_my_place():
    err = ''
    if 'user_id' in session:
        # 장소 추가하기
        place_data = {
                "place_name": request.form['place_name'],
                "lat": request.form['latitude'],
                "lng": request.form['longitude'],
                "address_name": request.form['address_name'],
                "phone": request.form['phone']
            }

        place_id = place_data['lat'] + '' + place_data['lng']
        if database.places.find_one({'_id': place_id}) is None:
            database.places.insert_one({'_id': place_id,
                                      'place_data': place_data,
                                      'rates': [],
                                      'rate_avg': 0
                                  })

        # 내 장소에 추가하기
        user_id = session['user_id']
        database.users.update_one({'id': user_id},
                           {'$addToSet': {'place': place_id}})

        return jsonify({"place_id": place_id})

    else:
        err = '먼저 로그인을 해주세요'
        return redirect(url_for('home'))


# place 별점 추가
@bp.route('/', methods=['PUT'])
def rate_place():
    if 'user_id' in session:
        place_data = {
            "lat": request.form['latitude'],
            "lng": request.form['longitude'],
            "point": request.form['point']
        }
        place_id = place_data['lat'] + '' + place_data['lng']

        # place에 별점 기록 추가 및 총점 반영
        p = database.places.find_one({'_id': place_id})

        # 이전에 자신이 한 평점 모두 지우기
        database.places.update_many({'_id': place_id},
            {'$pull': {'rates': {'user_id': session['user_id']}}})

        rate_avg = round((p['rate_avg']*len(p['rates']) + int(place_data['point'])) / (len(p['rates']) + 1), 2)

        database.places.update_one({'_id': place_id},
                                   {'$addToSet': {
                                                'rates': {
                                                    'user_id': session['user_id'],
                                                    'point': int(place_data['point'])
                                                }
                                             },
                                       '$set': {
                                           'rate_avg': rate_avg
                                       }
                                   })

        return jsonify({"total_point_avg": rate_avg})
    else:
        err = '먼저 로그인을 해주세요'
        return redirect(url_for('home'))