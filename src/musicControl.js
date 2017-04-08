
var music = {
  soundTrack : document.getElementById('soundtrack'),
  soundGameOver : document.getElementById('soundfameover'),
  soundEffect : document.getElementById('soundeffect'),

  initializeSound : function () {
    let SOUNDTRACK_VOLUME = 0.12;
    let SOUNDGAMEOVER_VOLUME = 0.2;
    let SOUNDEFFECT_VOLUME = 0.15;

    this.soundTrack.volume = SOUNDTRACK_VOLUME;
    this.soundGameOver.volume = SOUNDGAMEOVER_VOLUME;
    this.soundEffect.volume = SOUNDEFFECT_VOLUME;

  },

  playSound : function(sound) {
    sound.play();
  },

  pauseSound : function (sound) {
    this.soundTrack.pause();
  }
}

export {music};
