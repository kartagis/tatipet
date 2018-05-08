document.addEventListener("deviceready", function() {
  console.log(FileTransfer);
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
