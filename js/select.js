// toggles between play and pause on the selected track
function toggleTrack() {
    // gets the selected audio element
    let audioId = $('input[name=track]:checked').val()+'audio';
    let audioEl = document.getElementById(audioId);
    // saves the paused status before we pause all tracks
    let wasPaused = audioEl.paused;
    
    // pauses all audio elements on the page
    let sounds = document.getElementsByTagName('audio');
    for(i=0; i<sounds.length; i++) sounds[i].pause();

    // if the selected track was paused before, play it
    if(wasPaused) {
        audioEl.play();
    }
}

document.onkeydown = function(e){
    // on space toggle between play and pause
    if (e.which == 32) {
        toggleTrack();
    }
}

// starts the page with the first track selected and focused
document.getElementById('track1radio').focus();
document.getElementById('track1radio').checked = true;