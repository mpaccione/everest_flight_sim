// Helicopter Degrees of Freedom
// X = -Xb + hθb
// Y = Yb + hφb
// Z = -Zb 

// Helicopter Simulation Differential Equations
// Mx = -H - Mg * θ || Roll moment = -(Longitudinal Force) - Mass*Gravity*Angular Velocity for the pitch angle
// My = Y + Ttr + Mg * φ || Pitch Moment = Lateral force + Traction force for tail rotor + Mass*Gravity*Angular Velocity for the roll angle

const THREE = require('THREE');

class Helicopter {

	constructor(cam = undefined){
		this.camera = cam;
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

		// Set Controls
		// Arrow Keys for Rotor Thrust
		// WASDQE Keys for Rotations
		window.addEventListener("keydown", (e) => {
			switch(e.key){
				case "ArrowLeft": 
					this.vX -= 5;
					break;
				case "ArrowUp":
					this.vY += 10;
					break;
				case "ArrowRight": 
					this.vX += 5;
					break;
				case "ArrowDown": 
					this.vY -= 10;
					break;
				case "w": 
					this.pitch += 2;
					break;
				case "s": 
					this.pitch -= 2;
					break;
				case "a": 
					this.roll -= 2;
					break;
				case "d":
					this.roll += 2;
					break;
				case "q": 
					this.yaw -= 2;
					break;
				case "e": 
					this.yaw += 2;
					break;
			}

			this.updateCameraRotation();
			this.updateCameraPosition();
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

	changeVelocity(newVelocity){
		this.v += newVelocity;
	}

	updateVectors(){
		// Arcade - Non Sim
		// Use Velocity of Main Rotors with Roll and Pitch

		// Use Velocity of Tail Rotors with Yaw
	} 

	updateCameraRotation(){
		this.camera.rotation.y = this.getRadians(this.yaw)
		this.camera.rotation.x = this.getRadians(this.roll)
		this.camera.rotation.z = this.getRadians(this.pitch)
	}

	updateCameraPosition(){

		let x = this.vX * Math.cos(this.yaw),
			y =	this.vY * Math.sin(this.pitch),
			z = this.vY * Math.cos(this.pitch);

		this.camera.position.set(new THREE.Vector3(x,y,z));
	}

	getRadians(deg){
		return deg * Math.PI / 180;
	}

	// updateVectorX(){
	// 	this.v * Math.cos(this.roll)

	// }


}

module.exports  = Helicopter;