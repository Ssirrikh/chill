
function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SNOW_BG = {
	size: [1,2], // min,max in px
	lifetime: [7500,1500], // avg,var in ms
	swayPeriod: [9000,1500], // avg,var in ms
	swayDist: [50,15], // avg,var in px
	newParticleObject: (radius) => {
		let e = document.createElement('div');
		e.style.backgroundColor = '#ffffff';
		e.style.borderRadius = '50%';
		e.style.width = e.style.height = 2*radius + 'px';
		e.style.position = 'absolute';
		return e;
	}
};
const SNOW_FG = {
	size: [5,9], // min,max in px
	lifetime: [10000,400], // avg,var in ms
	swayPeriod: [12000,3500], // avg,var in ms
	swayDist: [50,15], // avg,var in px
	newParticleObject: (radius) => {
		let e = document.createElement('div');
		e.style.background = 'radial-gradient(#ffffff88,#ffffff00)';
		e.style.borderRadius = '50%';
		e.style.width = e.style.height = 2*radius + 'px';
		e.style.position = 'absolute';
		return e;
	}
};
const RAIN_BG = {
	size: [8,16], // min,max in px
	lifetime: [700,100], // avg,var in ms
	swayPeriod: [14000,2000], // avg,var in ms
	swayDist: [80,20], // avg,var in px
	newParticleObject: (height) => {
		let e = document.createElement('div');
		e.style.background = 'radial-gradient(#ffffff88,#ffffff00)';
		e.style.borderRadius = '50%';
		e.style.width = randInt(1,2) + 'px';
		e.style.height = height + 'px';
		e.style.position = 'absolute';
		return e;
	}
};
const RAIN_FG = {
	size: [12,24], // min,max in px
	lifetime: [500,100], // avg,var in ms
	swayPeriod: [14000,2000], // avg,var in ms
	swayDist: [30,8], // avg,var in px
	newParticleObject: (height) => {
		let e = document.createElement('div');
		e.style.background = 'radial-gradient(#ffffff88,#ffffff00)';
		e.style.borderRadius = '50%';
		e.style.width = randInt(2,4) + 'px';
		e.style.height = height + 'px';
		e.style.position = 'absolute';
		return e;
	}
};

class Particle {
	constructor (settings) {
		this.radius     = randInt(settings.size[0], settings.size[1]);
		this.lifetime   = randInt(settings.lifetime[0]-settings.lifetime[1], settings.lifetime[0]+settings.lifetime[1]);
		this.swayPeriod = randInt(settings.swayPeriod[0]-settings.swayPeriod[1], settings.swayPeriod[0]+settings.swayPeriod[1]);
		this.swayDist   = randInt(settings.swayDist[0]-settings.swayDist[1], settings.swayDist[0]+settings.swayDist[1]);
		this.init();
	}
	get progress () { return (performance.now()-this.animStart) / this.lifetime; }
	get x () {
		const swayProgress = ((performance.now()-this.animStart) % this.swayPeriod) / this.swayPeriod;
		return this.centerX;
		// return this.centerX + this.swayDist*Math.sin(2*Math.PI * swayProgress);
	}
	get y () {
		// animHeight*animProgress - particleSize
		return (window.innerHeight+2*this.radius) * this.progress - this.radius;
	}
	init () {
		this.centerX = randInt(0, window.innerWidth);
		this.swayOffset = randInt(-this.swayPeriod/2,this.swayPeriod/2);
		this.animStart = performance.now();
	}
}

function ParticleObject (radius) {
	let e = document.createElement('div');
	e.style.backgroundColor = '#ffffff';
	e.style.borderRadius = '50%';
	e.style.width = e.style.height = 2*radius + 'px';
	e.style.position = 'absolute';
	return e;
}

class ParticleSystem {
	constructor (numParticles, settings) {
		// this.particles = [];
		// for (let i = 0; i < numParticles; i++)
		// 	this.particles.push( new Particle(settings) );
		this.particles = Array.from({ length: numParticles }, () => new Particle(settings));
		for (let particle of this.particles) {
			particle.init();
			particle.animStart += randInt(0,particle.lifetime); // spread out initial spawns over time
			particle.domElement = settings.newParticleObject(particle.radius);
			document.body.appendChild(particle.domElement);
		}
	}
	update () {
		for (let particle of this.particles) {
			if (performance.now()-particle.animStart > particle.lifetime)
				particle.init();
			particle.domElement.style.left = particle.x + 'px';
			particle.domElement.style.top = particle.y + 'px';
		}
	}
	correctTimeskip (dt) {
		for (let particle of this.particles) {
			particle.animStart += dt;
		}
	}
}

////////////////////////////

// const MIN_TIMESKIP = 2 * (1000/60); // if we miss an entire frame @ 60 fps, correct for it
// let lastFrame = performance.now();
// let dt;


// let bg = new ParticleSystem(150, SNOW_BG);
// let fg = new ParticleSystem(30, SNOW_FG);
// // let bg = new ParticleSystem(500, RAIN_BG);
// // let fg = new ParticleSystem(100, RAIN_FG);
// function render () {

// 	requestAnimationFrame(render);

// 	// 
// 	dt = performance.now()-lastFrame;
// 	if (dt > MIN_TIMESKIP) {
// 		bg.correctTimeskip(dt);
// 		fg.correctTimeskip(dt);
// 	}

// 	bg.update();
// 	fg.update();

// 	lastFrame = performance.now();
// }
// render();


