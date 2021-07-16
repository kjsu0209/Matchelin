from flask import Flask, render_template, make_response
from config import get_api_key, get_url
from flask import request
import os
import time
import db

app = Flask(__name__)
app.secret_key = 'aksdjflaskdjfaasdfas' # 세션에 사용되는 키

import place
app.register_blueprint(place.bp)

import group
app.register_blueprint(group.bp)


def format_server_time():
  server_time = time.localtime()
  return time.strftime("%I:%M:%S %p", server_time)


@app.route('/')
def index():
    context = { 'server_time': format_server_time(), 'keys': get_api_key() }
    return render_template('index.html', context=context)

# home
@app.route('/home')
def home():
    context = { 'server_time': format_server_time(), 'keys': get_api_key() }
    return render_template('index.html', context=context)

# auth 로그인/ Kakao로 바로 시작할 수 있음
import requests
import json
from flask import redirect, url_for, session

# Kakao 인가 코드 받기
@app.route('/kakaoauth', methods=['GET'])
def kakao_auth():
    # 회원번호 받기
    client_id = get_api_key()['client_id']
    redirect_uri = get_url() + '/login'

    url = f"https://kauth.kakao.com/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code"

    return redirect(url)


# Kakao 인가 코드로 Access Token 받기
@app.route('/login', methods=['GET'])
def login():
    auth_code = request.args.get('code')

    client_id = get_api_key()['client_id']
    uri = get_url() + "/login"
    token_request = requests.post(
        f"https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id={client_id}&redirect_uri={uri}&code={auth_code}"
    )
    token_json = token_request.json()
    error = token_json.get("error", None)
    if error is not None:
        return make_response({"message": "INVALID_CODE"}, 400)
    access_token = token_json.get("access_token")
    profile_request = requests.get(
        "https://kapi.kakao.com/v2/user/me", headers={"Authorization": f"Bearer {access_token}"},
    )
    data = profile_request.json()
    # print(data)

    db.regist_if_not_exists(data['id'], data['kakao_account'])

    # session에 Token 저장
    session['token'] = access_token
    session['user_id'] = data['id']

    return redirect(url_for('home'))

# auth 로그아웃
@app.route('/logout', methods=['GET'])
def logout():
    # Kakao 인증 Token 파기
    uri = 'https://kapi.kakao.com/v1/user/logout'

    logout_request = requests.post(
        uri, headers={"Authorization": f"Bearer {session['token']}"}
    )

    print(logout_request.json())

    # 세션 data 파기
    session.pop('user_id', None)
    session.pop('token', None)

    return redirect(url_for('home'))



if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0',port=int(os.environ.get('PORT', 5000)))
