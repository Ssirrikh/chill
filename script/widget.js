
class ClockWidget {
	constructor (parent = document.body) {
		const dateTest = new Date(Date.UTC(2012, 11, 12, 3, 0, 0));
		// const dateStringTest = dateTest.toLocaleTimeString();
		// console.log(dateStringTest);
		// console.log(dateTest.toString());
		// this.isTwelveHour = !!(dateStringTest.match(/am|pm/i) || dateTest.toString().match(/am|pm/i) );
		this.isTwelveHour = !!( dateTest.toString().match(/am|pm/i) );

		this.domElement = document.createElement('div');
		this.domElement.style.color = '#ffffff';
		this.domElement.style.position = 'absolute';
		this.domElement.style.top = '80%';
		this.domElement.style.left = '50%';
		this.domElement.style.transform = 'translate(-50%,-50%)';
		this.domElement.style.font = '5vw Helvetica';

		parent.appendChild(this.domElement);
	}
	tick () {
		const d = new Date();
		const hh = this.isTwelveHour ? (d.getHours()%12) : String(d.getHours()).padStart(2,'0');
		const ss = String( d.getMinutes() ).padStart(2,'0');
		const a = this.isTwelveHour ? (d.getHours()>12 ? ' pm' : ' am') : '';
		this.domElement.innerHTML = hh + ':' + ss + a;
	}
}

class AudioChannelWidget {
	constructor (channel, label = 'Untitled') {
		this.domElement = document.createElement('div');
		this.domElement.style.color = '#ffffff';
		this.domElement.style.border = '1px solid #ffffff';
		this.domElement.style.position = 'absolute';
		this.domElement.style.width = '4vw';
		this.domElement.style.height = '15vw';
		this.domElement.style.font = '5vw Helvetica';

		this.volumeKnob = document.createElement('div');
		this.volumeKnob.style.backgroundColor = '#ffffff';
		this.volumeKnob.style.borderRadius = '50%';
		this.volumeKnob.style.position = 'absolute';
		this.volumeKnob.style.width = this.volumeKnob.style.height = '1vw';
		this.volumeKnob.style.left = '50%';
		this.volumeKnob.style.transform = 'translate(-50%,-50%)';
		this.domElement.appendChild(this.volumeKnob);

		this.labelText = document.createElement('div');
		this.labelText.style.backgroundColor = '#ff000022';
		this.labelText.style.width = '100%';
		this.labelText.style.left = '50%';
		this.labelText.style.font = '1vw Helvetica';
		this.domElement.appendChild(this.labelText);

		const self = this;
		this.domElement.onclick = (e) => {
			const b = self.domElement.getBoundingClientRect();
			self.volume = 1 - ((e.clientY-b.top) / b.height);
		};

		this.label = label;
		this.channel = channel;
	}
	get label () { return this._label; }
	set label (x) { this._label = this.labelText.innerHTML = x; }
	get volume () { return this.channel.volume; }
	set volume (vRaw) {
		const v = Math.min(Math.max(0,vRaw),1);
		this.channel.volume = v;
		this.volumeKnob.style.top = (100*(1-v)) + '%';
	}
}