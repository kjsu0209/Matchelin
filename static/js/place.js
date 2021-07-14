
function addPlaceForm(num){
    let data = {
        place_name: $(num).parent().children('[name="place_name"]').val(),
        latitude: $(num).parent().children('[name="latitude"]').val(),
        longitude: $(num).parent().children('[name="longitude"]').val(),
        address_name: $(num).parent().children('[name="address_name"]').val(),
        phone: $(num).parent().children('[name="phone"]').val(),
    }
    let cardId = data["latitude"] + '' + data["longitude"];

    // api 호출해서 추가하고 장소 id 받기
	$.ajax({
		'url': 'http://127.0.0.1:5000/place/',
		'data': data,
		'type': 'post',
		'beforeSend': function () {
			// anything you want to have happen before sending the data to the server...
			// useful for "loading" animations
		}
	})
	.done( function (response) {
		console.log(response);

	})

    // 추가 정보 입력창 띄우기
    $('#add-place').css('display', 'none');
    // 맛집 정보 카드 선택한 지도 빼고 지우기
    let list = $('.place-card').toArray();
    for(let i=0;i<list.length;i++){
        if(list[i].id != cardId){
            list[i].remove();
        }
    }
    $('#rate-place').css('display', 'block');

    return false;
}


$("#rate-place-btn").click(function(){
    let data = {
        latitude: $('[name="latitude"]').val(),
        longitude: $('[name="longitude"]').val(),
        point: getCurrentStarIndex() // 별점 개수 세기
    }

    // ajax PUT
    $.ajax({
		'url': 'http://127.0.0.1:5000/place/',
		'data': data,
		'type': 'put',
		'beforeSend': function () {
			// anything you want to have happen before sending the data to the server...
			// useful for "loading" animations
		}
	})
	.done( function (response) {
		// console.log(response);
		alert("맛집 평가 완료");
		displayMyPlaces();
	})
});