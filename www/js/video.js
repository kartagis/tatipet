document.addEventListener("deviceready", function() {
  window.plugins.googleplus.login(
    {
      'scopes': 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.upload',
      'webClientId': '523345587538-d3chbh8fcqti8sck03uc2as8um1l47r7.apps.googleusercontent.com',
      'offline': true
    },
    function(obj) {
      console.log(obj);
      localStorage.setItem("accessToken",obj.accessToken);
      navigator.notification.alert("Başarıyla giriş yapıldı, şimdi video yükleyebilirsiniz.", function(){return;}, "Tati Pet", "Tamam");
      $("#choose").on("click", function() {
        navigator.camera.getPicture(onVideoSuccess, onFail, {
          quality:100,
          destinationType:Camera.DestinationType.DATA_URL,
          sourceType:Camera.PictureSourceType.PHOTOLIBRARY,
          mediaType:Camera.MediaType.VIDEO
        });
      })
    },
    function (msg) {
      console.log(msg);
      navigator.notification.alert("Giriş yapılamadı.", function(){return;}, "Tati Pet", "Tamam");
    }
  )
});


function onVideoSuccess(videoData) {
  alert(typeof(videoData));
  title = $('#title').val();
  desc = $('#desc').val();
  var invocation = new XMLHttpRequest();
  invocation.open('POST',"https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status");
  invocation.setRequestHeader('Authorization','Bearer '+localStorage.getItem("accessToken"));
  var params = JSON.stringify({
    "snippet":{"content-type":"video/*","title":title,"description":desc,"tags":"Pet Kuaför, Kedi Traşı, Köpek Traşı"},
    "status":{"privacyStatus":"public"}
  })
  invocation.send(videoData);
}

function onFail(err) {
  console.log(err);
}
// Read: https://stackoverflow.com/a/31795940/1384283

/*
function uploadVideo(fileURL, title, desc) {
  ActivityIndicator.show("Lütfen bekleyin");
  var options = new FileUploadOptions();
  options.fileKey = 'file';
  options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
  options.mimeType = 'video/mpg';
  options.chunkedMode = false;
  options.headers = {
    Authorization: 'Bearer ' + localStorage.getItem("accessToken")
  };
  options.params = {
    snippet: {
      //title: localStorage.getItem("title"),
      //description: localStorage.getItem("desc"),
      title: 'title',
      description: 'description',
      tags: ["Pet Kuaför, Kedi Traşı, Köpek Traşı"],
      categoryId: 22
    },
    status: {
      privacyStatus: 'public'
    }
  };
  var ft = new FileTransfer();
  ft.upload(fileURL, 'https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status', function (data) {
    console.log('upload success', data);
    console.log(JSON.parse(data.response).id);
    var id="https://www.youtube.com/watch?v="+JSON.parse(data.response).id;
    console.log(id);
    $.ajax({
      url:'https://www.tatipetkuafor.com/services/user/token.json',
      type:'post',
      dataType:'json',
      success:function(token) {
        console.log(token);
        $.ajax({
          url:'https://www.tatipetkuafor.com/services/node.json',
          type:'post',
          dataType:'json',
          data:'node[type]=video&node[field_url][und][0][video_url]='+id,
          beforeSend:function(request) {
            request.setRequestHeader("X-CSRF-Token", token.token);
          },
          success:function() {
            ActivityIndicator.hide();
            navigator.notification.alert('Video başarıyla yüklendi',function(){return;},'Tatipet','Tamam')
          },
          error:function() {
            ActivityIndicator.hide();
            navigator.notification.alert('Video yüklenemedi',function(){return;},'Tatipet','Tamam')
          },
        })
      }
    })
  }, function (e) {
    console.log('upload error', e);
  }, options, true);
  ft.onprogress = function (progressEvent) {
    console.log('onprogress: ' + ((progressEvent.loaded / progressEvent.total) * 100) + '%');
  };
}
*/

function uploadVideo(fileURL, title, desc) {
}
