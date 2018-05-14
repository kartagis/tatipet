document.addEventListener("deviceready", function() {
  $("#choose").on("click", function() {
    navigator.camera.getPicture(onVideoSuccess, onFail, {
      quality:100,
      destinationType:Camera.DestinationType.DATA_URL,
      sourceType:Camera.PictureSourceType.PHOTOLIBRARY,
      mediaType:Camera.MediaType.VIDEO
    });
  })
})

function onVideoSuccess(videoData) {
  ActivityIndicator.show("Lütfen bekleyin");
  console.log(videoData);
}

function onFail(err) {
  console.log(err);
}
// Read: https://stackoverflow.com/a/31795940/1384283
