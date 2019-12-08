// Helicopter Degrees of Freedom
// X = -Xb + hθb
// Y = Yb + hφb
// Z = -Zb 

// Helicopter Simulation Differential Equations
// Mx = -H - Mg * θ || Roll moment = -(Longitudinal Force) - Mass*Gravity*Angular Velocity for the pitch angle
// My = Y + Ttr + Mg * φ || Pitch Moment = Lateral force + Traction force for tail rotor + Mass*Gravity*Angular Velocity for the roll angle

const THREE = require('THREE'),
	  TWEEN = require('@tweenjs/tween.js');

class Helicopter {

	constructor(heli = undefined, model = undefined, weight = 14000){
		this.heli = heli;
		this.model = model;
		this.weight = weight;
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.maxAY = 1600;
		this.maxAX = 3;
		this.gravAOffset = 200;
		this.gravVOffset = -0.15;
		this.aX = 0;
		this.aY = 0;
		this.vX = 0;
		this.vY = 0;
		this.vZ = 0;
		this.vR = 0;
		this.roll = 0; // X Axis
		this.yaw = 0; // Y Axiz
		this.pitch = 0; // Z Axis
		this.maxRoll = 45;
		this.maxYaw = 4;
		this.maxPitch = 45;

		// Set Controls
		// Arrow Keys for Rotor Thrust
		// WASDQE Keys for Rotations
		window.addEventListener("keydown", (e) => {
			switch(e.key){
				case "ArrowLeft": // Tail Rotor Thrust Negative
					if (this.aX > 0) {
						let start = { aX: this.aX },
							end = { aX: this.aX-1 };

						this.flightTween(start, end, this, "aX");
					}
					break;
				case "ArrowUp": // Main Rotor Thrust Increase
					if (this.aY < this.maxAY) {
						let start = { aY: this.aY },
							end = { aY: this.aY+100 };

						this.flightTween(start, end, this, "aY");
					}
					break;
				case "ArrowRight": // Tail Rotor Thrust Positive
					if (this.aX < this.maxAX) {
						let start = { aX: this.aX },
							end = { aX: this.aX+1 };
					
						this.flightTween(start, end, this, "aX");					
					}
					break;
				case "ArrowDown": // Main Rotor Thrust Decrease
					if (this.aY > 0) {
						let start = { aY: this.aY },
							end = { aY: this.aY-100 };

						this.flightTween(start, end, this, "aY");
					}
					break;
				case " ": // Reset Rotors - Hover
					let start = {
							aX: this.aX,
							aY: this.aY,
							vX: this.vX,
							vY: this.vY,
							roll: this.roll,
							yaw: this.yaw,
							pitch: this.pitch
						},
						end = {
							aX: 0,
							aY: this.gravAOffset+0.1,
							vX: 0,
							vY: 0,
							roll: 0,
							yaw: 0,
							pitch: 0
						},
						hover = new TWEEN.Tween( start )
									.to( end, 1000 )
									.easing( TWEEN.Easing.Quadratic.Out )
									.onUpdate( (tween) => {
										this.aX = tween.aX;
										this.aY = tween.aY;
										this.vX = tween.vX;
										this.vY = tween.vY;
										this.roll = tween.roll;
										this.yaw = tween.yaw;
										this.pitch = tween.pitch;
									} ).start();
					break;
				case "w":  // Angle Heli Down
					if (this.pitch > -this.maxPitch) {
						let start = { pitch: this.pitch },
							end = { pitch: this.pitch-4 };

						this.flightTween(start, end, this, "pitch");
					}
					break;
				case "s":  // Angle Heli Up
					if (this.pitch < this.maxPitch) {
						let start = { pitch: this.pitch },
							end = { pitch: this.pitch+4 };

						this.flightTween(start, end, this, "pitch");
					}				
					break;
				case "a": // Roll Heli Left
					if (this.roll < this.maxRoll) {
						let start = { roll: this.roll },
							end = { roll: this.roll+4 };

						this.flightTween(start, end, this, "roll");
					}
					break;
				case "d": // Roll Heli Right
					if (this.roll > -this.maxRoll) {
						let start = { roll: this.roll },
							end = { roll: this.roll-4 };
						
						this.flightTween(start, end, this, "roll");
					}
					break;
				case "q": // Turn Heli Right
					if (this.yaw < this.maxYaw) {
						let start = { yaw: this.yaw },
							end = { yaw: this.yaw+1 };

						this.flightTween(start, end, this, "yaw");
					}
					break;
				case "e": // Turn Heli Left
					if (this.yaw > -this.maxYaw) {
						let start = { yaw: this.yaw },
							end = { yaw: this.yaw-1 };

						this.flightTween(start, end, this, "yaw");
					}
					break;			
			}

		}, false);

	}

	flightTween(start, end, that, propName){
		const flightTween = new TWEEN.Tween( start )
								 .to( end, 250 )
								 .easing( TWEEN.Easing.Quadratic.Out )
								 .onUpdate( (tween) => {
									that[propName] = tween[propName];
								 } ).start();
	}

	updateVelocities(){
		// Convert Degrees to Radians
		const rollRads = this.roll < 0 ? this.getRadians( 150-this.roll ) : this.getRadians( 150+this.roll ) , // Hypothetically 90-this.roll, changed for better playability
			  pitchRads = this.pitch < 0 ? this.getRadians( 150-this.pitch ) : this.getRadians( 150+this.pitch ), // Hypothetically 90-this.pitch, changed for better playability
			  gravSimY = this.aY/this.weight,
			  yawRatio = this.yaw/this.maxYaw;

		// Rotational Velocity
		this.vR = this.aX * yawRatio;

		// Upward Velocities
		if (this.aY > this.gravAOffset) {
			// Initial Y Velocity and Reset XY Velocities
			this.vY = gravSimY;
			this.vX = 0;
			this.vZ = 0;
			// X & Z Velocity
			if ( this.roll != 0 && this.pitch != 0 ) {
				// Get Higher Degree of the two, use resultant Y Velocity for second equation
				if ( Math.abs(this.roll) > Math.abs(this.pitch) ) {
					// Calc Roll Vector with Trigonometry, 
					this.vX = this.roll < 0 ? -(gravSimY * Math.cos(rollRads)) : gravSimY * Math.cos(rollRads);
					this.vY = Math.abs(gravSimY * Math.sin(rollRads));
					this.vZ = this.pitch < 0 ? gravSimY * Math.cos(pitchRads) : -(gravSimY * Math.cos(pitchRads));
				} else if ( Math.abs(this.pitch) > Math.abs(this.roll) ) {
					// Calc Pitch Vector with Trigonometry
					this.vX = this.roll < 0 ? -(gravSimY * Math.cos(rollRads)) : gravSimY * Math.cos(rollRads);
					this.vY = Math.abs(gravSimY * Math.sin(pitchRads));
					this.vZ = this.pitch < 0 ? gravSimY * Math.cos(pitchRads) : -(gravSimY * Math.cos(pitchRads));
				}
			} else if ( this.roll != 0 ) {
				// Calc Roll Vector with Trigonometry
				this.vX = this.roll < 0 ? -(gravSimY * Math.cos(rollRads)) : gravSimY * Math.cos(rollRads);
				this.vY = gravSimY * Math.sin(rollRads);
			} else if ( this.pitch != 0 ) {
				// Calc Pitch Vector with Trigonometry
				this.vY = gravSimY * Math.sin(pitchRads);
				this.vZ = this.pitch < 0 ? gravSimY * Math.cos(pitchRads) : -(gravSimY * Math.cos(pitchRads));
			}
		} else {
			this.vY = this.gravVOffset;
		}
	}

	updateRotation(){
		// SET AS YXZ & Axis Method
		this.heli.rotation.y += this.getRadians(this.vR);
		this.heli.rotation.x = this.getRadians(this.pitch); // Swapped - Bug, don't change
		this.heli.rotation.z = this.getRadians(this.roll); // Swapped - Bug, don't change
	}

	updatePosition(){
		// Velocity Multiplier - Scaling speeds to different size landscapes
		const multiplier = 30;
		// Arcade Style & Translate Method
		this.heli.position.y += this.vY*multiplier;
		this.heli.position.x += this.vX*multiplier;
		this.heli.position.z += this.vZ*multiplier;

		this.x = this.heli.position.x;
		this.y = this.heli.position.y;
		this.z = this.heli.position.z;
	}

	getRadians(deg){
		return deg * Math.PI / 180;
	}

	debuggingStats(){
		window.flightSim = { x: this.x, z: this.z }
		 
		let html = `<ul>
						<li>Model: ${this.model}</li>
						<li>Weight: ${this.weight}</li>
						<br>
						<li>X: ${this.x}</li>
						<li>Y: ${this.y}</li>
						<li>Z: ${this.z}</li>
						<br>
						<li>aX: ${this.aX}</li>
						<li>aY: ${this.aY}</li>
						<br>
						<li>vX: ${this.vX}</li>
						<li>vY: ${this.vY}</li> 
						<li>vZ: ${this.vZ}</li> 
						<li>vR: ${this.vR}</li> 
						<br>
						<li>Roll: ${this.roll}</li>
						<li>Yaw: ${this.yaw}</li>
						<li>Pitch: ${this.pitch}</li>
					</ul>`;

		document.getElementById("debugging-stats").innerHTML = html;
	}

	update(){
		this.updateVelocities();
		this.updateRotation();
		this.updatePosition();
		this.debuggingStats();
		TWEEN.update();
	}

}

module.exports = Helicopter;