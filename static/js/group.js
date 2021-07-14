

function addGroup(){
    $("#add-group").css('display', 'block');
}

$("#add-group-submit-btn").click(function(){
    let data = {
        group_name: $('#group_name').val(),
        group_desc: $('#group_desc').val(),
        group_color: $('#group_color').val()
    }

    // api 호출해서 추가하고 그룹 id 받기
    $.ajax({
        'url': 'http://127.0.0.1:5000/group/',
        'data': data,
        'type': 'post',
		'beforeSend': function () {
			// anything you want to have happen before sending the data to the server...
			// useful for "loading" animations
		}
    })
    .done( function (response) {
		// console.log(response);
        alert("그룹을 추가했습니다..");
        // 그룹 정보 창 띄우기
        $("#add-group").css('display', 'none');
        reloadGroup();
	})

    return false;
})



function reloadGroup(){
    $.ajax({
        'url': 'http://127.0.0.1:5000/group/',
        'type': 'get',
		'beforeSend': function () {
			// anything you want to have happen before sending the data to the server...
			// useful for "loading" animations
		}
    })
    .done( function (response) {
		console.log(response);
        // group list item 생성
        $(".group-item").remove();

        let group_list = response['groups']
        for(let i=0; i<group_list.length;i++){
            let g = group_list[i];
            let group_el = "<div class='group-item' onclick=openGroupPage('" + g['_id']+"')" +
                " style='background-color: "+
                g['color']+";"+
                "color: white" +
                "'>" +
                g['group_name'] +
                "</div>";

            $("#group-list").append(group_el);
        }

        // 그룹 추가 버튼
        $("#group-list").append(`<div class="group-item" onclick="addGroup()"><i class="fa fa-plus"></i></div>`);
	})
}

// 그룹 버튼 클릭하면 그룹 정보 콘솔 표시
function openGroupPage(group_id){
    $.ajax({
        'url': 'http://127.0.0.1:5000/group/'+group_id,
        'type': 'get',
		'beforeSend': function () {
			// anything you want to have happen before sending the data to the server...
			// useful for "loading" animations
		}
    })
    .done( function (response) {
        console.log(response);
        let group = response['group'];
        let places = response['places'];
        // 그룹 정보 콘솔 표시
        openconsole("group-info");


        // 그룹 맛집 마커로 표시
        displayMyPlaces(places);
    });


}