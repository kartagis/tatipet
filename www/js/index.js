document.addEventListener("deviceready", function() {
  //navigator.splashscreen.show();
  //checkNetworkConnection();
  if (!localStorage.getItem("name")) {
    window.location = "login.html";
  } else {
    navigator.splashscreen.hide()
    $("#login").hide();
  }
});

function checkNetworkConnection() {
  if (navigator.connection.type == 'none') {
    navigator.notification.alert('İnternet bağlantınızı kontrol edin',function(){return;},'TatiPet','Tamam');
  }
}

function logout() {
  navigator.notification.confirm("Çıkış yapmak istiyor musunuz?", function(buttonIndex) {
    if (buttonIndex === 1) {
      ActivityIndicator.show("Çıkış yapılıyor, lütfen bekleyin");
      $.ajax({
        url: 'http://www.tatipetkuafor.com/services/user/token.json',
        type: 'post',
        dataType: 'json',
        success: function(token) {
          $.ajax({
            url: 'http://www.tatipetkuafor.com/services/user/logout.json',
            type: 'post',
            dataType: 'json',
            beforeSend: function(r) {
              r.setRequestHeader("X-CSRF-Token", token.token);
            },
            success: function() {
              ActivityIndicator.hide();
              localStorage.clear();
              window.location="login.html";
            }
          });
        }
      });
    }
  }, 'Onay', ['Evet', 'Hayır']);
}

function whoami() {
  $.ajax({
    url:'http://www.tatipetkuafor.com/services/user/token.json',
    type:'post',
    dataType:'json',
    success:function(token){
      $.ajax({
        url:'http://www.tatipetkuafor.com/services/system/connect.json',
        type:'post',
        dataType:'json',
        beforeSend:function(r){
          r.setRequestHeader("X-CSRF-Token",token.token);
        },
        success:function(data){
          console.log(JSON.stringify(data));
        }
      });
    }
  });
}
