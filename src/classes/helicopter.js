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

	constructor(heli = undefined, model = undefined, weight = 14000, debug = false, mipMapObj = false){
		this.heli = heli;
		this.model = model;
		this.weight = weight;
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.maxAY = 2000;
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
		this.maxYaw = 1;
		this.maxPitch = 45;
		// Auxillary Props
		this.mipMapObj = mipMapObj;
		this.debug = debug;

		// Set Controls
		// Arrow Keys for Rotor Thrust
		// WASDQE Keys for Rotations
		window.addEventListener("keydown", (e) => {
			console.log("keydown");
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
						// Fixing Yaw on Reset
						if (this.mipMapObj != false) {
							let mipMapStart = {
									mipMapObjRotationY: this.mipMapObj.rotation.y
								},
								mipMapEnd = {
									mipMapObjRotationY: 0
								},
								mipMapTween = new TWEEN.Tween( mipMapStart )
													.to( mipMapEnd )
													.easing( TWEEN.Easing.Quadratic.Out )
													.onUpdate( (tween) => {
														this.mipMapObj.rotation.y = tween.mipMapObjRotationY
													} ).start();
						}
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
		let gravSimY = this.aY/this.weight,
			gravSimX = this.aX/this.weight, // Not realistic but need to have similar ratio as vertical multiplier
			pitchRatio = this.pitch/this.maxPitch,
			rollRatio = this.roll/this.maxRoll,
			yawRatio = this.yaw/this.maxYaw;

		// Y velocity from accel & gravity
		this.vY = this.aY <= this.gravAOffset ? gravSimY - this.gravVOffset : gravSimY;
		// X Velocity is Y Velocity fraction using roll degree
		this.vX = this.roll == 0 ? 0 : -gravSimY * rollRatio;
		// Z Velocity if no roll, if roll Z is set below
		if (this.roll == 0) {
			this.vZ = this.pitch == 0 ? 0 : gravSimY * pitchRatio;
		}
		// Rotational Velocity
		this.vR = this.aX * yawRatio;

		// Refactor Y Velocity based on roll / pitch
		if (this.roll != 0 && this.pitch == 0) {
			this.vY = this.vY + -Math.abs((this.vY * rollRatio));
		} else if (this.roll == 0 && this.pitch != 0) {
			this.vY = this.vY + -Math.abs((this.vY * pitchRatio));
		} else {
			// Get Y Velocity when rolling AND pitching
			this.vY = this.pitch > this.roll ? this.vY + -Math.abs((this.vY * pitchRatio)) : this.vY + -Math.abs((this.vY * rollRatio));
		}

		// Get X Velocity when rolling AND pitching
		if (this.roll != 0 && this.pitch != 0) {
			let totalNonYVelocity = this.pitch > this.roll ? this.vY * pitchRatio : this.vY * rollRatio;

			this.vX = totalNonYVelocity * rollRatio;
			this.vZ = totalNonYVelocity * pitchRatio; 
		}
	}

	updateRotation(){
		// SET AS YXZ & Axis Method
		this.heli.rotation.y += this.getRadians(this.vR);
		this.heli.rotation.x = this.getRadians(this.pitch);
		this.heli.rotation.z = this.getRadians(this.roll);
		// Have MipMap Camera Duplicate Angles
		// Negative Values ??? Something to potentially debug
		if (this.mipMapObj != false) {
			this.mipMapObj.rotation.y += -this.getRadians(this.vR);
			this.mipMapObj.rotation.x = this.getRadians(this.pitch);
			this.mipMapObj.rotation.z = -this.getRadians(this.roll);			
		}
	}

	updatePosition(){
		// Velocity Multiplier - Scaling speeds to different size landscapes
		const multiplier = 30;
		// Arcade Style & Translate Method
		this.heli.translateX(this.vX*multiplier);
		this.y <= 0 && this.vY <= 0 ? // Ground Check Factoring 0 Level with Negative Y Velocity
			this.heli.translateY(0) : this.heli.translateY(this.vY*multiplier);
		this.heli.translateZ(this.vZ*multiplier);

		// Need to add code to fix falling so it is relative to the ground and not the vectors of the helicopter

		this.x = this.heli.position.x;
		this.y = this.heli.position.y;
		this.z = this.heli.position.z;
	}

	getRadians(deg){
		return deg * Math.PI / 180;
	}

	debuggingStats(){
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
		if (this.debug == true){
			this.debuggingStats();
		}
		TWEEN.update();
	}

}

module.exports = Helicopter;