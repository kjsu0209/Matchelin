$("#group-btn").click(function(){
    reloadGroup();
    openConsole("group");
})

$("#join-group-btn").click(function(){
    openConsole("join-group");
})

$('#add-place-btn').click(function(){
    openConsole("add-place");

})

$("#home-btn").click(function(){
    openConsole("my-place");
    displayMyPlaces();
})

function openConsole(console){
    // 전부 닫기
    $('#main-console').css('display', 'none');
    $('#group').css('display', 'none');
    $('#add-place').css('display', 'none');
    $('#rate-place').css('display', 'none');
    $('#place-info').css('display', 'none');
    $('#add-group').css('display', 'none');
    $('#group-info').css('display', 'none');
    $('#join-group').css('display', 'none');
    $('#group-timeline').css('display', 'none');

    // target console 열기
    if(console == "main-console"){
        $('#main-console').css('display', 'block');
    }
    else if(console == "group") {
        $('#group').css('display', 'block');
    }
    else if(console == "add-place"){
         $('#add-place').css('display', 'block');
    }
    else if(console == "add-group"){
        $('#add-group').css('display', 'block');

    }
    else if(console == "rate-place"){
        $('#rate-place').css('display', 'block');
    }
    else if(console == "group-info"){
        $('#group-timeline .place-card').remove();
        $('#group-info').css('display', 'block');
        $('#group-timeline').css('display', 'block');
    }
    else if(console == "join-group"){
        $('#join-group').css('display', 'block');
    }
    else if(console == "place-info"){
        $('.timeline-block').remove();
        $('.tl-image-block').remove();
        initPlaceTimeLine();
        getPlaceTimeLine();
        $('#place-info').css('display', 'block');
    }
}

// Toast Message
var toastElList = [].slice.call(document.querySelectorAll('.toast'))
var toastList = toastElList.map(function (toastEl) {
  return new bootstrap.Toast(toastEl, {'delay': 3000})
})

function showToast(msg){
    var myToastEl = document.getElementById('myToastEl')
    var myToast = bootstrap.Toast.getInstance(myToastEl) // Returns a Bootstrap toast instance
    $('.toast-body').text(msg);
    myToast.show();
}
