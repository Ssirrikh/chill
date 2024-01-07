
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