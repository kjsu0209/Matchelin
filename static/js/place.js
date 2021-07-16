
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
		'url': URL + '/place/',
		'data': data,
		'type': 'post',
		'beforeSend': function () {
			// anything you want to have happen before sending the data to the server...
			// useful for "loading" animations
		}
	})
	.done( function (response) {
		//console.log(response);

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
		'url': URL + '/place/',
		'data': data,
		'type': 'put',
		'beforeSend': function () {
			// anything you want to have happen before sending the data to the server...
			// useful for "loading" animations
		}
	})
	.done( function (response) {
		// console.log(response);
		showToast("맛집 평가가 완료되었습니다.");
		openConsole("add-place");
		$(".wrap").remove();
		displayMyPlaces();
	})
});

var count = 1;

function loadNewPlaceTimeline(){
    if($('#place-info').css('display') == 'block' && count < 50){
        //추가되는 임시 콘텐츠
        getPlaceTimeLine();
        count++;
    }
}

function initPlaceTimeLine(){
    count = 1;
}

function getPlaceTimeLine(){
    let loadMore = '<div id="load-more-place-timeline" onclick="loadNewPlaceTimeline()" class="btn"><i class="fa fa-plus"></i>&nbsp; 더 많은 정보 불러오기</div>';

     $.ajax({
        'url': URL+'/place/timeline/'+$('#place-info-title').text()+"/"+count,
        'type': 'get',
        'beforeSend': function () {
            // anything you want to have happen before sending the data to the server...
            // useful for "loading" animations
        }
    })
    .done( function (response) {
        // console.log(response);
        if(response['result'] == 'OK'){
            $('#load-more-place-timeline').remove();

            // image 4개, blog 게시물 2개 추가
            let images = response['images']
            for(let i=0;i<images.length;i++){
                let imageEl = getImageTimelineEl(images[i]);
                $('#place-timeline').append(imageEl);
            }
            let blogs = response['blogs']
            for(let i=0;i<blogs.length;i++){
                let blogEl = getBlogTimelineEl(blogs[i]);
                $('#place-timeline').append(blogEl);
            }

            $('#place-timeline').append(loadMore);
        }
        else{
            showToast("더 이상 로드할 게시물이 없습니다.");
        }

    })
}


// 타임라인에 표시할 이미지 객체 생성
function getImageTimelineEl(image){
    let el = $("<div>");
    el.addClass("g-2 tl-image-block");
    el.css("overflow", "hidden");

    let link = $("<a>");
    link.attr("href", image['doc_url']);

    let img = $("<img>");
    img.attr("src", image['thumbnail_url']);
    img.css("width", "100%");
    link.append(img);

    el.append(link);
    return el;
}

// 타임라인에 표시할 blog 객체 생성
function getBlogTimelineEl(blog){
    let el = $("<div>");
    el.addClass("timeline-block tl-blog-block");

    let link = $("<a>");
    link.attr("href", blog['url']);

    let title = $("<h5>");
    title.css("font-weight", "bold");
    title.css("font-size", "1rem");
    title.html(blog['title']);
    link.append(title);

    let content = $("<span>");
    content.html(blog['contents']);
    content.css("font-size", "12px");
    content.css("text-overflow", "ellipsis");
    link.append(content);

    el.append(link);

    return el;
}

