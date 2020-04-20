//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);

document.onkeyup = function(e){

	if (e.which == 32){				//space key to start recording
		e.preventDefault();
		startRecording();
	}else if(e.which == 9){			//tab key to pause recording
		e.preventDefault();
		pauseRecording();
	}else if(e.which == 16){		//shift button to stop recording 
		e.preventDefault();
		stopRecording();
	}else if (e.which == 13){		//enter button to create song
		e.preventDefault();	
		createSong()
	}
}

 function startRecording() {
	console.log("recordButton clicked");

	/*
		Simple constraints object, for more advanced audio features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/
    
    var constraints = { audio: true, video:false }

 	/*
    	Disable the record button until we get a success or fail from getUserMedia() 
	*/

	recordButton.disabled = true;
	stopButton.disabled = false;
	pauseButton.disabled = false

	/*
    	We're using the standard promise based getUserMedia() 
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device
		*/
		audioContext = new AudioContext();

		//update the format 
		document.getElementById("formats").innerHTML="Format: 1 channel pcm @ "+audioContext.sampleRate/1000+"kHz"

		/*  assign to gumStream for later use  */
		gumStream = stream;
		
		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		/* 
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
		*/
		rec = new Recorder(input,{numChannels:1})

		//start the recording process
		rec.record()

		console.log("Recording started");

	}).catch(function(err) {
	  	//enable the record button if getUserMedia() fails
    	recordButton.disabled = false;
    	stopButton.disabled = true;
    	pauseButton.disabled = true
	});
}

function pauseRecording(){
	console.log("pauseButton clicked rec.recording=",rec.recording );
	if (rec.recording){
		//pause
		rec.stop();
		pauseButton.innerHTML="Resume";
	}else{
		//resume
		rec.record()
		pauseButton.innerHTML="Pause";

	}
}

function stopRecording() {
    var ul = document.createElement('ul');
	console.log("stopButton clicked");

	//disable the stop button, enable the record too allow for new recordings
	stopButton.disabled = true;
	recordButton.disabled = false;
	pauseButton.disabled = true;

	//reset button just in case the recording is stopped while paused
	pauseButton.innerHTML="Pause";
	
	//tell the recorder to stop the recording
    rec.stop();

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV(createDownloadLink);
}


var buffer1=null;
var buffer2 = null; 
function createDownloadLink(blob) {

	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
    var link = document.createElement('a');
    var linebreak= document.createElement("br");

	// name of .wav file to use during upload and download (without extendion)
	var filename = new Date().toISOString();

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;
	au.id="recordingID";
	//au.preload="metadata";

    //save to disk link
    li.appendChild(linebreak);
    link.href = url;
	link.download = filename+".wav"; //download forces the browser to donwload the file using the  filename
    link.innerHTML = "Save to disk";

	//add the new audio element to li
	li.appendChild(au);
    li.appendChild(linebreak);

	//add the filename to the li
	li.appendChild(document.createTextNode(filename+".wav "))

	//add the save to disk link to li
	li.appendChild(link);

    //upload link
    li.appendChild(linebreak);
	var upload = document.createElement('a');
	upload.href="#";
	upload.innerHTML = "Upload";
	upload.addEventListener("click", function(event){
		  var xhr=new XMLHttpRequest();
		  xhr.onload=function(e) {
		      if(this.readyState === 4) {
		          console.log("Server returned: ",e.target.responseText);
		      }
		  };
		  var fd=new FormData();
		  fd.append("audio_data",blob, filename);
		  xhr.open("POST","upload.php",true);
		  xhr.send(fd);
	})
	li.appendChild(document.createTextNode (" "))//add a space in between
	li.appendChild(upload)//add the upload link to li

	//add the li element to the ol
	recordingsList.appendChild(li);
	
	//getting the duration of input audio
	var InputTimeVar = document.getElementById("recordingID");
	var track1input = document.getElementById("track1radio");
	var track2input = document.getElementById("track2radio");
	var track3input = document.getElementById("track3radio");
	var track4input = document.getElementById("track4radio");
	var track5input = document.getElementById("track5radio");
	var InputTime = null;
	var btTime=0;
	var repeatLoop=0;
	var btURL;

	InputTimeVar.onloadedmetadata = function() {
		console.log("time: " + InputTimeVar.duration);
		console.log("time: " + Math.ceil(InputTimeVar.duration));
		InputTime = Math.ceil(InputTimeVar.duration);

	//duration of backtrack audio

		if(track1input.checked ){
			btURL = "./audio/track1.mp3";
			console.log(btURL);
			btTime = Math.ceil(document.getElementById("track1audio").duration);
			console.log("btTime: " + btTime);
		} else if (track2input.checked){
			btURL = "./audio/track2.mp3";
			console.log(btURL);
			btTime = Math.ceil(document.getElementById("track2audio").duration);
			console.log("btTime: " + btTime);
		} else if (track3input.checked) {
			btURL = "./audio/track3.mp3";
			console.log(btURL);
			btTime = Math.ceil(document.getElementById("track3audio").duration);
			console.log("btTime: " + btTime);
		} else if (track4input.checked) {
			btURL = "./audio/track4.mp3";
			console.log(btURL);
			btTime = Math.ceil(document.getElementById("track4audio").duration);
			console.log("btTime: " + btTime);
		}else if (track5input.checked) {
			btURL = "./audio/track5.mp3";
			console.log(btURL);
			btTime = Math.ceil(document.getElementById("track5audio").duration);
			console.log("btTime: " + btTime);
		}

		// btTime = Math.ceil(document.getElementById("track3").duration);
		// console.log("btTime: " + btTime);

		
		repeatLoop = Math.ceil(btTime/InputTime);
		console.log("repeatLoop: " + repeatLoop);

		Tone.Transport.bpm.value = 108;
		Tone.Transport.loop = true;
		Tone.Transport.loopStart = "0m";
		Tone.Transport.loopEnd = "2m";

		//user input audio
		const synth = new Tone.Sampler(
		{
			A1: url,
		},
		{
			onload: () => {
				console.log("loaded synth");
				document.getElementById("playTrackButton").removeAttribute("disabled");
				Tone.Transport.start();
			}
		}
		).toMaster();

		console.log(btURL)

		//backtrack 
		const kick = new Tone.Sampler(
			{
				B1: btURL,
			},
			{
				onload: () => {
					console.log("loaded kick");
					document.getElementById("playTrackButton").removeAttribute("disabled");
					Tone.Transport.start();
				}
			}
			).toMaster();
		
		

		//bind the transport
		document.getElementById("playTrackButton").addEventListener('click', e => {
			//synth.triggerAttackRelease('A1',InputTime);
			var i;
			var count=0;
			for (i =0; count < btTime; i++){
				count = InputTime+count;
				//triggerAttackRelease(note, duration of note, time when to start)
				synth.triggerAttackRelease('A1',InputTimeVar.duration, count);
					
			}
			synth.sync();
			kick.triggerAttackRelease('B1', btTime);
			kick.sync();
			console.log('pass trigger');

			if (Tone.context.state !== 'running') {
				Tone.context.resume();

			Tone.Transport.toggle()
			console.log('finished')
			}

		
			
		});

	};
	
}

