
"use strict";




var Context = window.AudioContext || window.webkitAudioContext;
var context = new Context();
var track1 = new audioLooperTrack(context),
    track2 = new audioLooperTrack(context),
    track3 = new audioLooperTrack(context),
    track4 = new audioLooperTrack(context);
var impulse = {};
impulse.buffer = null;


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

function audioLooperTrack(con){
  this.gainNode = con.createGain();
  this.convolver = null;
  this.gainNode.gain.value = .5;
  this.buffer = null;
  this.reverberating = false;
  this.context = con;
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


    source.start(0);
  };
}

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
  createBuffer("audio/TijuanaMall.wav", impulse);
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

function stop(track) {
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
    createBuffer(audioUrl, track);
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
  });
  $( "#stop1" ).click(function() {
    if(recState = recordState.RECORDING_1){
      stop(track1);
    }
  });
  $( "#play1" ).click(function() {
    track1.play();
  });
  $( "#reverb1" ).click(function() {
    if(track1.reverberating){
      track1.reverberating = false;
    }else{
      track1.reverberating = true;
    }
  });
  $( "#gain1" ).keyup(function() {
    track1.gainNode.gain.value = parseFloat($(this).val());
    console.log(track1.gainNode.gain.value);
  });
  //second set of controls
  $( "#record2" ).click(function() {
    record();
    recState = recordState.RECORDING_2;
  });
  $( "#stop2" ).click(function() {
    if(recState = recordState.RECORDING_2){
      stop(track2);
    }
  });
  $( "#play2" ).click(function() {
    track2.play();
  });
  $( "#reverb2" ).click(function() {
    if(track2.reverberating){
      track2.reverberating = false;
    }else{
      track2.reverberating = true;
    }
  });
  $( "#gain2" ).keyup(function() {
    track2.gainNode.gain.value = parseFloat($(this).val());
    console.log(track1.gainNode.gain.value);
  });

  //third set of controls
  $( "#record3" ).click(function() {
    record();
    recState = recordState.RECORDING_3;
  });
  $( "#stop3" ).click(function() {
    if(recState = recordState.RECORDING_3){
      stop(track3);
    }
  });
  $( "#play3" ).click(function() {
    track3.play();
  });
  $( "#reverb3" ).click(function() {
    if(track3.reverberating){
      track3.reverberating = false;
    }else{
      track3.reverberating = true;
    }
  });
  $( "#gain3" ).keyup(function() {
    track3.gainNode.gain.value = parseFloat($(this).val());
    console.log(track1.gainNode.gain.value);
  });

  //fourth set of controls
  $( "#record4" ).click(function() {
    record();
    recState = recordState.RECORDING_4;
  });

  $( "#stop4" ).click(function() {
    if(recState = recordState.RECORDING_4){
      stop(track4);
    }
  });
  $( "#play4" ).click(function() {
    track4.play();
  });
  $( "#reverb4" ).click(function() {
    if(track4.reverberating){
      track4.reverberating = false;
    }else{
      track4.reverberating = true;
    }
  });
  $( "#gain4" ).keyup(function() {
    track4.gainNode.gain.value = parseFloat($(this).val());
    console.log(track1.gainNode.gain.value);
  });

});
