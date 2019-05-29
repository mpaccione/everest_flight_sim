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
		this.aY = 0;
		this.aX = 0;
		this.vY = 0;
		this.vX = 0;
		this.roll = 0; // X Axis
		this.yaw = 0; // Y Axiz
		this.pitch = 0; // Z Axis
		this.maxRoll = 60;
		this.maxYaw = 10;
		this.maxPitch = 45;

		// Set Controls
		// Arrow Keys for Rotor Thrust
		// WASDQE Keys for Rotations
		window.addEventListener("keydown", (e) => {
			switch(e.key){
				case "ArrowLeft": // Tail Rotor Thrust Negative
					this.aX = this.aX <= 0 ? this.aX : this.aX -= 100;
					this.vX = this.aX/this.weight;
					break;
				case "ArrowUp": // Main Rotor Thrust Increase
					this.aY = this.aY >= this.maxAY ? this.aY : this.aY += 100;
					this.vY = this.aY <= this.gravAOffset ? 
						((this.aY/this.weight) * -1) + this.gravVOffset : (this.aY/this.weight) * -1;
					break;
				case "ArrowRight": // Tail Rotor Thrust Positive
					this.aX = this.aX >= this.maxAX ? this.aX : this.aX += 100;
					this.vX = this.aX/this.weight;
					break;
				case "ArrowDown": // Main Rotor Thrust Decrease
					this.aY = this.aY <= 0 ? this.aY : this.aY -= 100;
					this.vY = this.aY <= this.gravAOffset ? 
						((this.aY/this.weight) * -1) + this.gravVOffset : (this.aY/this.weight) * -1;
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

	updateRotation(){
		// SET AS YXZ & Axis Method
		this.heli.rotation.y += this.getRadians((this.vX*100) * (this.yaw/this.maxYaw));
		this.heli.rotation.x = this.getRadians(this.pitch);
		this.heli.rotation.z = this.getRadians(this.roll);
	}

	updatePosition(){
		// Arcade Style & Translate Method
		let x,y,z;

		x = this.roll == 0 ? 0 :
			this.roll > 0 ? 
				this.vX * (this.roll/this.maxRoll) :
				this.vX * (this.roll/this.maxRoll) * -1;

		y = this.weight/this.vY == 0 ? 0 :
			this.pitch > 0 ?
				this.vY * ((90 - this.pitch)/90) :
				this.vY * ((90 - this.pitch)/90) * -1;

		z = this.pitch == 0 ? 0 :
			this.pitch > 0 ?
				this.vY * ((this.pitch - 90)/this.maxPitch) :
				this.vY * ((this.pitch - 90)/this.maxPitch);

		this.x = this.heli.position.x;
		this.y = this.heli.position.y;
		this.z = this.heli.position.z;

		this.heli.translateX(x);
		this.y <= 0 && y <= 0 ? // Ground Check Factoring 0 Level
			this.heli.translateY(0) : this.heli.translateY(y);
		this.heli.translateZ(z);
	}

	getRadians(deg){
		return deg * Math.PI / 180;
	}

	debuggingStats(){
		let html = `<ul>
						<li>Model: ${this.model}</li>
						<li>Weight: ${this.weight}</li>
						<li>X: ${this.x}</li>
						<li>Y: ${this.y}</li>
						<li>Z: ${this.z}</li>
						<li>aY: ${this.aY}</li>
						<li>aX: ${this.aX}</li>
						<li>vY: ${this.vY}</li> 
						<li>vX: ${this.vX}</li>
						<li>Roll: ${this.roll}</li>
						<li>Yaw: ${this.yaw}</li>
						<li>Pitch: ${this.pitch}</li>
					</ul>`;

		document.getElementById("debugging-stats").innerHTML = html;
	}

	update(){
		this.updateRotation();
		this.updatePosition();
		this.debuggingStats();
	}

}

module.exports = Helicopter;