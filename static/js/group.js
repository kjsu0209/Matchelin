

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
        'url': URL + '/group/',
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
        'url': URL + '/group/',
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
        'url': URL + '/group/'+group_id,
        'type': 'get',
		'beforeSend': function () {
			// anything you want to have happen before sending the data to the server...
			// useful for "loading" animations
		}
    })
    .done( function (response) {
        let group = response['group'];
        let members = group['member'];
        let places = response['places'];
        // 그룹 정보 콘솔 표시
        openConsole("group-info");

        $(".g-group-name").text(group['group_name']);
        $("#g-group-desc").text(group['desc']);
        $(".member-item").remove();

        members.forEach(function(el, index){
            let obj = $("<div>");
            obj.addClass("member-item");
            obj.text(el);

            $("#g-member-list").append(obj);
        })

        let invite_link = `<div class="member-item" id="invite-code-btn">초대 코드 `+
            `<input type="text" id="invite-code-input" style="border: none;height:100%;" readonly value="`+ group['_id'] +`">&nbsp;<i class="fa fa-copy" onclick="inviteCode()"></i></div>`;
        $("#g-member-list").append(invite_link);

        // 그룹 맛집 마커로 표시
        displayMyPlaces(places, group['color']);

        // 그룹 맛집 랭킹 표시 (평균 4점이 넘어야 하고, 그룹원 모두가 평가해야 한다)
        displayMyPlacesList(places.filter(function(el){
            return el['rate_avg'] >= 4 && el['rate_mber_num'] == members.length;
        }));
    });

}

function inviteCode(){
    var copyText = document.getElementById("invite-code-input");
    copyText.select();
    document.execCommand("Copy");
    showToast("초대 코드가 복사되었습니다.");
}

$('#group_invite_code_submit_btn').click(function(){
    let group_code = $('#group_invite_code_input').val();
    let data = {
        'group_id': group_code
    }
    $.ajax({
        'url': URL + '/group/member',
        'type': 'post',
        'data': data,
		'beforeSend': function () {
			// anything you want to have happen before sending the data to the server...
			// useful for "loading" animations
		}
    })
    .done(function(response){
        if(response['result'] == 'OK'){
            showToast("성공적으로 그룹에 가입했습니다!");
            reloadGroup();
        }
        else{
            showToast(response['errMsg']);
        }
    })


})