
class AmbianceChannel {
	constructor (src) {
		this.crossfadeLength = 5.0;
		this.crossfadeStart = -1;

		this.currentPlayer = 0;
		this.players = [
			document.createElement('audio'),
			document.createElement('audio')
		];

		this.players[0].src = src;
		this.players[1].src = src;
	}
	get paused () {
		return this.players[0].paused && this.players[1].paused;
	}
	play () {
		if (this.currentPlayer == 0 || this.players[1].currentTime > this.players[1].duration-this.crossfadeLength) {
			this.players[0].play();
		}
		if (this.currentPlayer == 1 || this.players[0].currentTime > this.players[0].duration-this.crossfadeLength) {
			this.players[1].play();
		}
	}
	pause () {
		this.players[0].pause();
		this.players[1].pause();
	}
	tick () {
		// const primaryPlayer = this.players[this.currentPlayer];
		// const secondaryPlayer = this.players[this.currentPlayer == 0 ? 1 : 0];
		// if (primaryPlayer.currentTime < this.crossfadeLength || primaryPlayer.currentTime > primaryPlayer.duration-this.crossfadeLength)

		if (this.players[0].currentTime < this.crossfadeLength) {
			this.players[0].volume = this.players[0].currentTime / this.crossfadeLength; // fade in
		} else if (this.players[0].currentTime > this.players[0].duration - this.crossfadeLength) {
			this.players[0].volume = (this.players[0].duration-this.players[0].currentTime) / this.crossfadeLength; // fade out
		} else {
			this.players[0].volume = 1;
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


