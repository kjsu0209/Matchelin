# 맛집 공유 플랫폼 [맛슐랭]  
토이프로젝트 2021.07.05 ~ 2021.07.16

## 서비스 개요
> 나만의 맛집 리스트를 만들고, 친구들과 공유하는 플랫폼.   
> 그룹 커뮤니티 기능으로 친구들을 모두 만족 시키는 맛집을 모아 볼 수 있습니다.
  
### 나의 맛집 리스트
- 내 맛집 리스트를 만들어 지도에 표시할 수 있습니다.
- Kakao local 검색 api를 사용해 키워드로 맛집을 검색해 추가할 수 있습니다.
- 맛집에 별점 스티커를 등록할 수 있습니다.

### 맛집 그룹
- 그룹 초대 코드로 다른 사용자를 초대할 수 있습니다.
- 그룹원들의 맛집을 모아 볼 수 있습니다.
- 그룹원 전부 다 4점 이상을 준 맛집은 맛슐랭 리스트에 등재됩니다!

## 사용 기술
- Python 3.9.5
- Flask 2.0.1
- pymongo 
- mongoDB 4.4.6
- Bootstrap 5.x

### KAKAO API
- Login api
- Map api
- Search api

## 시스템 구성
### Architecture
백엔드 서버측에서 웹 페이지를 만들어 제공하지만, 추후 프론트엔드 서비스로 분리 가능성을 열어 두기 위해 최대한 백엔드가 웹 페이지에 영향을 주지 않게 만들었습니다.  
백엔드는 api 제공만 수행하고, 웹 페이지에서는 ajax로 세션 이외의 모든 데이터를 받아서 처리하도록 했습니다. 

지도 api 호출 및 중복 코드를 최소화하기 위해 JavaScript로 한 페이지에서 모든 기능을 이용할 수 있게 구현했습니다.

### Components
- db.py : db 접근 관련 모듈
- group.py : 그룹 관련 api 모듈
- place.py : 맛집 관리 api 모듈
- rate.py : 별점 관리 api 모듈

## Screenshots
![image](https://user-images.githubusercontent.com/35682236/127429162-f3ca0900-8cce-4438-ab00-8319cf03b876.png)
![image](https://user-images.githubusercontent.com/35682236/127429193-825d6665-d148-4250-a5e5-f38f284dffb6.png)

