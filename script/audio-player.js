
function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min, max) {
	return (Math.random() * (max - min)) + min;
}

//////////////////

class AudioChannel {
	constructor (src) {
		this.player = document.createElement('audio');
		this.player.src = src;
	}
	get volume () { return this.player.volume; }
	set volume (v) { this.player.volume = v; }
	get muted () { return this.player.muted; }
	mute () { this.player.muted = true; }
	unmute () { this.player.muted = false; }
	get paused () { return this.player.paused; }
	play () { this.player.play(); }
	pause () { this.player.pause(); }
	tick () {}
}
class CrossfadeChannel extends AudioChannel {
	constructor (src, crossfade = 0.0) {
		super(src);

		this.auxSwitch = false;
		this.auxPlayer = document.createElement('audio');
		this.auxPlayer.src = src;

		this.onCrossfade = (player) => {};

		this._volume = 1.0;
		this._muted = false;
		this._crossfade = crossfade; // in seconds
	}
	// override
	get volume () { return this._volume; }
	set volume (v) {
		this._volume = Math.min(Math.max(0,v),1);
	}
	get muted () { return this._muted; }
	mute () { this._muted = this.player.muted = this.auxPlayer.muted = true; }
	unmute () { this._muted = this.player.muted = this.auxPlayer.muted = false; }
	get paused () {
		return this.player.paused && this.auxPlayer.paused;
	}
	play () {
		if (!this.auxSwitch || this.auxPlayer.currentTime > this.auxPlayer.duration-this._crossfade) {
			this.player.play();
		}
		if (this.auxSwitch || this.player.currentTime > this.player.duration-this._crossfade) {
			this.auxPlayer.play();
		}
	}
	pause () {
		this.player.pause();
		this.auxPlayer.pause();
	}
	tick () {
		// lerp volumes during crossfade
		for (let player of [this.player,this.auxPlayer]) {
			if (player.currentTime < this._crossfade) {
				player.volume = this._volume * (player.currentTime / this._crossfade); // fade in at beginning
			} else if (player.currentTime > player.duration - this._crossfade) {
				player.volume = this._volume * ((player.duration-player.currentTime) / this._crossfade); // fade out at end
			} else {
				player.volume = this._volume * 1.0;
			}
		}
		// try trigger crossfade
		if (!this.auxSwitch && this.player.currentTime > this.player.duration-this._crossfade && this.auxPlayer.paused) {
			this.onCrossfade(this.auxPlayer);
			this.auxSwitch = true;
			this.auxPlayer.currentTime = 0;
			this.auxPlayer.play();
		}
		if (this.auxSwitch && this.auxPlayer.currentTime > this.auxPlayer.duration-this._crossfade && this.player.paused) {
			this.onCrossfade(this.player);
			this.auxSwitch = false;
			this.player.currentTime = 0;
			this.player.play();
		}
	}
}


//////////////////////

// class LoopChannel {
// 	constructor (src, crossfadeLength = 5.0) {
// 		this.crossfadeLength = crossfadeLength; // in seconds
// 		// this.crossfadeStart = -1;

// 		this.currentPlayer = 0;
// 		this.players = [
// 			document.createElement('audio'),
// 			document.createElement('audio')
// 		];

// 		this.players[0].src = src;
// 		this.players[1].src = src;
// 	}
// 	get paused () {
// 		return this.players[0].paused && this.players[1].paused;
// 	}
// 	play () {
// 		if (this.currentPlayer == 0 || this.players[1].currentTime > this.players[1].duration-this.crossfadeLength) {
// 			this.players[0].play();
// 		}
// 		if (this.currentPlayer == 1 || this.players[0].currentTime > this.players[0].duration-this.crossfadeLength) {
// 			this.players[1].play();
// 		}
// 	}
// 	pause () {
// 		this.players[0].pause();
// 		this.players[1].pause();
// 	}
// 	tick () {
// 		// adjust crossfade volume
// 		for (let i of [0,1]) {
// 			if (this.players[i].currentTime < this.crossfadeLength) {
// 				this.players[i].volume = this.players[i].currentTime / this.crossfadeLength; // fade in
// 			} else if (this.players[i].currentTime > this.players[i].duration - this.crossfadeLength) {
// 				this.players[i].volume = (this.players[i].duration-this.players[i].currentTime) / this.crossfadeLength; // fade out
// 			} else {
// 				this.players[i].volume = 1;
// 			}
// 		}
// 		// try trigger crossfade
// 		if (this.currentPlayer == 0 && this.players[0].currentTime > this.players[0].duration - this.crossfadeLength && this.players[1].paused) {
// 			this.currentPlayer = 1;
// 			this.players[1].currentTime = 0;
// 			this.players[1].play();
// 		}
// 		if (this.currentPlayer == 1 && this.players[1].currentTime > this.players[1].duration - this.crossfadeLength && this.players[0].paused) {
// 			this.currentPlayer = 0;
// 			this.players[0].currentTime = 0;
// 			this.players[0].play();
// 		}
// 	}
// }
class TriggerChannel {
	constructor (src, triggerDelayAverage = 2.0, triggerDelayVariance = 1.0) {
		this.triggerDelayMin = triggerDelayAverage-triggerDelayVariance; // in seconds
		this.triggerDelayMax = triggerDelayAverage+triggerDelayVariance; // in seconds
		this.triggerStart = -1;
		this.triggerDelay = -1;

		this.paused = true;
		this.player = document.createElement('audio');
		this.player.src = src;
	}
	play () {
		this.paused = false;
		if (this.triggerStart == -1) {
			this.player.play();
		} else {
			this.triggerStart = performance.now(); // reset trigger delay if we were paused before firing
		}
	}
	pause () {
		this.paused = true;
		this.player.pause();
	}
	tick () {
		if (this.player.ended) {
			// set trigger if last sound finished playing
			this.player.currentTime = 0;
			this.triggerStart = performance.now();
			this.triggerDelay = randFloat(this.triggerDelayMin, this.triggerDelayMax);
			console.log('set trigger ' + this.triggerDelay);
		} else if (this.triggerStart > -1 && performance.now()-this.triggerStart > this.triggerDelay*1000 && !this.paused) {
			// fire trigger if delay finished
			this.triggerStart = -1;
			this.player.play();
			console.log('fire trigger');
		}
	}
}

// class MixBoard {
// 	constructor () {
// 		this.channels = [];
// 	}
// 	addChannel (audioList = []) {
// 		//
// 	}
// }

class PlaylistChannel extends CrossfadeChannel {
	constructor (src, crossfade = 0.0, tracklist = []) {
		super(src, crossfade);
		
		this.repeat = false;
		this.currentTrack = 0;
		this.tracklist = tracklist.map(x => x);
		this.shuffleOrder = [];

		function autoplay () {
			if (!this.repeat) {
				this.auxSwitch
					? (this.auxPlayer.currentTime = 0)
					: (this.player.currentTime = 0);
				this.play();
			} else {
				this.next();
			}
		}
		this.player.addEventListener('ended', autoplay);
		this.auxPlayer.addEventListener('ended', autoplay);
	}
	get shuffled () { return this.shuffleOrder.length != 0; }
	get currentTrack () { return this.tracklist[ this.shuffled ? this.shuffleOrder[this.nowPlaying] : this.nowPlaying ]; }
	get timeStr () {}
	get durationStr () {}
	next () {
		//
	}
	prev () {
		//
	}
	shuffle () {
		const lastTrack = this.shuffled ? this.shuffleOrder[this.nowPlaying] : this.nowPlaying;
		this.shuffleOrder = this.tracklist.map( (x,i) => i );
		// Durstenfeld shuffle in O(n)
		for (let i = this.shuffleOrder.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.shuffleOrder[i], this.shuffleOrder[j]] = [this.shuffleOrder[j], this.shuffleOrder[i]];
		}
		this.nowPlaying = this.shuffleOrder.indexOf(lastTrack);
		return this;
	}
	unshuffle () {
		this.nowPlaying = this.shuffleOrder[this.nowPlaying];
		this.shuffleOrder = [];
		return this;
	}
}

class AudioPlayer {
	constructor (tracklist) {
		this.player = document.createElement('audio');
		this.repeat = false;
		this.nowPlaying = 0;
		this.tracklist = tracklist.map(x => x);
		this.shuffleOrder = [];

		// this.seekBar = document.createElement()

		// autoplay
		this.player.addEventListener('ended', () => {
			if (!this.repeat)
				this.next();
			this.player.currentTime = 0;
			this.play().update();
		});
	}
	get paused () { return this.player.paused; }
	get shuffled () { return this.shuffleOrder.length != 0; }
	get repeating () { return this.player.loop; }
	get currentTrack () { return this.tracklist[ this.shuffled ? this.shuffleOrder[this.nowPlaying] : this.nowPlaying ]; }
	get currentTime () { return this.player.currentTime; }
	get duration () { return this.player.duration; }
	setSrc (src) {
		this.player.pause();
		this.player.src = 'music/' + src;
		return this;
	}
	play () {
		if (this.player.currentSrc == '') {
			const track = this.shuffled ? this.shuffleOrder[this.nowPlaying] : this.nowPlaying;
			this.setSrc(this.tracklist[track].path);
		}
		this.player.play();
		return this;
	}
	pause () {
		this.player.pause();
		return this;
	}
	next () {
		const wasPaused = this.paused;
		this.nowPlaying = (this.nowPlaying + 1) % this.tracklist.length;
		const track = this.shuffled ? this.shuffleOrder[this.nowPlaying] : this.nowPlaying;
		this.setSrc(this.tracklist[track].path);
		if (!wasPaused) this.play();
		return this;
	}
	prev () {
		const wasPaused = this.paused;
		this.nowPlaying = (this.nowPlaying - 1 + this.tracklist.length) % this.tracklist.length;
		const track = this.shuffled ? this.shuffleOrder[this.nowPlaying] : this.nowPlaying;
		this.setSrc(this.tracklist[track].path);
		if (!wasPaused) this.play();
		return this;
	}
	shuffle () {
		const lastTrack = this.shuffled ? this.shuffleOrder[this.nowPlaying] : this.nowPlaying;
		this.shuffleOrder = this.tracklist.map( (x,i) => i );
		// Durstenfeld shuffle in O(n)
		for (let i = this.shuffleOrder.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.shuffleOrder[i], this.shuffleOrder[j]] = [this.shuffleOrder[j], this.shuffleOrder[i]];
		}
		this.nowPlaying = this.shuffleOrder.indexOf(lastTrack);
		return this;
	}
	unshuffle () {
		this.nowPlaying = this.shuffleOrder[this.nowPlaying];
		this.shuffleOrder = [];
		return this;
	}

	get timeStr () {
		const currentSeconds = Math.floor(this.currentTime % 60);
		const currentMinutes = Math.floor((this.currentTime-currentSeconds) / 60);
		return String(currentMinutes).padStart(2,'0') + ':' + String(currentSeconds).padStart(2,'0');
	}
	get durationStr () {
		if (!this.duration) return '00:00';
		const durationSeconds = Math.floor(this.duration % 60);
		const durationMinutes = Math.floor((this.duration-durationSeconds) / 60);
		return String(durationMinutes).padStart(2,'0') + ':' + String(durationSeconds).padStart(2,'0');
	}
	get domStr () {
		let s = '';

		s += '[k] play/pause\n';
		s += '[j] prev\n';
		s += '[l] next\n';
		s += '[m] mute\n';
		s += '[r] repeat current track\n';
		s += '[s] shuffle tracks\n';
		s += '[Shift]+[s] turn off shuffle\n';
		s += '\n';

		s += this.paused ? 'PAUSED' : 'PLAYING';
		s += this.player.muted ? ', MUTED' : '';
		s += this.repeat ? ', REPEAT CURRENT' : '';
		s += '\n\n';

		const seek = 'musicPlayer.player.fastSeek(document.getElementById("timeSlider").value/100 * musicPlayer.duration)';
		s += `<input type = 'range' min = '0' max = '100' value = '0' step = '0.01' class = 'slider' id = 'timeSlider' oninput = '` + seek + `'>  `;
		s += this.timeStr + ' / ' + this.durationStr;
		s += '\n\n';

		for (let i = 0; i < this.tracklist.length; i++) {
			const track = this.shuffled ? this.shuffleOrder[i] : i;
			s += (i == this.nowPlaying) ? '>>' : '  ';
			s += ' ' + String(track+1).padStart(2,'0');
			s += ' ' + this.tracklist[track].composer + ' - ' + this.tracklist[track].title;
			s += '\n';
		}

		return s;
	}
	update () {
		document.body.innerHTML = this.domStr;
	}
}


