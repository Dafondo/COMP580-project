function playTrack() {
    // var sounds = document.getElementsByTagName('audio');
    // for(i=0; i<sounds.length; i++) sounds[i].pause();
    // let audioId = $('input[name=track]:checked').val()+'audio';
    // document.getElementById(audioId).play();
}

document.onkeydown = function(e){
    if (e.which == 32) {
        console.log("space");

        let audioId = $('input[name=track]:checked').val()+'audio';
        let audioEl = document.getElementById(audioId);
        let isPaused = audioEl.paused;
        

        let sounds = document.getElementsByTagName('audio');
        for(i=0; i<sounds.length; i++) sounds[i].pause();

        if(isPaused) {
            console.log("PLAY");
            audioEl.play();
        }
        else {
            console.log("PAUSE");
            audioEl.pause();
        }
    }
}

document.getElementById('track1radio').focus();
document.getElementById('track1radio').checked = true;