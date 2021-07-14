// star marking api

let init = "<div class='star-rate'></div>"

// 랜덤으로 이모지를 리턴하는 함수
function getRandomShape(){
    let starShapes = ['🍕','🍔','🍟','🌭','🍳',
        '🥗','🥙','🥪','🍗','🍖','🍙','🍜','🍣',
        '🍦','🍪','🍰','☕','🍻','🍽','🍉','🍈','🍌',
        '🍍','🍎','🌽','🍓','🥑','😋','😍','🥰','😘','🐷','❤', '👍','⭐'];

    let randNum = Math.ceil(Math.random() *(starShapes.length))-1;

    return starShapes[randNum];
}

const notStar = '-';
const star = getRandomShape();

// star event
function getCurrentStarIndex(){
    let index = 1;
    for(let i=1;i<=5;i++){
        let id = '#star-' + i;
        if($(id).text() === notStar){
            break;
        }
        index = i;
    }
    return index;
}

let starIndex = getCurrentStarIndex();
$('.star-item').hover(function () {
    let index = parseInt($(this).attr('id').split('-')[1]);
    for(let i=1;i<=index;i++){
        let id = '#star-' + i;
        $(id).text(star);
    }
    for(let j=index+1;j<=5;j++){
        let id = '#star-' + j;
        $(id).text(notStar);
    }
}, function(){
    let index = starIndex;
    for(let i=1;i<=index;i++){
        let id = '#star-' + i;
        $(id).text(star);
    }
    for(let j=index+1;j<=5;j++){
        let id = '#star-' + j;
        $(id).text(notStar);
    }
});


$('.star-item').click(function(){
    let index = parseInt($(this).attr('id').split('-')[1]);
    starIndex = index;
    for(let i=1;i<=index;i++){
        let id = '#star-' + i;
        $(id).text(star);
    }
    for(let j=index+1;j<=5;j++){
        let id = '#star-' + j;
        $(id).text(notStar);
    }
})



