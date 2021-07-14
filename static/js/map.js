const container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
const options = { //지도를 생성할 때 필요한 기본 옵션
    center: new kakao.maps.LatLng(33.450701,126.570667 ), //지도의 중심좌표.
    level: 3 //지도의 레벨(확대, 축소 정도)
};

const map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

function moveCurruntPos(){
	let location = {'lat' : 33.450701, 'lng' : 126.570667};
	if (navigator.geolocation) { // GPS를 지원하면
        navigator.geolocation.getCurrentPosition(function(position) {

          // 지도 움직이기
          map.panTo(new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude));

    }, function(error) {
      console.error(error);
    }, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: Infinity
    });
  } else {
    alert('GPS를 지원하지 않습니다');
  }
}

// place //
var markers = [];

// 장소 검색 객체를 생성합니다
var ps = new kakao.maps.services.Places();

// 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
var infowindow = new kakao.maps.InfoWindow({zIndex:1});


// 키워드 검색을 요청하는 함수입니다
function searchPlaces() {

    var keyword = document.getElementById('keyword').value;

    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        alert('키워드를 입력해주세요!');
        return false;
    }

    // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
    ps.keywordSearch( keyword, placesSearchCB);
}

// 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {

        // 정상적으로 검색이 완료됐으면
        // 검색 목록과 마커를 표출합니다
        displayPlaces(data);


    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {

        alert('검색 결과가 존재하지 않습니다.');
        return;

    } else if (status === kakao.maps.services.Status.ERROR) {

        alert('검색 결과 중 오류가 발생했습니다.');
        return;

    }
}

// 나의 맛집 마커 표출하는 함수입니다
function displayMyPlaces(){
    // 검색 결과 목록에 추가된 항목들을 제거합니다
    removeAllChildNods();

    // 지도에 표시되고 있는 마커를 제거합니다
    removeMarker();

    // api 호출해서 추가하고 장소 id 받기
	$.ajax({
		'url': 'http://127.0.0.1:5000/place/',
		'type': 'get',
		'beforeSend': function () {
			// 로딩중 표시
		}
	})
	.done( function (response) {
		let places = response['places'];

		for(let i=0; i<places.length;i++){
            let place = places[i]['place_data'];
		    var placePosition = new kakao.maps.LatLng(place.lat, place.lng),
                marker = addMarker(placePosition, i, 'myplace');

		    (function(marker, title) {
                kakao.maps.event.addListener(marker, 'mouseover', function() {
                    displayInfowindow(marker, title);
                });

                kakao.maps.event.addListener(marker, 'mouseout', function() {
                    infowindow.close();
                });

            })(marker, place.place_name);
        }
	})

}



// 검색 결과 목록과 마커를 표출하는 함수입니다
function displayPlaces(places) {
    var scrollArea = document.getElementById('scroll-area'),
    bounds = new kakao.maps.LatLngBounds(),
    listStr = '';

    // 검색 결과 목록에 추가된 항목들을 제거합니다
    removeAllChildNods(scrollArea);

    // 지도에 표시되고 있는 마커를 제거합니다
    removeMarker();

    for ( var i=0; i<places.length; i++ ) {

        // 마커를 생성하고 지도에 표시합니다
        var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
            marker = addMarker(placePosition, i),
            itemEl = getListItemCustom(i, places[i]); // 검색 결과 항목 Element를 생성합니다

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        bounds.extend(placePosition);

        // 마커와 검색결과 항목에 mouseover 했을때
        // 해당 장소에 인포윈도우에 장소명을 표시합니다
        // mouseout 했을 때는 인포윈도우를 닫습니다
        (function(marker, title) {
            kakao.maps.event.addListener(marker, 'mouseover', function() {
                displayInfowindow(marker, title);
            });

            kakao.maps.event.addListener(marker, 'mouseout', function() {
                infowindow.close();
            });

            itemEl.onmouseover =  function () {
                displayInfowindow(marker, title);
            };

            itemEl.onmouseout =  function () {
                infowindow.close();
            };
        })(marker, places[i].place_name);

        //$('#scroll-area').append(itemEl);
        listStr += itemEl;
    }

    $('#scroll-area').append(listStr);

    // 검색결과 항목들을 검색결과 목록 Elemnet에 추가합니다
    scrollArea.scrollTop = 0;

    // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
    map.setBounds(bounds);
}

// 검색결과 항목을 Element로 반환하는 함수입니다
function getListItemCustom(index, places){
    let itemStr = '<div class="card place-card" id="' + places.y + ''+ places.x +'">' +
                '<form class="add-place-form" action="/place" method="post">'+
        '<input type="hidden" value="' + places.place_name +'" name="place_name" >' +
        '<input type="hidden" value="' + places.y +'" name="latitude">' +
        '<input type="hidden" value="' + places.x +'" name="longitude">' +
        '<input type="hidden" value="' + places.address_name +'" name="address_name">' +
        '<input type="hidden" value="' + places.phone +'" name="phone">' +

        '<div id="btn-' + (index+1) + '" class="submit-add-place-form add-this-place-btn" onclick="addPlaceForm(`#btn-'+ (index+1)+'`)"><i class="fa fa-plus"></i></div>' +
        '</form>' +
        '<span class="markerbg marker_' + (index+1) + '"></span>' +
                '<div class="card-body">' +
                '<h5>' + places.place_name + '</h5>';

    if (places.road_address_name) {
        itemStr += '    <span>' + places.road_address_name + '</span>' +
                    '   <span class="jibun gray">' +  places.address_name  + '</span>';
    } else {
        itemStr += '    <span>' +  places.address_name  + '</span>';
    }

      itemStr += '  <span class="tel">' + places.phone  + '</span>' +
                '</div></div>';
    return itemStr;
}


// 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
function addMarker(position, idx, mode) {

    var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png' // 마커 이미지 url, 스프라이트 이미지를 씁니다

    var imageSize = new kakao.maps.Size(36, 37); // 마커 이미지의 크기
    var imgOptions =  {
            spriteSize : new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
            spriteOrigin : new kakao.maps.Point(0, (idx*46)+10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
            offset: new kakao.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
        };

    if(mode == 'myplace'){
        imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';
        imageSize = new kakao.maps.Size(24, 35);
        imgOptions = {}
    }


    var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
            marker = new kakao.maps.Marker({
            position: position, // 마커의 위치
            image: markerImage
        });

    marker.setMap(map); // 지도 위에 마커를 표출합니다
    markers.push(marker);  // 배열에 생성된 마커를 추가합니다

    return marker;
}

// 지도 위에 표시되고 있는 마커를 모두 제거합니다
function removeMarker() {
    for ( var i = 0; i < markers.length; i++ ) {
        markers[i].setMap(null);
    }
    markers = [];
}


// 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
// 인포윈도우에 장소명을 표시합니다
function displayInfowindow(marker, title) {
    let pos = marker.getPosition();
    let place_id = pos['Ma'] + '' + pos['La'];

    $.ajax({
		'url': 'http://127.0.0.1:5000/place/'+place_id,
		'type': 'get',
		'beforeSend': function () {
			// anything you want to have happen before sending the data to the server...
			// useful for "loading" animations
		}
	})
	.done( function (response) {
		let info = response['place'];
		let content = '<div style="padding:5px;z-index:1;">' + title + '';
		if(info != null){
            content += '<br><span><i class="fa fa-star" style="color: #F4D03F;"></i> '+ info['rate_avg'] +'</span>' +
            '</div>';
        }
		else{
		    content += '</div>';
        }


        infowindow.setContent(content);
        infowindow.open(map, marker);
	})

}

 // 검색결과 목록의 자식 Element를 제거하는 함수입니다
function removeAllChildNods(el) {
    $('.place-card').remove();
}

$(document).ready(function(){
	moveCurruntPos();

})