document.addEventListener("deviceready", function() {
  window.plugins.googleplus.login(
    {
      'scopes': 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.upload',
      'webClientId': '523345587538-qc2hifm11bahkije7uqn8gkmiva049ps.apps.googleusercontent.com'
    },
    function(obj) {
      console.log(obj);
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
  $.post("https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.insert&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=http%3A%2F%2Flocalhost%2Foauth2callback&response_type=token&client_id='523345587538-kdjh4roscvfdgmvitekahcdach8e7qd1.apps.googleusercontent.com'",function(token){console.log(token);});
  $(".hidden").removeClass("hidden");
  //console.log(videoData);
  //uploadVideo(videoData);
}

/*
$("#upload").on("click", function() {
  uploadVideo(videoData);
});
*/

function onFail(err) {
  console.log(err);
}
// Read: https://stackoverflow.com/a/31795940/1384283

function uploadVideo(fileURL) {
  //ActivityIndicator.show("Lütfen bekleyin");
  var options = new FileUploadOptions();
  options.fileKey = 'file';
  options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
  options.mimeType = 'video/mpg';
  options.chunkedMode = false;
  options.headers = {
    Authorization: 'Bearer ' + 'ya29.Glu9BSr9DHMms5wRv81ybNt1SnIQmMqoRHNdZoPhwkGMfQFvfDwkmcJ2OjK0vJtPfcGKTfg2-pqU3JXUfJDt2U8BrSHnjTUAYd86KTSR9PNBmImLqU6RxzAuEq8A'
  };
  options.params = {
    "": {
      snippet: {
        title: $("#title").val(),
        description: $("#desc").val(),
        tags: "Pet Kuaför, Kedi Traşı, Köpek Traşı",
        categoryId: 22
      },
      status: {
        privacyStatus: 'public'
      }
    }
  };
  var ft = new FileTransfer();
  ft.upload(fileURL, 'https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status', function (data) {
    console.log('upload success', data);
  }, function (e) {
    console.log('upload error', e);
  }, options, true);
  ft.onprogress = function (progressEvent) {
    console.log('onprogress: ' + ((progressEvent.loaded / progressEvent.total) * 100) + '%');
  };
}
