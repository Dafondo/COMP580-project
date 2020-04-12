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
var createButton = document.getElementById("createButton")

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);
createButton.addEventListener("click", createSong);

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
	createButton.disabled=false;

	//reset button just in case the recording is stopped while paused
	pauseButton.innerHTML="Pause";
	
	//tell the recorder to stop the recording
    rec.stop();

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV(createDownloadLink);
}

function createSong(){
	console.log("createButton clicked");

	stopButton.disabled = true;
	recordButton.disabled = false;
	pauseButton.disabled = true;
	createButton.disabled=true;

}

function createDownloadLink(blob) {

	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
    var link = document.createElement('a');
    var linebreak= document.createElement("br");

	// name of .wav file to use during upload and download (without extendion)
	var filename = new Date().toISOString();

	// set the transport
	Tone.Transport.bpm.value = 108;
	Tone.Transport.loop = true;
	Tone.Transport.loopStart = "0m";
	Tone.Transport.loopEnd = "2m";

	const synth = new Tone.Sampler(
	{
		A1: url,
	},
	{
		onload: () => {
			console.log("loaded");
			document.getElementById("playTrackButton").removeAttribute("disabled");
		}
	}
	).toMaster();

	synth.sync();
	synth.triggerAttackRelease('A1', '2n', 0);
	synth.triggerAttackRelease('C2', '2n', '2n');
	synth.triggerAttackRelease('G1', '4n', '1m');
	synth.triggerAttackRelease('G1', '4n', '1:1');

	// document.getElementById("playTrackButton").addEventListener("click", () => {
	// 	sampler.triggerAttack("A2");
	//   });
	  
	// create audio from file
	// var player = new Tone.Player(
	// 	{
	// 		url : url,
	// 		loop : true ,
	// 	}
	// ).toMaster().sync().start(0);

	// Tone.Transport.toggle();

	// Unused example code
	var kick = new Tone.Player({
		url : "./audio/track3.mp3",
		loop : true
		}
	).toMaster().sync().start(0);

	// bind the transport
	document.getElementById("playTrackButton").addEventListener('click', e => {
		if (Tone.context.state !== 'running') {
			Tone.context.resume();
		}
		Tone.Transport.toggle()
	});

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;

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
}