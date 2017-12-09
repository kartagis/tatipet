document.addEventListener("deviceready", function() {
  navigator.splashscreen.hide();
  $("#login").on("click", function() {
    var name = $('#username').val();
    console.log(name);
    if (!name) {
      navigator.notification.alert("Lütfen kullanıcı adınızı girin.", function(){return;}, "Hata", "Tamam");
      return false;
    }
    var pass = $('#password').val();
    if (!pass) {
      navigator.notification.alert("Lütfen şifrenizi girin.", function(){return;}, "Hata", "Tamam");
      return false;
    }
    $.ajax({
      url: 'http://www.tatipetkuafor.com/services/user/token.json',
      type: 'post',
      dataType: 'json',
      success: function(token) {
        console.log(JSON.stringify(token));
        ActivityIndicator.show("Giriş yapılıyor");
        $.ajax({
          url: 'http://www.tatipetkuafor.com/services/user/login.json',
          type: 'post',
          dataType: 'json',
          data: 'username='+name.trim()+'&password='+pass,
          beforeSend: function(request) {
            request.setRequestHeader("X-CSRF-Token", token.token);
          },
          statusCode: {
            401: function() {
              navigator.notification.alert("Kullanıcı adı ya da şifreniz yanlış", function(){ActivityIndicator.hide();$("#password").val("");$("#username").focus();}, "Hata", "Tamam");
            },
          },
          success: function(res) {
            ActivityIndicator.hide();
            whoami();
            localStorage.setItem('name',res.user.name);
            window.location = 'index.html';
          },
        });
      },
    });
  });
})

function whoami() {
  $.ajax({
    url:'http://www.tatipetkuafor.com/services/system/connect.json',
    type:'post',
    dataType:'json',
    beforeSend:function(r){
      r.setRequestHeader("X-CSRF-Token",localStorage.getItem("token"));
    },
    success:function(data){
      console.log(JSON.stringify(data));
    }
  });
}
