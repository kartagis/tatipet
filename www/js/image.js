document.addEventListener("deviceready", function() {
  $("#choose").on("click", function() {
    navigator.camera.getPicture(onImageSuccess, onFail, {
      quality:100,
      destinationType:Camera.DestinationType.DATA_URL,
      sourceType:Camera.PictureSourceType.PHOTOLIBRARY,
      mediaType:Camera.MediaType.PICTURE
    });
  })
  function onImageSuccess(imageData) {
    ActivityIndicator.show("Lütfen bekleyin.");
    var image = $("#image");
    image.attr("src", "data:image/jpeg;base64,"+imageData);
    fileData = {
      "file":{
        "file": imageData,
        "filename": "tatipet.jpg",
        "filepath": "public://"+imageData.replace(/\//g,"").replace(/\+/g,"").slice(-10)+".jpg"
      }
    };
    ActivityIndicator.hide();
    $("#submit").attr("disabled", false);
  }
  function onFail(err) {
    console.log(err);
  }
  $("#submit").on("click", function() {
    slideshowVal=$("#flatCheckbox").is(":checked")?1:0;
    console.log(slideshowVal);
    $.ajax({
      url: "https://www.tatipetkuafor.com/services/user/token.json",
      type: "post",
      dataType: "json",
      success: function(token) {
        $.ajax({
          url: "https://www.tatipetkuafor.com/services/file.json",
          type: "post",
          dataType: "json",
          data: fileData,
          beforeSend: function(r) {
            r.setRequestHeader("X-CSRF-Token", token.token);
          },
          success: function(res) {
            ActivityIndicator.show("Fotoğraf yükleniyor, lütfen bekleyin.");
            $.ajax({
              url: "https://www.tatipetkuafor.com/services/node.json",
              type: "post",
              dataType: "json",
              beforeSend: function(r) {
                r.setRequestHeader("X-CSRF-Token", token.token);
              },
              data: 'node[type]=fotograf&node[status]=1&node[field_gorsel][und][0][fid]='+res.fid+'&node[field_slideshow][und][0][value]='+slideshowVal,
              success: function done() {
                ActivityIndicator.hide();
                navigator.notification.alert("Fotoğraf başarıyla yüklendi", function(){return;}, "Tati Pet", "Tamam");
              }
            })
          }
        })
      }
    })
  })
});
