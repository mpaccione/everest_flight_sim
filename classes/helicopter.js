// Helicopter Degrees of Freedom
// X = -Xb + hθb
// Y = Yb + hφb
// Z = -Zb 

// Helicopter Simulation Differential Equations
// Mx = -H - Mg * θ || Roll moment = -(Longitudinal Force) - Mass*Gravity*Angular Velocity for the pitch angle
// My = Y + Ttr + Mg * φ || Pitch Moment = Lateral force + Traction force for tail rotor + Mass*Gravity*Angular Velocity for the roll angle

const THREE = require('THREE');

class Helicopter {

	constructor(heli = undefined, model = undefined, weight = 14000){
		this.heli = heli;
		this.model = model;
		this.weight = weight;
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.maxAY = 2000;
		this.maxAX = 400;
		this.gravAOffset = 200;
		this.gravVOffset = 0.15;
		this.aX = 0;
		this.aY = 0;
		this.vX = 0;
		this.vY = 0;
		this.vZ = 0;
		this.roll = 0; // X Axis
		this.yaw = 0; // Y Axiz
		this.pitch = 0; // Z Axis
		this.maxRoll = 60;
		this.maxYaw = 10;
		this.maxPitch = 60;

		// Set Controls
		// Arrow Keys for Rotor Thrust
		// WASDQE Keys for Rotations
		window.addEventListener("keydown", (e) => {
			switch(e.key){
				case "ArrowLeft": // Tail Rotor Thrust Negative
					this.aX = this.aX <= 0 ? this.aX : this.aX -= 100;
					break;
				case "ArrowUp": // Main Rotor Thrust Increase
					this.aY = this.aY >= this.maxAY ? this.aY : this.aY += 100;
					break;
				case "ArrowRight": // Tail Rotor Thrust Positive
					this.aX = this.aX >= this.maxAX ? this.aX : this.aX += 100;
					break;
				case "ArrowDown": // Main Rotor Thrust Decrease
					this.aY = this.aY <= 0 ? this.aY : this.aY -= 100;
					break;
				case " ": // Reset Rotors - Hover
					// Need to Tween in Future
					setTimeout(() => {
						this.aX = 0;
						this.aY = this.gravAOffset;
						this.vX = 0;
						this.vY = 0;
						this.roll = 0;
						this.yaw = 0;
						this.pitch = 0;
					}, 250);
					break;
				case "w":  // Angle Heli Down
					this.pitch = this.pitch > -this.maxPitch ? 
						this.pitch -= 2 : this.pitch;
					break;
				case "s":  // Angle Heli Up
					this.pitch = this.pitch < this.maxPitch ? 
						this.pitch += 2 : this.pitch;
					break;
				case "a": // Roll Heli Left
					this.roll = this.roll < this.maxRoll ?
						this.roll += 2 : this.roll;
					break;
				case "d": // Roll Heli Right
					this.roll = this.roll > -this.maxRoll ?
						this.roll -= 2 : this.roll;
					break;
				case "q": // Turn Heli Right
					this.yaw = this.yaw < this.maxYaw ?
						this.yaw += 2 : this.yaw;
					break;
				case "e": // Turn Heli Left
					this.yaw = this.yaw > -this.maxYaw ?
						this.yaw -= 2 : this.yaw;
					break;
			}
			console.log(e);
		}, false);

	}

	changePitch(newPitch){
		// + Up || - Down
		this.pitch += newPitch;
	}

	changeRoll(newRoll){
		// + Right || - Left
		this.roll += newRoll;
	}

	changeYaw(newYaw){
		// + Right || - Left
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
		// Initial Y velocity from accel & gravity
		this.vY = this.aY <= this.gravAOffset ? (this.aY/this.weight) - this.gravVOffset : (this.aY/this.weight);
		// Refactor Y Velocity based on roll / pitch
		if (this.roll != 0 && this.pitch == 0) {
			this.vY = this.vY - (this.vY * (this.roll/this.maxRoll));
		} else if (this.roll == 0 && this.pitch != 0) {
			this.vY = this.vY - (this.vY * (this.pitch/this.maxPitch));
		} else {
			// Get Y Velocity when rolling AND pitching
			this.vY = this.pitch > this.roll ? 
				this.vY - (this.vY * (this.pitch/this.maxPitch)) : 
				this.vY - (this.vY * (this.roll/this.maxRoll));
		}

		// X Velocity is Y Velocity fraction using roll degree
		this.vX = this.roll == 0 ? 0 : (this.aY/this.weight) * (this.roll/this.maxRoll);
		// Get X Velocity when rolling AND pitching
		if (this.roll != 0 && this.pitch != 0) {
			let totalNonYVelocity = this.pitch > this.roll ? 
				this.vY * (this.pitch/this.maxPitch) : 
				this.vY * (this.roll/this.maxRoll);

			this.vX = totalNonYVelocity * (this.roll/this.maxRoll);
			this.vZ = totalNonYVelocity * (this.pitch/this.maxPitch); 
		}

		// Set Z Velocity if no roll, if roll Z is set above
		if (this.roll == 0) {
			this.vZ = this.pitch == 0 ? 0 : (this.aY/this.weight) * (this.pitch/this.maxPitch);
		}
	}

	updateRotation(){
		// SET AS YXZ & Axis Method
		this.heli.rotation.y += this.getRadians((this.vX*100) * (this.yaw/this.maxYaw));
		this.heli.rotation.x = this.getRadians(this.pitch);
		this.heli.rotation.z = this.getRadians(this.roll);
	}

	updatePosition(){
		// Arcade Style & Translate Method
		this.heli.translateX(this.vX);
		this.y <= 0 && this.vY <= 0 ? // Ground Check Factoring 0 Level with Negative Y Velocity
			this.heli.translateY(0) : this.heli.translateY(this.vY);
		this.heli.translateZ(this.vZ);

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
	}

}

module.exports = Helicopter;