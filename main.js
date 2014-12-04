
"use strict";




var Context = window.AudioContext || window.webkitAudioContext;
var context = new Context();
var clip1 = new audioLooperClip(context),
    clip2 = new audioLooperClip(context),
    clip3 = new audioLooperClip(context),
    clip4 = new audioLooperClip(context);
var impulse = {};
impulse.buffer = null;


var mediaStream;
var rec;
var blob;
var tempClip;
var loopDuration = 10;
var trackWidth;
var clipCount = 0;

//WUT ARE WE DOIN DAWG
//STEP 1 lets reformat all our tracks into clips - DONE
//STEP 2 make a seperate function for recording and storing clips
// and loading soundfiles #DONE
//STEP 3 Make clips draggable




var recordState = {
  NOT_RECORDING :0,
  RECORDING_1: 1,
  RECORDING_2: 2,
  RECORDING_3: 3,
  RECORDING_4: 4
};

function audioLooperClip(con){
  this.gainNode = con.createGain();
  this.convolver = null;
  this.gainNode.gain.value = .5;
  this.buffer = null;
  this.reverberating = false;
  this.context = con;
  this.clipDivId = null;
  this.play = function(){
    var source = this.context.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.gainNode);
    if(this.reverberating){
      this.convolver = context.createConvolver();
      this.convolver.buffer = impulse.buffer;
      this.gainNode.connect(this.convolver);
      this.convolver.connect(this.context.destination);
    } else if(this.convolver){
      this.gainNode.disconnect(0);
      this.convolver.disconnect(0);
      this.gainNode.connect(this.context.destination);
    }
    else{
      this.gainNode.connect(this.context.destination);
    }
    var sTime = this.calcStartTime() + this.context.currentTime;
    source.start(sTime);
    source.onended = function(){
      source.stop();
    }
  };
  this.calcStartTime = function(){
    var pos = parseFloat($("#"+this.clipDivId).css("left").split("p")[0]);
    var startTime = (pos/trackWidth) * loopDuration;
    console.log(startTime);
    return startTime;
  }
}

var navigator = window.navigator;
navigator.getUserMedia = (
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia
);

var recState = recordState.NOT_RECORDING;

function loadAudioFile(url, object){
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  request.onload = function(){
    context.decodeAudioData(request.response, function(buffer){
      object.buffer = buffer;
    });
  };
  request.send();
}

(function init(){
  loadAudioFile("audio/TijuanaMall.wav", impulse);
}());

function record() {
  // ask for permission and start recording
  navigator.getUserMedia({audio: true}, function(localMediaStream){
    mediaStream = localMediaStream;

    // create a stream source to pass to Recorder.js
    var mediaStreamSource = context.createMediaStreamSource(localMediaStream);

    // create new instance of Recorder.js using the mediaStreamSource
    rec = new Recorder(mediaStreamSource, {
      // pass the path to recorderWorker.js file here
      workerPath: "lib/recorderjs/recorderWorker.js"
    });

    // start recording
    rec.record();
  }, function(err){
    console.log('Browser not supported');
  });
}

function stop(clip) {
  // stop the media stream
  mediaStream.stop();

  // stop Recorder.js
  rec.stop();

  //export it to WAV
  rec.exportWAV(function(e){
    rec.clear();
    //Recorder.forceDownload(e, 'filename.wav');
    blob = e;
    //audioSource = new Audio((window.URL || window.webkitURL).createObjectURL(blob));
    var audioUrl = (window.URL || window.webkitURL).createObjectURL(blob);
    //createBuffer(audioUrl, clip);

    //creating a buffer and assiging to a track (clip for now)
    var request = new XMLHttpRequest();
    request.open('GET', audioUrl, true);
    request.responseType = 'arraybuffer';

    request.onload = function(){
      context.decodeAudioData(request.response, function(buffer){
        clip.buffer = buffer;
        var clipLength = 100 * (buffer.duration/loopDuration);
        clipCount++;
        var clipId = "clip"+clipCount;
        $("#track1").append('<div class = "soundClip" id ="'+clipId+'" style = "width:'+clipLength+'%"></div>');
        refreshClipListeners();
        clip.clipDivId = clipId;
        console.log(clip.clipDivId);
      });
    };

    request.send();
    recState = recordState.NOT_RECORDING;
  });
}



function playClip(clip){
  var source = context.createBufferSource();
  source.buffer = clip;
  source.connect(context.destination);
  //addGain(source);
  source.start(0);
}

function refreshClipListeners(){
  $( ".soundClip" ).draggable({ axis: "x",  containment: "parent"  });
  $( ".soundClip" ).draggable({
    start: function() {

    },
    drag: function() {

    },
    stop: function() {
      var pos = parseFloat($(this).css("left").split("p")[0]);
      var startTime = (pos/trackWidth) * loopDuration;
      console.log("Start time is: " + startTime);
    }
  });
}

$( document ).ready(function() {
  $( "#record1" ).click(function() {
    record();
    recState = recordState.RECORDING_1;
  });
  $( "#stop1" ).click(function() {
    if(recState = recordState.RECORDING_1){
      stop(clip1);
    }
  });
  $( "#play1" ).click(function() {
    clip1.play();
  });
  $( "#reverb1" ).click(function() {
    if(clip1.reverberating){
      clip1.reverberating = false;
    }else{
      clip1.reverberating = true;
    }
  });
  $( "#gain1" ).keyup(function() {
    clip1.gainNode.gain.value = parseFloat($(this).val());
    console.log(clip1.gainNode.gain.value);
  });
  //second set of controls
  $( "#record2" ).click(function() {
    record();
    recState = recordState.RECORDING_2;
  });
  $( "#stop2" ).click(function() {
    if(recState = recordState.RECORDING_2){
      stop(clip2);
    }
  });
  $( "#play2" ).click(function() {
    clip2.play();
  });
  $( "#reverb2" ).click(function() {
    if(clip2.reverberating){
      clip2.reverberating = false;
    }else{
      clip2.reverberating = true;
    }
  });
  $( "#gain2" ).keyup(function() {
    clip2.gainNode.gain.value = parseFloat($(this).val());
    console.log(clip1.gainNode.gain.value);
  });

  //third set of controls
  $( "#record3" ).click(function() {
    record();
    recState = recordState.RECORDING_3;
  });
  $( "#stop3" ).click(function() {
    if(recState = recordState.RECORDING_3){
      stop(clip3);
    }
  });
  $( "#play3" ).click(function() {
    clip3.play();
  });
  $( "#reverb3" ).click(function() {
    if(clip3.reverberating){
      clip3.reverberating = false;
    }else{
      clip3.reverberating = true;
    }
  });
  $( "#gain3" ).keyup(function() {
    clip3.gainNode.gain.value = parseFloat($(this).val());
    console.log(clip1.gainNode.gain.value);
  });

  //fourth set of controls
  $( "#record4" ).click(function() {
    record();
    recState = recordState.RECORDING_4;
  });

  $( "#stop4" ).click(function() {
    if(recState = recordState.RECORDING_4){
      stop(clip4);
    }
  });
  $( "#play4" ).click(function() {
    clip4.play();
  });
  $( "#reverb4" ).click(function() {
    if(clip4.reverberating){
      clip4.reverberating = false;
    }else{
      clip4.reverberating = true;
    }
  });
  $( "#gain4" ).keyup(function() {
    clip4.gainNode.gain.value = parseFloat($(this).val());
    console.log(clip1.gainNode.gain.value);
  });
  trackWidth = parseFloat($('#track1').css('width').split('p')[0]);

  console.log(trackWidth);
});
