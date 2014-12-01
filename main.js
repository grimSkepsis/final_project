
"use strict";


function audioLooperTrack(con){
  this.gainNode = con.createGain();
  this.convolver = context.createConvolver();
  this.gainNode.gain.value = .5;
  this.buffer = null;
  this.reverberating = true;
  this.context = con;
  this.play = function(){
    var source = this.context.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.gainNode);
    if(this.reverberating){
      this.gainNode.connect(this.convolver);
      this.convolver.connect(this.context.destination);
    }
    else{
      this.gainNode.connect(this.context.destination);
    }


    source.start(0);
  };
}


var Context = window.AudioContext || window.webkitAudioContext;
var context = new Context();
var track1 = new audioLooperTrack(context),
track2, track3, track4;



var mediaStream;
var rec;
var blob;
var tempTrack;





var recordState = {
  NOT_RECORDING :0,
  RECORDING_1: 1,
  RECORDING_2: 2,
  RECORDING_3: 3,
  RECORDING_4: 4
};

var navigator = window.navigator;
navigator.getUserMedia = (
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia
);

var recState = recordState.NOT_RECORDING;

function createBuffer(url, object){
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
  createBuffer("/audio/TijuanaMall.wav", track1.convolver);
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
      workerPath: 'lib/recorderjs/recorderWorker.js'
    });

    // start recording
    rec.record();
  }, function(err){
    console.log('Browser not supported');
  });
}

function stop() {
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
    createBuffer(audioUrl, track1);
    recState = recordState.NOT_RECORDING;
  });
}

function playTrack(track){
  var source = context.createBufferSource();
  source.buffer = track;
  source.connect(context.destination);
  //addGain(source);
  source.start(0);
}

$( document ).ready(function() {
  $( "#record1" ).click(function() {
    record();
    recState = recordState.RECORDING_1;
    console.log(recState);
  });
  $( "#stop1" ).click(function() {
    if(recState = recordState.RECORDING_1){
      stop();
    }
  });
  $( "#play1" ).click(function() {
    track1.play();
  });

  //second set of controls
  $( "#record2" ).click(function() {
    record();
    recState = recordState.RECORDING_2;
    console.log(recState);
  });
  $( "#stop2" ).click(function() {
    if(recState = recordState.RECORDING_2){
      stop();
    }
  });
  $( "#play2" ).click(function() {
    playTrack(track2);
  });

  //third set of controls
  $( "#record3" ).click(function() {
    record();
    recState = recordState.RECORDING_3;
    console.log(recState);
  });
  $( "#stop3" ).click(function() {
    if(recState = recordState.RECORDING_3){
      stop();
    }
  });
  $( "#play3" ).click(function() {
    playTrack(track3);
  });

  //fourth set of controls
  $( "#record4" ).click(function() {
    record();
    recState = recordState.RECORDING_4;
    console.log(recState);
  });
  $( "#stop4" ).click(function() {
    if(recState = recordState.RECORDING_4){
      stop();
    }
  });
  $( "#play4" ).click(function() {
    playTrack(track4);
  });
});
