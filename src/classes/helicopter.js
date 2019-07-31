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
		this.heli        = heli;
		this.model       = model;
		this.weight      = weight;
		this.x           = 0;
		this.y           = 0;
		this.z           = 0;
		this.maxAY       = 1600;
		this.maxAX       = 3;
		this.gravAOffset = 200;
		this.gravVOffset = -0.15;
		this.aX          = 0;
		this.aY          = 0;
		this.vX          = 0;
		this.vY          = 0;
		this.vZ          = 0;
		this.vR          = 0;
		this.roll        = 0;  // X Axis
		this.yaw         = 0;   // Y Axiz
		this.pitch       = 0; // Z Axis
		this.maxRoll     = 45;
		this.maxYaw      = 4;
		this.maxPitch    = 45;
		this.lookLeft    = false;
		this.lookRight   = false;
		this.lookDown    = false;
		this.landed      = false; // False for initial helipad
		this.start       = false;  // Boolean used for initial start
		this.rayCasters  = [];
		this.colWorker   = null;
		this.collision   = false;

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
				case "z": // Look Left and Down
					if (this.lookLeft == true && this.lookDown == false) {
						// Look Down from Left Position
						console.log("Z1");
						this.lookDown = true;
						this.quaternionTween(-90, new THREE.Vector3( 1, 0, 0 ), this, "camera", 1000);
						document.getElementById("lWindow").classList = "zoomFrameIn";
					} else if (this.lookRight == false && this.lookLeft == false) {
						// Look Left from Center
						console.log("Z2");
						this.lookLeft  = true;	
						this.lookRight = false;
						this.lookDown  = false;					
						this.quaternionTween(90, new THREE.Vector3( 0, 1, 0 ), this, "camera", 1000);
						this.cockpitRotationTween(100, 1000);
					} else if (this.lookRight == true && this.lookDown == false) {
						// Look Center from Right
						console.log("Z3");
						this.lookLeft  = false;
						this.lookRight = false;		
						this.lookDown  = false;											
						this.quaternionTween(0, new THREE.Vector3( 0, 1, 0 ), this, "camera", 1000);
						this.cockpitRotationTween(0, 1000);
					} 
					else if (this.lookRight == true && this.lookDown == true) {
						// Look Up to Center but animate through other transitions
						console.log("Z4");
						this.lookDown = false;		
						this.quaternionTween(-90, new THREE.Vector3( 0, 1, 0 ), this, "camera", 1000);				
						// this.quaternionTween(0, new THREE.Vector3( 1, 0, 0 ), this, "camera", 1000);
						document.getElementById("rWindow").classList = "zoomFrameOut";
					}
					break;
				case "x": // Look Right and Down
					if (this.lookRight == true && this.lookDown == false) {
						// Look Down
						console.log("X1");
						this.lookDown = true;						
						this.quaternionTween(-90, new THREE.Vector3( 1, 0, 0 ), this, "camera", 1000);
						document.getElementById("rWindow").classList = "zoomFrameIn";						
					} else if (this.lookLeft == false && this.lookRight == false) {
						// Look Right
						console.log("X2")
						this.lookLeft  = false; 
						this.lookRight = true;
						this.lookDown  = false;						
						this.quaternionTween(-90, new THREE.Vector3( 0, 1, 0 ), this, "camera", 1000);
						this.cockpitRotationTween(-100, 1000);
					} else if (this.lookLeft == true && this.lookDown == false) {
						// Look Center
						console.log("X3")
						this.lookLeft  = false;
						this.lookRight = false;		
						this.lookDown  = false;							
						this.quaternionTween(0, new THREE.Vector3( 0, 1, 0 ), this, "camera", 1000);
						this.cockpitRotationTween(0, 1000);
					} 
					else if (this.lookLeft == true && this.lookDown == true) {
						console.log("X4");
						// Look Up
						this.lookDown = false;		
						this.quaternionTween(90, new THREE.Vector3( 0, 1, 0 ), this, "camera", 1000);				
						// this.quaternionTween(0, new THREE.Vector3( 1, 0, 0 ), this, "camera", 1000);
						document.getElementById("lWindow").classList = "zoomFrameOut";					
					}
					break;					
			}
		}, false);


		// Initialize Collision Detection Web Worker
		// this.colWorker = new Worker('./src/classes/helicopter-worker.js');

		// this.colWorker.addEventListener("message", function(e){
		// 	this.collision = e.data;
		// });

	}

	flightTween(start, end, that, propName){
		if (start[propName] % 1 === 0){
			const flightTween = new TWEEN.Tween( start )
									 .to( end, 200 )
									 .easing( TWEEN.Easing.Quadratic.Out )
									 .onUpdate( (tween) => {
									 	console.log(`flightTween: ${that[propName]}`);
										that[propName] = tween[propName];
									 } ).start();
			console.log(start);
			console.log(end);
		}
	}

	quaternionTween(deg, vector, that, camera, time){
		const sceneCamera = window.scene.getObjectByName(camera),
			  slerpTarget = new THREE.Quaternion().setFromAxisAngle( vector, that.getRadians(deg) ),
			  cameraTween = new TWEEN.Tween({ t: 0 })
								.to({ t: 1 }, time )
								.easing( TWEEN.Easing.Quadratic.Out )
								.onUpdate( (tween) => {
									console.log(`quaternionTween: ${tween.t}`);
									sceneCamera.quaternion.slerp( slerpTarget, tween.t );
								 } ).start();
	}

	cameraTween(deg, that, camera, time, callback){
		const sceneCamera = window.scene.getObjectByName(camera),
			  cameraTween = new TWEEN.Tween({ rotation: sceneCamera.rotation.y })
								.to({ rotation: that.getRadians(deg) }, time )
								.easing( TWEEN.Easing.Quadratic.Out )
								.onUpdate( (tween) => {
									console.log(`cameraTween: ${tween.rotation}`);
									sceneCamera.rotation.y = tween.rotation;
								 } )
								.onComplete( () => {
									callback();
								}).start();
	}

	cockpitRotationTween(translateX, time){
		const cockpit = document.getElementById("cockpit"),
			  cockpitTranslation = new TWEEN.Tween({ translation: parseInt(cockpit.style.left) })
								.to({ translation: translateX }, time )
								.easing( TWEEN.Easing.Quadratic.Out )
								.onUpdate( (tween) => {
									console.log(`cockpitRotationTween: ${tween.translation}`);
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

		// console.log("updateVelocities");
		// console.log("vY: "+this.vY);
		// console.log("vX: "+this.vX);
		// console.log("vZ: "+this.vZ);
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

	collisionDetection(){
		console.log("collisionDetection()");

		const obj = {
			rayCasters: this.rayCasters, 
			collidableMeshList: window.collidableMeshList
		}

		// console.log(obj);

		this.colWorker.postMessage(JSON.stringify(obj));

		// if (this.rayCasters !== undefined) {
		// 	for (let i = 0; i < window.collidableMeshList.length; i++) {
		// 		for (let n = 0; n < this.rayCasters.length; n++) {
		// 			const collisionResults = this.rayCasters[n].intersectObject( window.collidableMeshList[i], true )
		// 			// if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
		// 			if ( collisionResults.length > 0 ) {
		// 				this.landed = true;
		// 				console.log("Collision with vectorLength")
		// 			}
		// 		}	
		// 	}

		// }

	}

	createRayCasters(){
		console.log("createRayCasters()");
		const playerOrigin = this.heli.children[1].clone(); // Get Box Mesh from Player Group

		for (var i = 0; i < playerOrigin.geometry.vertices.length; i++) {
			const localVertex      = playerOrigin.geometry.vertices[i].clone(),
				  globalVertex     = localVertex.applyMatrix4( playerOrigin.matrix ),
				  directionVector  = globalVertex.sub( playerOrigin.position ),
				  ray              = new THREE.Raycaster( playerOrigin.position, directionVector.clone().normalize(), 0, 4 );

			this.rayCasters.push(ray);
		}

	}

	startCollisionDetection(){
		console.log("startCollisionDetection()");
		setTimeout(() => {
			this.createRayCasters(); // Wait for things to load a bit
		}, 500);

		setInterval(() => {
			this.collisionDetection(); // Throttling for performance reasons
		}, 1000);

	}

	getRadians( deg ){
		return deg * Math.PI / 180;
	}

	updateState(){
		// Update State
		window.flightSim = {
			x:            this.x,
			y:            this.y,
			z:            this.z,
			aX:           this.aX,
			aY:           this.aY,
			maxAX:        this.maxAX,
			maxAY:        this.maxAY,
			gravAOffset:  this.gravAOffset,
			vX:           this.vX,
			vY:           this.vY,
			vZ:           this.vZ,
			roll:         this.roll,
			pitch:        this.pitch,
			yaw:   		  this.yaw,
			maxRoll: 	  this.maxRoll,
			maxPitch: 	  this.maxPitch,
			maxYaw: 	  this.maxYaw,
			heliRotation: this.heli.rotation.y,
			lookLeft: 	  this.lookLeft,
			lookRight: 	  this.lookRight,
			lookDown: 	  this.lookDown,
			landed: 	  this.landed,
			start: 		  this.start,
			rayCasters:   this.rayCasters 
		}
	}

	update(){
		if ( this.landed == false && this.collision == false ) {
			this.updateRotation();
			this.updatePosition();
			this.updateState();
			this.updateVelocities();
		}
		TWEEN.update();
	}

}

module.exports = Helicopter;