from bson import ObjectId
from flask import Blueprint, session, request, redirect, url_for, jsonify

import config
import db, requests

database = db.get_db()
bp = Blueprint('place', __name__, url_prefix='/place')

# place 나의 맛집 조회
@bp.route('/', methods=['GET'])
def find_my_places():
    if 'user_id' in session:
        my_places = database.users.find_one({'id': session['user_id']})

        places = []
        for place in my_places['place']:
            p = database.places.find_one({'_id': place})

            # 내 평점만 볼 수 있게
            for r in p['rates']:
                if r['user_id'] == session['user_id']:
                    p['rate_avg'] = r['point']
                    break
            places.append(p)

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


# 상호명으로 이미지/블로그 검색해서 리스트 반환
@bp.route('/timeline/<string:place_name>/<page>', methods=['GET'])
def get_place_timeline(place_name, page):
    result = "OK"

    rest_api_key = config.get_api_key()['rest_api']
    image_result = requests.get(
        f"https://dapi.kakao.com/v2/search/image?query={place_name}&page={page}&size=4",
        headers={"Authorization": f"KakaoAK {rest_api_key}"}
    ).json()

    if image_result["meta"]["is_end"] is True:
        result = "EOF"

    blog_result = requests.get(
        f"https://dapi.kakao.com/v2/search/blog?query={place_name}&page={page}&size=2",
        headers={"Authorization": f"KakaoAK {rest_api_key}"},
    ).json()

    if blog_result["meta"]["is_end"] is True:
        result = "EOF"

    return jsonify({"result": result, "images": image_result["documents"], "blogs": blog_result["documents"]})