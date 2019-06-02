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
		this.gravVOffset = 0.15;
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
		this.maxYaw = 0.4;
		this.maxPitch = 45;

		// Set Controls
		// Arrow Keys for Rotor Thrust
		// WASDQE Keys for Rotations
		window.addEventListener("keydown", (e) => {
			console.log("keydown");
			switch(e.key){
				case "ArrowLeft": // Tail Rotor Thrust Negative
					if (this.aX > 0) {
						let start = { aX: this.aX },
							end = { aX: this.aX-0.1 };

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
							end = { aX: this.aX+0.1 };
					
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
							end = { pitch: this.pitch-2 };

						this.flightTween(start, end, this, "pitch");
					}
					break;
				case "s":  // Angle Heli Up
					if (this.pitch < this.maxPitch) {
						let start = { pitch: this.pitch },
							end = { pitch: this.pitch+2 };

						this.flightTween(start, end, this, "pitch");
					}				
					break;
				case "a": // Roll Heli Left
					if (this.roll < this.maxRoll) {
						let start = { roll: this.roll },
							end = { roll: this.roll+2 };

						this.flightTween(start, end, this, "roll");
					}
					break;
				case "d": // Roll Heli Right
					if (this.roll > -this.maxRoll) {
						let start = { roll: this.roll },
							end = { roll: this.roll-2 };
						
						this.flightTween(start, end, this, "roll");
					}
					break;
				case "q": // Turn Heli Right
					if (this.yaw < this.maxYaw) {
						let start = { yaw: this.yaw },
							end = { yaw: this.yaw+0.1 };

						this.flightTween(start, end, this, "yaw");
					}
					break;
				case "e": // Turn Heli Left
					if (this.yaw > -this.maxYaw) {
						let start = { yaw: this.yaw },
							end = { yaw: this.yaw-0.1 };

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

	changePitch(newPitch){
		this.pitch += newPitch;
	}

	changeRoll(newRoll){
		this.roll += newRoll;
	}

	changeYaw(newYaw){
		this.yaw += newYaw;
	}

	changeAccelerationY(newAcceleration){
		this.aY += newAcceleration;
	}

	changeAccelerationX(newAcceleration){
		this.aX += newVelocity;
	}

	changeVelocityY(newVelocity){
		this.vY += newVelocity;
	}

	changeVelocityX(newVelocity){
		this.vX += newVelocity;
	}

	updateVelocities(){
		// Convert Degrees to Radians
		const rollRads = this.roll < 0 ? this.getRadians( 150-this.roll ) : this.getRadians( 150+this.roll ) , // Hypothetically 90-this.roll, changed for better playability
			  pitchRads = this.pitch < 0 ? this.getRadians( 150-this.pitch ) : this.getRadians( 150+this.pitch ), // Hypothetically 90-this.pitch, changed for better playability
			  gravSimY = this.aY/this.weight,
			  yawRatio = this.yaw/this.maxYaw;

		// Rotational Velocity
		this.vR = this.aX * yawRatio;

		// Y Velocity from accel & gravity
		this.vY = this.aY <= this.gravAOffset ? gravSimY - this.gravVOffset : gravSimY;

		const vYOriginal = this.vY;
		
		// X & Z Velocity
		if ( this.roll != 0 && this.pitch != 0 ) {
			// Get Higher Degree of the two, use resultant Y Velocity for second equation
			if ( Math.abs(this.roll) > Math.abs(this.pitch) ) {
				// Calc Roll Vector with Trigonometry, 
				this.vX = Math.abs(vYOriginal * Math.cos(rollRads));
				this.vY = Math.abs(vYOriginal * Math.sin(rollRads));
				this.vZ = Math.abs(vYOriginal * Math.cos(pitchRads));
			} else if ( Math.abs(this.pitch) > Math.abs(this.roll) ) {
				// Calc Pitch Vector with Trigonometry
				this.vX = Math.abs(vYOriginal * Math.cos(rollRads));
				this.vY = Math.abs(vYOriginal * Math.sin(pitchRads));
				this.vZ = Math.abs(vYOriginal * Math.cos(pitchRads));
			}
		} else if ( this.roll != 0 ) {
			// Calc Roll Vector with Trigonometry
			this.vX = vYOriginal * Math.cos(rollRads);
			this.vY = vYOriginal * Math.sin(rollRads);
		} else if ( this.pitch != 0 ) {
			// Calc Pitch Vector with Trigonometry
			this.vY = vYOriginal * Math.sin(pitchRads);
			this.vZ = vYOriginal * Math.cos(pitchRads);
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
		this.y <= 0 && this.vY <= 0 ? // Ground Check Factoring 0 Level with Negative Y Velocity
			this.heli.position.y += 0 : this.heli.position.y += this.vY*multiplier;
		// Invert Velocity Based on Roll Value
		this.heli.position.x += this.roll > 0 ? Math.abs(this.vX*multiplier)*-1 : Math.abs(this.vX*multiplier);
		// Invert Velocity Based on Pitch Value
		this.heli.position.z += this.pitch > 0 ? Math.abs(this.vZ*multiplier) : Math.abs(this.vZ*multiplier)*-1;
		// Need to add code to fix falling so it is relative to the ground and not the vectors of the helicopter

		this.x = this.heli.position.x;
		this.y = this.heli.position.y;
		this.z = this.heli.position.z;
	}

	getRadians(deg){
		return deg * Math.PI / 180;
	}

	updateState(){
		// Update State
		window.flightSim = {
			x: this.x,
			y: this.y,
			z: this.z,
			aX: this.aX,
			aY: this.aY,
			maxAX: this.maxAX,
			maxAY: this.maxAY,
			gravAOffset: this.gravAOffset,
			vX: this.vX,
			vY: this.vY,
			vZ: this.vZ,
			roll: this.roll,
			pitch: this.pitch,
			yaw: this.yaw,
			maxRoll: this.maxRoll,
			maxPitch: this.maxPitch,
			maxYaw: this.maxYaw,
			heliRotation: this.heli.rotation.y
		}
	}

	update(){
		this.updateVelocities();
		this.updateRotation();
		this.updatePosition();
		this.updateState();
		TWEEN.update();
	}

}

module.exports = Helicopter;