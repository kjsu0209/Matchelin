$("#group-btn").click(function(){
    reloadGroup();
    openConsole("group");
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
    $('#add-group').css('display', 'none');

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


}