const Konva = require('konva');

class Cockpit {

	constructor(){
		this.container = document.getElementById("instrument-panel");
		this.stage = new Konva.Stage({
			container: this.container,
			width: this.container.offsetWidth,
			height: this.container.offsetHeight
		});
		this.gaugeTextLayer = new Konva.Layer();
		// Roll and Yaw Animatable 
		this.rollAndYawLayer = new Konva.Layer();
		this.planeGroup = new Konva.Group({
			x: 95.5,
			y: 110
		});
		this.yawYBar = new Konva.Rect({
		  	x: 29.5,
		  	y: 10,
		  	width: 1,
		  	height: 10,
		  	fill: "black"
		});
		// Altimeter Animatable
		this.altimeterLayer = new Konva.Layer();
		this.altimeterShortNeedle = new Konva.Rect({
			x: 0,
			y: 0,
			width: 19,
			height: 4,
			fill: "#dbe4eb"
		});
		this.altimeterLongNeedle = new Konva.Rect({
			x: 1,
			y: 0,
			width: 38,
			height: 2,
			fill: "#dbe4eb"
		});
		// Knots Animatable
		this.knotsLayer = new Konva.Layer();
		this.knotsNeedle = new Konva.Rect({
			x: -9,
			y: 0,
			width: 38,
			height: 2,
			fill: "#dbe4eb"
		});

		this.drawGauges();
		this.drawRollAndYawGauge();
		this.drawAltimeterGauge();
		this.drawKnotsGauge();
	}

	drawGauges( x, y ){
		const coordArr = [
			  	[ 96, 110 ],
			  	[ 198, 110 ],
			  	// [ 299, 110 ],
			  	[ 400, 110 ],
			  	[ 502, 110 ]
			  ],
			  panelLayer = new Konva.Layer();

		for (var i = coordArr.length - 1; i >= 0; i--) {
			const gauge = new Konva.Circle({ 
				 	radius: 44,
				 	fill: "#30373f"
				  });

			gauge.absolutePosition({ 
				x: coordArr[i][0],
				y: coordArr[i][1]
			})

			panelLayer.add(gauge);
		}

		this.drawLabel(87, 162, "Turn");
		this.drawLabel(181, 162, "Altimeter");
		this.drawLabel(286, 162, "Atitude");
		this.drawLabel(384, 162, "Airspeed");
		this.drawLabel(488, 162, "Heading");

		this.stage.add(panelLayer);
		this.stage.add(this.gaugeTextLayer);
	}

	drawRollAndYawGauge(){
		const tickGroup = new Konva.Group({
				x: 65.5,
				y: 110
			  }),
			  // Plane
			  planeDot = new Konva.Circle({
			  	x: 30,
			  	y: 0,
			  	radius: 4,
			  	fill: "#dbe4eb"
			  }),
			  planeWing = new Konva.Rect({
			  	x: 0,
			  	y: 0,
			  	width: 60,
			  	height: 2,
			  	fill: "#dbe4eb"
			  }),
			  planeXTail = new Konva.Rect({
			  	x: 20.5,
			  	y: -6,
			  	width: 20,
			  	height: 1,
			  	fill: "#dbe4eb"
			  }),
			  planeYTail = new Konva.Rect({
			  	x: 29.5,
			  	y: -12,
			  	width: 1,
			  	height: 6,
			  	fill: "#dbe4eb"
			  }),
			  // Yaw
			  yawXBar = new Konva.Rect({
			  	x: 10,
			  	y: 10,
			  	width: 40,
			  	height: 10,
			  	fill: "#dbe4eb"
			  }),
			  // Ticks
			  tickLOne = new Konva.Rect({
			  	x: -10,
			  	y: -6,
			  	width: 5,
			  	height: 1,
			  	fill: "#dbe4eb"
			  }),
			  tickLTwo = new Konva.Rect({
			  	x: 0,
			  	y: 12,
			  	width: 5,
			  	height: 1,
			  	rotation: 135,
			  	fill: "#dbe4eb"
			  }),
			  tickROne = new Konva.Rect({
			  	x: 65,
			  	y: -6,
			  	width: 5,
			  	height: 1,
			  	fill: "#dbe4eb"
			  }),
			  tickRTwo = new Konva.Rect({
			  	x: 60,
			  	y: 12,
			  	width: 5,
			  	height: 1,
			  	rotation: 45,
			  	fill: "#dbe4eb"
			  }),
			  tickLText = new Konva.Text({
			  	x: 10,
			  	y: 25,
			  	text: 'L',
			  	fill: '#dbe4eb',
			  	fontSize: 8
			  }),
			  tickRText = new Konva.Text({
			  	x: 45,
			  	y: 25,
			  	text: 'R',
			  	fill: '#dbe4eb',
			  	fontSize: 8
			  })

		tickGroup.add(yawXBar);
		tickGroup.add(this.yawYBar);     // Animated for Yaw
		tickGroup.add(tickLOne);
		tickGroup.add(tickLTwo);
		tickGroup.add(tickROne);
		tickGroup.add(tickRTwo);
		tickGroup.add(tickLText);
		tickGroup.add(tickRText);

		this.planeGroup.add(planeWing);  // Animated for Pitch
		this.planeGroup.add(planeXTail); // Animated for Pitch
		this.planeGroup.add(planeYTail); // Animated for Pitch
		this.planeGroup.add(planeDot);   // Animated for Pitch

		this.planeGroup.offsetX(this.planeGroup.getClientRect().width/2);
		this.planeGroup.offsetY(this.planeGroup.getClientRect().height/2);

		this.rollAndYawLayer.add(tickGroup);
		this.rollAndYawLayer.add(this.planeGroup); 

		this.stage.add(this.rollAndYawLayer);
	}

	drawAltimeterGauge(){
		const altimeterTickGroup = new Konva.Group({
				x: 196, 
				y: 105
			  });

		// Calculate Tick Marks Mathmatically
		for (var i = 0; i < 10; i++) {
			// Each Tick is 360/10 = 36 Degrees
			// Convert to Radians 
			const radians = 36*(i+1) * (Math.PI/180),
				  x = 38 * Math.cos(radians),
				  y = 38 * Math.sin(radians),
				  tick = new Konva.Text({
					x: x,
					y: y,
					text: i,
					fill: '#dbe4eb',
					fontSize: 10
				  });

			tick.rotation(126);
			altimeterTickGroup.add(tick);
		}

		altimeterTickGroup.rotation(-126);
		this.altimeterShortNeedle.rotation(-90);
		this.altimeterLongNeedle.rotation(-90);

		altimeterTickGroup.add(this.altimeterShortNeedle);
		altimeterTickGroup.add(this.altimeterLongNeedle);
		this.altimeterLayer.add(altimeterTickGroup);

		this.stage.add(this.altimeterLayer);

	}

	drawRollAndPitchGauge(){
		
	}

	drawKnotsGauge(){
		const knotsTickGroup = new Konva.Group({
				x: 396, 
				y: 106
			  });

		// Calculate Tick Marks Mathmatically
		for (var i = 0; i < 14; i++) {
			// Each Tick is 360/14 = 25.714 Degrees
			// Convert to Radians 
			const radians = 25.714*(i+1) * (Math.PI/180),
				  x = 38 * Math.cos(radians),
				  y = 38 * Math.sin(radians),
				  tick = new Konva.Text({
					x: x,
					y: y,
					text: i*10,
					fill: '#dbe4eb',
					fontSize: 8
				  });

			tick.rotation(126);
			knotsTickGroup.add(tick);
		}

		this.knotsNeedle.rotation(-126);
		knotsTickGroup.rotation(-126);

		knotsTickGroup.add(this.knotsNeedle);
		this.knotsLayer.add(knotsTickGroup);
		this.stage.add(this.knotsLayer);
	}

	drawRPMGauge(){
		
	}

	drawLabel( x, y, text ){
		const label = new Konva.Text({
			x: x,
			y: y,
			text: text,
			fill: '#dbe4eb',
			fontSize: 9
		});

		this.gaugeTextLayer.add(label);
	}

	animate(){
		const rollAndYawGaugeAnimation = new Konva.Animation( (frame) => {
		    const time = frame.time,
		          timeDiff = frame.timeDiff,
		          frameRate = frame.frameRate,
		          yawSum = window.flightSim.yaw * (20/window.flightSim.maxYaw);

		    this.planeGroup.rotation(-window.flightSim.roll);
		    this.yawYBar.x(29.5 + -yawSum); 

		    // update stuff
		}, this.rollAndYawLayer);

		const altimeterGaugeAnimation = new Konva.Animation( (frame) => {
			const altitude = window.flightSim.y,
				  shortNeedleDeg = (altitude / 10000) * 36,
				  longNeedleDeg = (altitude / 1000) * 36;

			this.altimeterShortNeedle.rotation(shortNeedleDeg);
			this.altimeterLongNeedle.rotation(longNeedleDeg);

		    // update stuff
		}, this.altimeterLayer);

		const knotsGaugeAnimation = new Konva.Animation( (frame) => {
			const aY = Math.abs(window.flightSim.aY - window.flightSim.gravAOffset),
				  knotsRatio = 25.714, // Max aY / (14/360)
				  needleDeg = (aY/100) * knotsRatio;

			this.knotsNeedle.rotation(needleDeg);

		    // update stuff
		}, this.knotsLayer);

		// Start Animations
		rollAndYawGaugeAnimation.start();
		altimeterGaugeAnimation.start();
		knotsGaugeAnimation.start();

	}

}

module.exports = Cockpit;