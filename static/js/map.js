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
		'url': URL + '/place/',
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

		    (function(marker, place) {
                kakao.maps.event.addListener(marker, 'mouseover', function() {
                    displayInfowindow(marker, place);
                });

                kakao.maps.event.addListener(marker, 'mouseout', function() {
                    infowindow.close();
                });

            })(marker, places[i]);
		    addCustomOverlay(marker, places[i]);
        }
	})

}

function addCustomOverlay(marker, place){
    // 커스텀 오버레이
    // 커스텀 오버레이에 표시할 컨텐츠 입니다
    // 커스텀 오버레이는 아래와 같이 사용자가 자유롭게 컨텐츠를 구성하고 이벤트를 제어할 수 있기 때문에
    // 별도의 이벤트 메소드를 제공하지 않습니다

    let content = '<div class="wrap">' +
                '    <div class="info">' +
                '        <div class="title">' +
                            place["place_data"]["place_name"] +
                '               <span style="position:absolute;right:1rem;font-size:1rem;"><i class="fa fa-star" style="color: #F4D03F;"></i> '+ place['rate_avg'] +'</span>' +
                '        </div>' +
                '        <div class="body" style="padding:1rem;">' +
                '               <input type="hidden" value="' + place['place_data']['lat'] +'" name="latitude">' +
                '               <input type="hidden" value="' + place['place_data']['lng'] +'" name="longitude">' +
                '                <div class="ellipsis">'+ place["place_data"]["address_name"] +'</div>' +
                '                <div class="jibun ellipsis">Tel: ' + place["place_data"]["phone"] +'</div>' +
                '                <div class="hover-the-rainbow" onclick="openConsole(`rate-place`)">❤맛집 평가하기</div>' +
                '        </div>' +
                '    </div>' +
                '</div>';

    // 마커 위에 커스텀오버레이를 표시합니다
    // 마커를 중심으로 커스텀 오버레이를 표시하기위해 CSS를 이용해 위치를 설정했습니다
    let overlay = new kakao.maps.CustomOverlay({
        content: content,
        map: map,
        clickable: true,
        position: marker.getPosition()
    });
    overlay.setVisible(false);
    // 마커를 클릭했을 때 커스텀 오버레이를 표시합니다
    kakao.maps.event.addListener(marker, 'click', function() {
        if(overlay.getVisible())
            overlay.setVisible(false);
        else{
            overlay.setVisible(true);
            $("#place-info-title").text(place['place_data']['place_name']);
            openConsole('place-info');
        }
    });


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
            marker = addMarker(placePosition, i, "add-place"),
            itemEl = getListItemCustom(i, places[i]); // 검색 결과 항목 Element를 생성합니다

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        bounds.extend(placePosition);

        // 마커와 검색결과 항목에 mouseover 했을때
        // 해당 장소에 인포윈도우에 장소명을 표시합니다
        // mouseout 했을 때는 인포윈도우를 닫습니다
        (function(marker, title) {
            kakao.maps.event.addListener(marker, 'mouseover', function() {
                displayInfowindowWithTitle(marker, title);
            });

            kakao.maps.event.addListener(marker, 'mouseout', function() {
                infowindow.close();
            });

            itemEl.onmouseover =  function () {
                displayInfowindowWithTitle(marker, title);
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


function displayMyPlacesList(places, color){
    for(let idx=0; idx<places.length; idx++){
        let el = placeListElementFactory(places[idx], color);

        $('#group-timeline').append(el);
    }
}

function placeListElementFactory(place_info, color){
    let place = place_info['place_data'];
    let el = $('<div>');
    el.addClass('card place-card');
    el.css('border-left', '3px solid '+color);

    let content = $('<div>');
    content.addClass('card-body');
    content.append('<h5>' + place.place_name + '</h5>');
    content.append('<p style="position: absolute; right: 2rem; top: 1rem;"><i class="fa fa-star" style="color: #f6c933;"></i> ' + place_info.rate_avg + '</p>');
    content.append('<span>' + place.address_name + '</span>');
    content.append('<span>' + place.phone + '</span>');

    el.append(content);

    // 클릭하면 해당 위치로 zoom하는 이벤트 추가
    el.click(function(){
        map.panTo(new kakao.maps.LatLng(place['lat'], place['lng']));
        map.setLevel(2);
    })

    return el;
}


// 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
function addMarker(position, idx, mode) {

    let imageSrc = '';
    let imageSize;
    let imgOptions = {}

    if(mode == 'myplace'){
        imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';
        imageSize = new kakao.maps.Size(24, 35);
    }
    else if(mode == 'add-place'){
        imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png'
        imageSize = new kakao.maps.Size(36, 37); // 마커 이미지의 크기
        imgOptions =  {
            spriteSize : new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
            spriteOrigin : new kakao.maps.Point(0, (idx*46)+10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
            offset: new kakao.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
        };
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
function displayInfowindow(marker, place_info) {
    if(place_info['place_data'] != null){
        let place = place_info['place_data']; // 해당 맛집의 kakao map 정보
        let content = '<div style="padding:5px;z-index:1;">' + place['place_name'] + '';

        if(place_info['rate_avg'] != null){
            content += '<br><span><i class="fa fa-star" style="color: #F4D03F;"></i> '+ place_info['rate_avg'] +'</span>' +
            '</div>';
        }
        else{
            content += '</div>';
        }

        infowindow.setContent(content);
        infowindow.open(map, marker);
    }
    else{ // 맛집 정보가 마커에 바인딩되지 않는 경우
        displayInfowindowWithTitle(marker, place_info);
    }
}

function displayInfowindowWithTitle(marker, title) {
    var content = '<div style="padding:5px;z-index:1;">' + title + '</div>';

    infowindow.setContent(content);
    infowindow.open(map, marker);
}




 // 검색결과 목록의 자식 Element를 제거하는 함수입니다
function removeAllChildNods(el) {
    $('.place-card').remove();
}




$(document).ready(function(){
	moveCurruntPos();

})