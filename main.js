
"use strict";

var track1, track2, track3, track4;
var Context = window.AudioContext || window.webkitAudioContext;
var context = new Context();

var mediaStream;
var rec;
var blob;

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
    switch(recState){
      case recordState.RECORDING_1:
        track1 = new Audio((window.URL || window.webkitURL).createObjectURL(blob));
        break;
      case recordState.RECORDING_2:
        track2 = new Audio((window.URL || window.webkitURL).createObjectURL(blob));
        break;
      case recordState.RECORDING_3:
        track3 = new Audio((window.URL || window.webkitURL).createObjectURL(blob));
        break;
      case recordState.RECORDING_4:
        track4 = new Audio((window.URL || window.webkitURL).createObjectURL(blob));
        break;
    }
    recState = recordState.NOT_RECORDING;
  });

}

$( document ).ready(function() {
  console.log( "ready!" );

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
    track2.play();
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
    track3.play();
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
    track4.play();
  });
});
