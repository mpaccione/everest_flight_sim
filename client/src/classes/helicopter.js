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
		this.lookLeft = false;
		this.lookRight = false;
		this.lookDown = false;
		this.landed = false; // False for initial helipad
		this.start = false; // Boolean used for initial start

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
					if (this.landed && this.aY > this.gravAOffset) {
						this.landed = false;	
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
						console.log('flightTween')
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
						hoverEngine = new TWEEN.Tween( start )
									.to( end, 500 )
									.easing( TWEEN.Easing.Quadratic.Out )
									.onUpdate( (tween) => {
										this.aX = tween.aX;
										this.aY = tween.aY;
										this.vX = tween.vX;
										this.vY = tween.vY;
									} ).start(),
						hoverControls = new TWEEN.Tween( start )
									.to( end, 1000 )
									.easing( TWEEN.Easing.Quadratic.Out )
									.onUpdate( (tween) => {
										this.roll = tween.roll;
										this.yaw = tween.yaw;
										this.pitch = tween.pitch;
									} ).start();
					break;
				case "w":  // Angle Heli Down
					if (this.pitch > -this.maxPitch && !this.landed) {
						let start = { pitch: this.pitch },
							end = { pitch: this.pitch-4 };

						this.flightTween(start, end, this, "pitch");
					}
					break;
				case "s":  // Angle Heli Up
					if (this.pitch < this.maxPitch && !this.landed) {
						let start = { pitch: this.pitch },
							end = { pitch: this.pitch+4 };

						this.flightTween(start, end, this, "pitch");
					}				
					break;
				case "a": // Roll Heli Left
					if (this.roll < this.maxRoll && !this.landed) {
						let start = { roll: this.roll },
							end = { roll: this.roll+4 };

						this.flightTween(start, end, this, "roll");
					}
					break;
				case "d": // Roll Heli Right
					if (this.roll > -this.maxRoll && !this.landed) {
						let start = { roll: this.roll },
							end = { roll: this.roll-4 };
						
						this.flightTween(start, end, this, "roll");
					}
					break;
				case "q": // Turn Heli Right
					if (this.yaw < this.maxYaw && !this.landed) {
						let start = { yaw: this.yaw },
							end = { yaw: this.yaw+1 };

						this.flightTween(start, end, this, "yaw");
					}
					break;
				case "e": // Turn Heli Left
					if (this.yaw > -this.maxYaw && !this.landed) {
						let start = { yaw: this.yaw },
							end = { yaw: this.yaw-1 };

						this.flightTween(start, end, this, "yaw");
					}
					break;
				case "z": // Look Left and Down
					if (this.lookLeft == true && this.lookDown == false) {
						// Look Down
						this.lookDown = true;
						this.quaternionTween(-90, new THREE.Vector3( 1, 0, 0 ), this, "camera", 1000);
						document.getElementById("lWindow").classList = "zoomFrameIn";
					} else if (this.lookRight == false && this.lookLeft == false) {
						// Look Left
						this.lookLeft = true;						
						this.quaternionTween(90, new THREE.Vector3( 0, 1, 0 ), this, "camera", 1000);
						this.cockpitRotationTween(100, 1000);
					} else if (this.lookRight == true) {
						// Look Center
						this.lookRight = false;						
						this.quaternionTween(0, new THREE.Vector3( 0, 1, 0 ), this, "camera", 1000);
						this.cockpitRotationTween(0, 1000);
					} else if (this.lookRight == true && this.lookDown == true) {
						// Look Up
						this.lookDown = false;						
						this.quaternionTween(0, new THREE.Vector3( 1, 0, 0 ), this, "camera", 1000);
						document.getElementById("rWindow").classList = "zoomFrameOut";
					}
					break;
				case "x": // Look Right and Down
					if (this.lookRight == true && this.lookDown == false) {
						// Look Down
						this.lookDown = true;						
						this.quaternionTween(-90, new THREE.Vector3( 1, 0, 0 ), this, "camera", 1000);
						document.getElementById("rWindow").classList = "zoomFrameIn";						
					}
					else if (this.lookLeft == true) {
						// Look Center
						this.lookLeft = false;						
						this.quaternionTween(0, new THREE.Vector3( 0, 1, 0 ), this, "camera", 1000);
						this.cockpitRotationTween(0, 1000);
					} else if (this.lookLeft == false && this.lookRight == false) {
						// Look Right
						this.lookRight = true;						
						this.quaternionTween(-90, new THREE.Vector3( 0, 1, 0 ), this, "camera", 1000);
						this.cockpitRotationTween(-100, 1000);
					} else if (this.lookLeft == true && this.lookDown == true) {
						// Look Up
						this.lookDown = false;						
						this.quaternionTween(0, new THREE.Vector3( 1, 0, 0 ), this, "camera", 1000);
						document.getElementById("lWindow").classList = "zoomFrameOut";					
					}
					break;					
			}
		}, false);


	}

	flightTween(start, end, that, propName){
		// if (start[propName] % 1 === 0){
			const flightTween = new TWEEN.Tween( start )
									 .to( end, 200 )
									 .easing( TWEEN.Easing.Quadratic.Out )
									 .onUpdate( (tween) => {
										that[propName] = tween[propName];
									 } ).start();
			// console.log(start);
			// console.log(end);
		// }
	}

	quaternionTween(deg, vector, that, camera, time){
		console.log("quaternionTween");
		const sceneCamera = window.scene.getObjectByName(camera),
			  slerpStart  = sceneCamera.quaternion,
			  slerpTarget = new THREE.Quaternion().setFromAxisAngle( vector, that.getRadians(deg) ),
			  cameraTween = new TWEEN.Tween({ t: 0 })
								.to({ t: 1 }, time )
								.easing( TWEEN.Easing.Quadratic.Out )
								.onUpdate( (tween) => {
									// console.log(tween.t);
									sceneCamera.quaternion.slerp( slerpTarget, tween.t );
								 } ).start();

		// let newQuaternion = new THREE.Quaternion(), 
		// 	sceneCamera   = window.scene.getObjectByName('heliCam').children[0],
	 //     	slerpTarget   = new THREE.Quaternion().setFromAxisAngle( vector, that.getRadians(deg) );

	     // console.log("slerpStart");
	     // console.log(sceneCamera.quaternion);
	     // console.log("slerpTarget");
	     // console.log(slerpTarget);
	     // console.log("newQuaternion")
	     // console.log(newQuaternion);
	     // console.log("time");
	     // console.log(time);

		// THREE.Quaternion.slerp( sceneCamera.quaternion, slerpTarget, newQuaternion, time );
		// sceneCamera.applyQuaternion(newQuaternion);

	}

	cameraTween(deg, that, camera, time, callback){
		const sceneCamera = window.scene.getObjectByName(camera),
			  cameraTween = new TWEEN.Tween({ rotation: sceneCamera.rotation.y })
								.to({ rotation: that.getRadians(deg) }, time )
								.easing( TWEEN.Easing.Quadratic.Out )
								.onUpdate( (tween) => {
									sceneCamera.rotation.y = tween.rotation;
								 } )
								.onComplete( () => {
									callback();
								}).start();
	}

	cockpitRotationTween(translateX, time){
		console.log("cockpitRotationTween Time: "+time);
		const cockpit = document.getElementById("cockpit"),
			  cockpitTranslation = new TWEEN.Tween({ translation: parseInt(cockpit.style.left) })
								.to({ translation: translateX }, time )
								.easing( TWEEN.Easing.Quadratic.Out )
								.onUpdate( (tween) => {
									console.log(tween.translation);
									cockpit.style.left = tween.translation+"%";
								 } ).start()
	}

	cockpitZoomCameraDownTween(deg, that, camera, time, callback){
		const sceneCamera = window.scene.getObjectByName(camera),
			  cameraTween = new TWEEN.Tween({ rotation: sceneCamera.rotation.z })
								.to({ rotation: that.getRadians(deg) }, time )
								.easing( TWEEN.Easing.Quadratic.Out )
								.onUpdate( (tween) => {
									sceneCamera.rotation.z = tween.rotation;
								 } )
								.onComplete( () => {
									callback();
								}).start();
			  // cockpit = document.getElementById("cockpit"),
			  // cockpitTranslation = new TWEEN.Tween({ translation: parseInt(cockpit.style.left) })
					// 			.to({ translation: translateX }, time )
					// 			.easing( TWEEN.Easing.Quadratic.Out )
					// 			.onUpdate( (tween) => {
					// 				console.log(tween.translation+"%");
					// 				cockpit.style.left = tween.translation+"%";
					// 			 } ).start()
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
		if (this.landed === true) {
			this.vY = 0;
			this.vX = 0;
			this.vZ = 0;
			this.vR = 0;
		} else {
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

		// console.log("updateVelocities");
		// console.log("vY: "+this.vY);
		// console.log("vX: "+this.vX);
		// console.log("vZ: "+this.vZ);
		// console.log(window.flightSim.roll);
	}

	updateRotation(){
		// SET AS YXZ & Axis Method
		this.heli.rotation.y += this.getRadians(this.vR);
		this.heli.rotation.x = this.getRadians(this.pitch); // Swapped - Bug, don't change
		this.heli.rotation.z = this.getRadians(this.roll); // Swapped - Bug, don't change
	}

	updatePosition(){
		// Velocity Multiplier - Scaling speeds to different size landscapes
		const multiplier = 30,
			  position   = new THREE.Vector3(this.x, this.y, this.z);
		// Arcade Style & Translate Method
		// this.aY <= 200 ? // Ground Check Factoring 0 Level with Negative Y Velocity
			// this.heli.position.y -= this.vY*multiplier : this.heli.position.y += this.vY*multiplier;
		this.heli.position.y += this.vY*multiplier;
		// Invert Velocity Based on Roll Value
		this.heli.position.x += this.vX*multiplier;
		//this.heli.position.x += this.roll > 0 ? Math.abs(this.vX*multiplier)*-1 : Math.abs(this.vX*multiplier);
		// Invert Velocity Based on Pitch Value
		this.heli.position.z += this.vZ*multiplier;
		//this.heli.position.z += this.pitch > 0 ? Math.abs(this.vZ*multiplier) : Math.abs(this.vZ*multiplier)*-1;
		// Need to add code to fix falling so it is relative to the ground and not the vectors of the helicopter

		this.x = this.heli.position.x;
		this.y = this.heli.position.y;
		this.z = this.heli.position.z;
	}

	raycasterCollisionDetection(){
		const playerOrigin 	 = this.heli.children[1], // Get Box Mesh from Player Group
			  playerPosition = new THREE.Vector3( this.x, this.y, this.z );
		let   collision;

		for (var i = playerOrigin.geometry.vertices.length - 1; i >= 0; i--) {
			const localVertex      = playerOrigin.geometry.vertices[i].clone(),
				  globalVertex     = localVertex.applyMatrix4( playerOrigin.matrix ),
				  directionVector  = globalVertex.sub( playerPosition ),
				  ray              = new THREE.Raycaster( playerPosition, directionVector.clone().normalize(), 0, 60 ),
				  collisionResult  = ray.intersectObjects(window.collidableMeshList, true);

			if ( collisionResult.length > 0 ) {
				// console.log(collisionResult)
				// console.log("COLLISION");
				this.landed = true;
			}
		}
	}

	getRadians( deg ){
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
			heliRotation: this.heli.rotation.y,
			lookLeft: this.lookLeft,
			lookRight: this.lookRight,
			lookDown: this.lookDown,
			landed: this.landed,
			start: this.start
		}
	}

	update(){
		// if ( this.landed === false ) {
			this.updateRotation();
			this.updatePosition();
			this.updateState();
			this.updateVelocities();
			this.raycasterCollisionDetection();
		// }
		TWEEN.update();
	}

}

module.exports = Helicopter;