from bson import ObjectId
from flask import Blueprint, session, request, redirect, url_for, jsonify
import db

database = db.get_db()
bp = Blueprint('rate', __name__, url_prefix='/rate')

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


# place 그룹 맛집 조회

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
                                  'rates': []
                                  })

        # 내 장소에 추가하기
        user_id = session['user_id']
        database.users.update_one({'id': user_id},
                           {'$addToSet': {'place': place_id}})

        return jsonify({"place_id": place_id})

    else:
        err = '먼저 로그인을 해주세요'
        return redirect(url_for('home'))

