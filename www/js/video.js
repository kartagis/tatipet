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
        navigator.camera.getPicture(uploadVideo, onFail, {
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

function onVideoSuccess(file) {
  title = $('#title').val();
  desc = $('#desc').val();
  ActivityIndicator.show("Lütfen bekleyin");
  var metadata = createResource({
    'snippet.title': title,
    'snippet.description': desc,
    'snippet.tags[]': 'Pet Kuaför, Kedi Traşı, Köpek Traşı',
    'snippet.categoryId': '22',
    'snippet.defaultLanguage': 'tr',
    'status.embeddable': '',
    'status.license': '',
    'status.privacyStatus': 'public',
    'status.publicStatsViewable': ''
  });
  var params = {'part': 'snippet,status'};
  var uploader = new MediaUploader({
    baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
    file: file,
    token: localStorage.getItem('accessToken'),
    metadata: metadata,
    params: params,
    onError: function(data) {
      var message = data;
      try {
        var errorResponse = JSON.parse(data);
        message = errorResponse.error.message;
      } finally {
        alert(message);
      }
    }.bind(this),
    onProgress: function(data) {
      var currentTime = Date.now();
      console.log('Progress: ' + data.loaded + ' bytes loaded out of ' + data.total);
      var totalBytes = data.total;
    }.bind(this),
    onComplete: function(data) {
      var uploadResponse = JSON.parse(data);
      console.log('Upload complete for video ' + uploadResponse.id);
    }.bind(this)
  });
  uploader.upload();
}
function createResource(properties) {
  var resource = {};
  var normalizedProps = properties;
  for (var p in properties) {
    var value = properties[p];
    if (p && p.substr(-2, 2) == '[]') {
      var adjustedName = p.replace('[]', '');
      if (value) {
        normalizedProps[adjustedName] = value.split(',');
      }
      delete normalizedProps[p];
    }
  }
  for (var p in normalizedProps) {
    // Leave properties that don't have values out of inserted resource.
    if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
      var propArray = p.split('.');
      var ref = resource;
      for (var pa = 0; pa < propArray.length; pa++) {
        var key = propArray[pa];
        if (pa == propArray.length - 1) {
          ref[key] = normalizedProps[p];
        } else {
          ref = ref[key] = ref[key] || {};
        }
      }
    };
  }
  return resource;
}
var RetryHandler = function() {
  this.interval = 1000; // Start at one second
  this.maxInterval = 60 * 1000; // Don't wait longer than a minute
};

/**
* Invoke the function after waiting
*
* @param {function} fn Function to invoke
*/
RetryHandler.prototype.retry = function(fn) {
  setTimeout(fn, this.interval);
  this.interval = this.nextInterval_();
};

/**
* Reset the counter (e.g. after successful request.)
*/
RetryHandler.prototype.reset = function() {
  this.interval = 1000;
};

/**
* Calculate the next wait time.
* @return {number} Next wait interval, in milliseconds
*
* @private
*/
RetryHandler.prototype.nextInterval_ = function() {
  var interval = this.interval * 2 + this.getRandomInt_(0, 1000);
  return Math.min(interval, this.maxInterval);
};

/**
* Get a random int in the range of min to max. Used to add jitter to wait times.
*
* @param {number} min Lower bounds
* @param {number} max Upper bounds
* @private
*/
RetryHandler.prototype.getRandomInt_ = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

var MediaUploader = function(options) {
  var noop = function() {};
  this.file = options.file;
  this.contentType = options.contentType || this.file.type || 'application/octet-stream';
  this.metadata = options.metadata || {
    'title': this.file.name,
    'mimeType': this.contentType
  };
  this.token = options.token;
  this.onComplete = options.onComplete || noop;
  this.onProgress = options.onProgress || noop;
  this.onError = options.onError || noop;
  this.offset = options.offset || 0;
  this.chunkSize = options.chunkSize || 0;
  this.retryHandler = new RetryHandler();

  this.url = options.url;
  if (!this.url) {
    var params = options.params || {};
    params.uploadType = 'resumable';
    this.url = this.buildUrl_(options.fileId, params, options.baseUrl);
  }
  this.httpMethod = options.fileId ? 'PUT' : 'POST';
};

/**
* Initiate the upload.
*/
MediaUploader.prototype.upload = function() {
  var self = this;
  var xhr = new XMLHttpRequest();

  xhr.open(this.httpMethod, this.url, true);
  xhr.setRequestHeader('Authorization', 'Bearer ' + this.token);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('X-Upload-Content-Length', this.file.size);
  xhr.setRequestHeader('X-Upload-Content-Type', this.contentType);

  xhr.onload = function(e) {
    if (e.target.status < 400) {
      var location = e.target.getResponseHeader('Location');
      this.url = location;
      this.sendFile_();
    } else {
      this.onUploadError_(e);
    }
  }.bind(this);
  xhr.onerror = this.onUploadError_.bind(this);
  xhr.send(JSON.stringify(this.metadata));
};

/**
* Send the actual file content.
*
* @private
*/
MediaUploader.prototype.sendFile_ = function() {
  var content = this.file;
  console.log(content);
  var end = this.file.size;

  if (this.offset || this.chunkSize) {
    // Only slice the file if we're either resuming or uploading in chunks
    if (this.chunkSize) {
      end = Math.min(this.offset + this.chunkSize, this.file.size);
    }
    content = content.slice(this.offset, end);
    console.log(content);
  }

  var xhr = new XMLHttpRequest();
  xhr.open('PUT', this.url, true);
  xhr.setRequestHeader('Content-Type', this.contentType);
  xhr.setRequestHeader('Content-Range', 'bytes ' + this.offset + '-' + (end - 1) + '/' + this.file.size);
  xhr.setRequestHeader('X-Upload-Content-Type', this.file.type);
  if (xhr.upload) {
    xhr.upload.addEventListener('progress', this.onProgress);
  }
  xhr.onload = this.onContentUploadSuccess_.bind(this);
  xhr.onerror = this.onContentUploadError_.bind(this);
  xhr.send(content);
};

/**
* Query for the state of the file for resumption.
*
* @private
*/
MediaUploader.prototype.resume_ = function() {
  var xhr = new XMLHttpRequest();
  xhr.open('PUT', this.url, true);
  xhr.setRequestHeader('Content-Range', 'bytes */' + this.file.size);
  xhr.setRequestHeader('X-Upload-Content-Type', this.file.type);
  if (xhr.upload) {
    xhr.upload.addEventListener('progress', this.onProgress);
  }
  xhr.onload = this.onContentUploadSuccess_.bind(this);
  xhr.onerror = this.onContentUploadError_.bind(this);
  xhr.send();
};

/**
* Extract the last saved range if available in the request.
*
* @param {XMLHttpRequest} xhr Request object
*/
MediaUploader.prototype.extractRange_ = function(xhr) {
  var range = xhr.getResponseHeader('Range');
  if (range) {
    this.offset = parseInt(range.match(/\d+/g).pop(), 10) + 1;
  }
};

/**
* Handle successful responses for uploads. Depending on the context,
* may continue with uploading the next chunk of the file or, if complete,
* invokes the caller's callback.
*
* @private
* @param {object} e XHR event
*/
MediaUploader.prototype.onContentUploadSuccess_ = function(e) {
  if (e.target.status == 200 || e.target.status == 201) {
    this.onComplete(e.target.response);
  } else if (e.target.status == 308) {
    this.extractRange_(e.target);
    this.retryHandler.reset();
    this.sendFile_();
  }
};

/**
* Handles errors for uploads. Either retries or aborts depending
* on the error.
*
* @private
* @param {object} e XHR event
*/
MediaUploader.prototype.onContentUploadError_ = function(e) {
  if (e.target.status && e.target.status < 500) {
    this.onError(e.target.response);
  } else {
    this.retryHandler.retry(this.resume_.bind(this));
  }
};

/**
* Handles errors for the initial request.
*
* @private
* @param {object} e XHR event
*/
MediaUploader.prototype.onUploadError_ = function(e) {
  this.onError(e.target.response); // TODO - Retries for initial upload
};

/**
* Construct a query string from a hash/object
*
* @private
* @param {object} [params] Key/value pairs for query string
* @return {string} query string
*/
MediaUploader.prototype.buildQuery_ = function(params) {
  params = params || {};
  return Object.keys(params).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
};

/**
* Build the upload URL
*
* @private
* @param {string} [id] File ID if replacing
* @param {object} [params] Query parameters
* @return {string} URL
*/
MediaUploader.prototype.buildUrl_ = function(id, params, baseUrl) {
  var url = baseUrl;
  if (id) {
    url += id;
  }
  var query = this.buildQuery_(params);
  if (query) {
    url += '?' + query;
  }
  return url;
};

function onFail(err) {
  console.log(err);
}
// Read: https://stackoverflow.com/a/31795940/1384283

function uploadVideo(fileURL) {
  title = $('#title').val();
  desc = $('#desc').val();
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
    "": {
      snippet: {
        title: title,
        description: desc,
        tags: 'Pet Kuaför, Kedi Traşı, Köpek Traşı',
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
    var id = "https://www.youtube.com/watch?v="+JSON.parse(data.response).id;
    $.ajax({
      url: 'https://www.tatipetkuafor.com/services/user/token.json',
      type: 'post',
      dataType: 'json',
      success: function(token) {
        ActivityIndicator.show("Giriş yapılıyor");
        $.ajax({
          url: 'https://www.tatipetkuafor.com/services/node.json',
          type: 'post',
          dataType: 'json',
          data: 'node[type]=video&node[field_url][und][0][video_url]='+id,
          beforeSend: function(request) {
            request.setRequestHeader("X-CSRF-Token", token.token);
          },
          success: function(res) {
            ActivityIndicator.hide();
            navigator.notification.alert("Video başarıyla yüklendi.", function(){return;}, "Tati Pet", "Tamam");
          },
        });
      },
    });
  }, function (e) {
    navigator.notification.alert("Video yüklenemedi, daha sonra tekrar deneyin.", function(){return;}, "Tati Pet", "Tamam");
  }, options);
  ft.onprogress = function (progressEvent) {
    console.log('onprogress: ' + ((progressEvent.loaded / progressEvent.total) * 100) + '%');
  };
}
