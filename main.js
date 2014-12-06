
"use strict";




var Context = window.AudioContext || window.webkitAudioContext;
var context = new Context();
var impulse = {};
impulse.buffer = null;


var mediaStream;
var rec;
var blob;
var numTracks = 4;
var trackArray = [];

var loopDuration = 10;
var trackWidth;
var clipCount = 0;
var looping = false;
var currentTime = 0;
var loopInterval;
var scrubberWidth = 5;
//WUT ARE WE DOIN DAWG
//STEP 1 lets reformat all our tracks into clips - DONE
//STEP 2 make a seperate function for recording and storing clips
// and loading soundfiles #DONE
//STEP 3 Make clips draggable -DONSKIS
//STEP 4 Tie clip to clip div and make pos represent start time DONE
//STEP 5 Store each clip in a respective array in a track, add global play button






var recordState = {
  NOT_RECORDING :0,
  RECORDING_1: 1,
  RECORDING_2: 2,
  RECORDING_3: 3,
  RECORDING_4: 4
};

var recordingTrack = null;
function AudioLooperTrack(divId,scrubId){
   this.clipArray = [];
   this.trackDivId = divId;
   this.scrubDivId = scrubId;
   this.reverberating = false;
   this.setGain = function(val){
     for(var i =0; i < this.clipArray.length; i++){
       this.clipArray[i].gainNode.gain.value = val;
     }
   }
   this.toggleReverb = function(){
     for(var i =0; i < this.clipArray.length; i++){
       this.clipArray[i].reverberating = !this.clipArray[i].reverberating;
     }
   }
   this.play = function(){
     for(var i =0; i < this.clipArray.length; i++){
       this.clipArray[i].play();
     }
     console.log(this.scrubDivId);
     var endOfTrack = (trackWidth - scrubberWidth);
     $(this.scrubDivId).animate({
       left : endOfTrack
     }, loopDuration*1000, 'linear',
     function(){

       $(this).css("left","0px");
     });
   };
   this.stop = function(){
     $(this.scrubDivId).stop();
     $(this.scrubDivId).css("left","0px");
     for(var i =0; i < this.clipArray.length; i++){
       this.clipArray[i].stop();
     }

   };
}



function AudioLooperClip(con){
  this.gainNode = con.createGain();
  this.convolver = null;
  this.gainNode.gain.value = .5;
  this.buffer = null;
  this.reverberating = false;
  this.context = con;
  this.clipDivId = null;
  this.source = null;
  this.play = function(){

    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.gainNode);
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
    this.source.start(sTime);

  };
  this.calcStartTime = function(){
    var pos = parseFloat($(this.clipDivId).css("left").split("p")[0]);
    var startTime = (pos/trackWidth) * loopDuration;
    if(startTime == NaN){
      startTime = 0;
    }
    return startTime;
  }
  this.stop = function(){
    this.source.stop();
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
  }, function(){
    console.log('Browser not supported');
  });
}

function stop(track) {
  // stop the media stream
  mediaStream.stop();
  console.log(track);
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
        var clip = new AudioLooperClip(context);
        clip.buffer = buffer;
        var clipLength = 100 * (buffer.duration/loopDuration);
        clipCount++;

        var clipId = "clip"+clipCount;
        $(track.trackDivId).append('<div class = "soundClip" id ="'+clipId+'" style = "width:'+clipLength+'%; left:0;">'+
        '<button class = "deleteClipBtn">delete</button></div>');
        refreshClipListeners();
        clip.clipDivId = "#"+clipId;
        track.clipArray.push(clip);
      });
    };

    request.send();
    recState = recordState.NOT_RECORDING;
  });
}

function playAll(){
  for(var i = 0; i<numTracks; i++){
    trackArray[i].play();
  }
}
function stopAll(){
  for(var i = 0; i<numTracks; i++){
    trackArray[i].stop();
  }
}
function stopLoop(){
  clearInterval(loopInterval);
}

function startLoop(){

  playAll();
  loopInterval = setInterval(function(){playAll()}, loopDuration*1000);
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
  $(".deleteClipBtn").click(function(){
    $(this).parent().remove();
    updateAvailableClips();
  });
}

function updateAvailableClips(){
  for(var i = 0; i < trackArray.length; i++){
    for(var j = 0; j < trackArray[i].clipArray.length; j++){
      if($(trackArray[i].clipArray[j].clipDivId).length < 1){
        trackArray[i].clipArray.splice(j, 1);
      }
    }
  }
}

function init(){

  for(var trackCount = 0; trackCount < numTracks; trackCount++){

    var trackString =

    '<div style="background-color:red">'+
    '<h3>Track '+trackCount+'</h3>'+
    '<button id = "record'+trackCount+'">record</button>'+
    '<button id = "stop-recording'+trackCount+'">stop recording</button>'+
    '<button id = "play'+trackCount+'">play</button>'+
    '<button id = "stop'+trackCount+'">stop</button>'+
    '<button id = "reverb'+trackCount+'">toggle reverb</button>'+
    'Gain:<input type="text" id = "gain'+trackCount+'" name="" value = ".5">'+
    '</div>'+
    '<div id="track'+trackCount+'" class="track">'+
    '<div class = "scrubber" id= "scrubber'+trackCount+'"></div></div>';
    $('body').append(trackString);
    trackArray.push(new AudioLooperTrack('#track'+trackCount, '#scrubber'+trackCount));

    $( "#record"+trackCount ).click(function() {
      record();
      //recState = recordState.RECORDING_1;

        recordingTrack = trackArray[$(this).attr('id').slice(-1)].trackDivId;


    });
    $( "#stop-recording"+trackCount  ).click(function() {
        if(recordingTrack === trackArray[$(this).attr('id').slice(-1)].trackDivId){
            stop(trackArray[$(this).attr('id').slice(-1)]);
        }
    });
    $( "#play"+trackCount  ).click(function() {
        trackArray[$(this).attr('id').slice(-1)].play();
    });
    $( "#stop"+trackCount  ).click(function() {
      trackArray[$(this).attr('id').slice(-1)].stop();
    });
    $( "#reverb"+trackCount  ).click(function() {
      trackArray[$(this).attr('id').slice(-1)].toggleReverb();
    });
    $( "#gain"+trackCount  ).keyup(function() {
      trackArray[$(this).attr('id').slice(-1)].setGain(parseFloat($(this).val()));

    });
  }
};

$( document ).ready(function() {
  init();
  trackWidth = parseFloat($('#track1').css('width').split('p')[0]);
  $( "#globalPlay").click(function() {
    if(!looping){
      looping = true;
      startLoop();
    }

  });
  $( "#globalStop").click(function() {
    if(looping){
      looping = false;
      stopLoop();
      stopAll();
    }

  });

});
