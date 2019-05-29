// Helicopter Degrees of Freedom
// X = -Xb + hθb
// Y = Yb + hφb
// Z = -Zb 

// Helicopter Simulation Differential Equations
// Mx = -H - Mg * θ || Roll moment = -(Longitudinal Force) - Mass*Gravity*Angular Velocity for the pitch angle
// My = Y + Ttr + Mg * φ || Pitch Moment = Lateral force + Traction force for tail rotor + Mass*Gravity*Angular Velocity for the roll angle

const THREE = require('THREE');

class Helicopter {

	constructor(heli = undefined){
		this.heli = heli;
		this.model = undefined;
		this.mass = undefined;
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.vY = 0;
		this.vX = 0;
		this.roll = 0; // X Axis
		this.yaw = 0; // Y Axiz
		this.pitch = 0; // Z Axis
		this.maxRoll = 60;
		this.maxYaw = 10;
		this.maxPitch = 90;

		// Debuging
		// this.debuggingStats();

		// Set Controls
		// Arrow Keys for Rotor Thrust
		// WASDQE Keys for Rotations
		window.addEventListener("keydown", (e) => {
			switch(e.key){
				case "ArrowLeft": // Tail Rotor Thrust Negative
					this.vX = this.vX <= -0.1 ? this.vX : this.vX -= 0.01;
					break;
				case "ArrowUp": // Main Rotor Thrust Increase
					this.vY = this.vY >= 0.1 ? this.vY : this.vY += 0.01;
					break;
				case "ArrowRight": // Tail Rotor Thrust Positive
					this.vX = this.vX >= 0.1 ? this.vX : this.vX += 0.01;
					break;
				case "ArrowDown": // Main Rotor Thrust Decrease
					this.vY = this.vY <= -0.1 ? this.vY : this.vY -= 0.01;
					break;
				case " ": // Reset Rotors - Hover
					setTimeout(() => {
						this.vX = 0;
						this.vY = 0;
						this.roll = 0;
						this.yaw = 0;
						this.pitch = 0;
					}, 250);
					// Implement A Tween?
					// while(this.vX != 0 && this.vY != 0){
					// 	setTimeout(() => {
					// 		this.vX = this.vX > 0 ? this.vX -= 0.01 : this.vX += 0.01;
					// 		this.vY = this.vY > 0 ? this.vY -= 0.01 : this.vY += 0.01;
					// 	}, 50);
					// }
					break;
				case "w":  // Angle Heli Down
					this.pitch -= 2;
					break;
				case "s":  // Angle Heli Up
					this.pitch += 2;
					break;
				case "a": // Roll Heli Left
					this.roll += 2;
					break;
				case "d": // Roll Heli Right
					this.roll -= 2;
					break;
				case "q": // Turn Heli Right
					this.yaw += 2;
					break;
				case "e": // Turn Heli Left
					this.yaw -= 2;
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

	changeVelocityY(newVelocity){
		this.vY += newVelocity;
	}

	changeVelocityX(newVelocity){
		this.vX += newVelocity;
	}

	updateVectors(){
		// Arcade - Non Sim
		// Use Velocity of Main Rotors with Roll and Pitch

		// Use Velocity of Tail Rotors with Yaw
	} 

	updateRotation(){
		// SET AS YXZ
		this.heli.rotation.y = this.getRadians(this.yaw);
		this.heli.rotation.x = this.getRadians(this.pitch);
		this.heli.rotation.z = this.getRadians(this.roll);
	}

	updatePosition(){
		// Arcade Style
		let x,y,z;

		// X Axis
		x = this.roll == 0 ? 0 :
			this.roll > 0 ? 
				this.vX * (this.roll/this.maxRoll) :
				this.vX * (this.roll/this.maxRoll) * -1;

		// Y Axis
		y = this.yaw == 0 ? this.vY :
			this.yaw > 0 ?
				this.vY * ((90 - this.yaw)/90) :
				this.vY * ((90 - this.yaw)/90) * -1;

		// Z Axis
		z = this.pitch == 0 ? 0 :
			this.pitch > 0 ?
				this.vY * ((90 - this.pitch)/this.maxPitch) :
				this.vY * ((90 - this.pitch)/this.maxPitch) * -1

		
		this.heli.translateX(x);
		this.heli.translateY(y);
		this.heli.translateZ(z);
		this.x += x;
		this.y += y;
		this.z += z;
	}

	getRadians(deg){
		return deg * Math.PI / 180;
	}

	debuggingStats(){
		let html = `<ul>
						<li>Model: ${this.model}</li>
						<li>Mass: ${this.mass}</li>
						<li>x: ${this.x}</li>
						<li>y: ${this.y}</li>
						<li>z: ${this.z}</li>
						<li>vY: ${this.vY}</li>
						<li>vX: ${this.vX}</li>
						<li>roll: ${this.roll}</li>
						<li>yaw: ${this.yaw}</li>
						<li>pitch: ${this.pitch}</li>
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