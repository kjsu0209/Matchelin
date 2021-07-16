$(document).ready(function(){
    Kakao.init(config.KAKAO_API_KEY);

})

$('#kakao-login-btn').click(function(){
    // 로그인
    // Kakao.Auth.authorize({
    //   redirectUri: 'http://127.0.0.1:5000/login'
    // });

    window.location.href = URL + '/kakaoauth';
})

$('#kakao-logout').click(function(){
    if (!Kakao.Auth.getAccessToken()) {
      console.log('Not logged in.');
      return;
    }
    Kakao.Auth.logout(function() {
      console.log(Kakao.Auth.getAccessToken());
      alert('로그 아웃');
      // 로그아웃 수행
    });
})