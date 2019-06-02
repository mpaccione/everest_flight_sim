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
		// Turn Animatable 
		this.turnLayer = new Konva.Layer();
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
		// Attitude Animatable
		this.attitudeLayer = new Konva.Layer();
		this.attitudeBGGroup = new Konva.Group({
			x: 299,
			y: 110
		});
		this.attitudePitchGroup = new Konva.Group({
		  	x: 299,
			y: 110
		});
		// Airspeed Animatable
		this.knotsLayer = new Konva.Layer();
		this.knotsNeedle = new Konva.Rect({
			x: -9,
			y: 0,
			width: 38,
			height: 2,
			fill: "#dbe4eb"
		});
		// Heading Animatable 
		this.headingLayer = new Konva.Layer();
		this.headingTextGroup = new Konva.Group({
			x: 503, 
			y: 110
		});
		this.headingTickGroup = new Konva.Group({
			x: 503,
			y: 110
		});

		this.drawGauges();
		this.drawTurnGauge();
		this.drawAltimeterGauge();
		this.drawAttitudeGauge();
		this.drawAirspeedGauge();
		this.drawHeadingGauge();
	}

	drawGauges( x, y ){
		const coordArr = [
			  	[ 96, 110 ],
			  	[ 198, 110 ],
			  	[ 299, 110 ],
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
		this.drawLabel(286, 162, "Attitude");
		this.drawLabel(384, 162, "Airspeed");
		this.drawLabel(488, 162, "Heading");

		this.stage.add(panelLayer);
		this.stage.add(this.gaugeTextLayer);
	}

	drawTurnGauge(){
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

		this.turnLayer.add(tickGroup);
		this.turnLayer.add(this.planeGroup); 

		this.stage.add(this.turnLayer);
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

	drawAttitudeGauge(){
		const skyBG = new Konva.Arc({
				innerRadius: 0,
				outerRadius: 43,
				fill: '#9abfe7',
				angle: 180,
				rotationDeg: -180
			  }),
			  groundBG = new Konva.Arc({
			  	innerRadius: 0,
			  	outerRadius: 43,
			  	fill: '#65514b',
				angle: 180,
				rotationDeg: 0
			  }),
			  xBarBG = new Konva.Rect({
			  	x: -42,
			  	y: -1,
			  	width: 84,
			  	height: 2,
			  	fill: "#dbe4eb"
			  }),
			  attitudeBarGroup = new Konva.Group({
			  	x: 299,
				y: 110
			  }),
			  pitchBarLeft = new Konva.Rect({
			  	x: -30,
			  	y: -1.5,
			  	width: 20,
			  	height: 3,
			  	fill: "#f0cf56"
			  }),
			  pitchBarRight = new Konva.Rect({
			  	x: 10,
			  	y: -1.5,
			  	width: 20,
			  	height: 3,
			  	fill: "#f0cf56"
			  }),
			  pitchDot = new Konva.Circle({
			  	x: 0,
			  	y: 0,
			  	radius: 2,
			  	fill: "#f0cf56"
			  }),
			  pitchBGBarOne = new Konva.Rect({
			  	x: -15,
			  	y: -18,
			  	width: 30,
			  	height: 1,
			  	fill: "#dbe4eb"
			  }),
			  pitchBGBarTwo  = new Konva.Rect({
			  	x: -10,
			  	y: -9,
			  	width: 20,
			  	height: 1,
			  	fill: "#dbe4eb"
			  }),
			  pitchBGBarThree  = new Konva.Rect({
			  	x: -10,
			  	y: 9,
			  	width: 20,
			  	height: 1,
			  	fill: "#dbe4eb"
			  }),
			  pitchBGBarFour  = new Konva.Rect({
			  	x: -15,
			  	y: 18,
			  	width: 30,
			  	height: 1,
			  	fill: "#dbe4eb"
			  });

		// attitudeBGGroup is Colored Background
		// attitudePitchGroup is White Pitch Bars
		// attitudeBarGroup is Yellow Pitch Reference 

		this.attitudeBGGroup.add(skyBG);
		this.attitudeBGGroup.add(groundBG);
		this.attitudeBGGroup.add(xBarBG);

		this.attitudePitchGroup.add(pitchBGBarOne);
		this.attitudePitchGroup.add(pitchBGBarTwo);
		this.attitudePitchGroup.add(pitchBGBarThree);
		this.attitudePitchGroup.add(pitchBGBarFour);

		attitudeBarGroup.add(pitchBarLeft);
		attitudeBarGroup.add(pitchDot);
		attitudeBarGroup.add(pitchBarRight);

		this.attitudeLayer.add(this.attitudeBGGroup);
		this.attitudeLayer.add(attitudeBarGroup);
		this.attitudeLayer.add(this.attitudePitchGroup)

		this.stage.add(this.attitudeLayer);
	}

	drawAirspeedGauge(){
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

	drawHeadingGauge(){
		const headingImgLayer = new Konva.Layer(),
			  headingImg = new Image();

		headingImg.src ="./src/img/heading-indicator.png";

		// Add Heading Indicator Image
		headingImg.onload = () => {
			const img = new Konva.Image({
				x: 485,
				y: 91,
				image: headingImg,
				width: 35,
				height: 35
			});

			headingImgLayer.add(img);
			this.stage.add(headingImgLayer);
		}

		// Calculate Outer Text Mathmatically
		for (var i = 0; i < 12; i++) {
			// Each Tick is 360/12 = 30 Degrees
			// Set Text - Offset by 4 Due to Rotation Bug
			let text = "";
			switch(i){
				case 0:
					text = "12"; // N - 12
					break;
				case 1:
					text = "15"; // 3 - 15
					break;
				case 2:
					text = "6"; // 6 - S
					break;
				case 3:
					text = "21"; // E - 21
					break;
				case 4:
					text = "24"; // 12 - 24
					break;
				case 5: 
					text = "W"; // 15 - W
					break;
				case 6: 
					text = "30"; // S - 30
					break;
				case 7:
					text = "33"; // 21 - 33
					break;
				case 8: 
					text = "N"; // 24 - N
					break;
				case 9:
					text = "3"; // W - 3
					break;
				case 10:
					text = "6"; // 30 - 6
					break;
				case 11:
					text = "E"; // 33 - E 
			}
			// Convert to Radians 
			const radians = 30 * (i+1) * (Math.PI/180),
				  x = 38 * Math.cos(radians),
				  y = 38 * Math.sin(radians),
				  textLabel = new Konva.Text({
					x: x-4,
					y: y-4,
					text: text,
					fill: '#dbe4eb',
					fontSize: 8
				  });

			// textLabel.rotation(-240);
			this.headingTextGroup.add(textLabel);
		}

		// Calculate Tick Marks Mathmatically
		for (var i = 0; i < 36; i++) {
			// Each Tick is 360/36 = 10 Degrees
			// Convert to Radians 
			const radians = 10* (i+1) * (Math.PI/180),
				  x = 25 * Math.cos(radians),
				  y = 25 * Math.sin(radians),
				  tick = new Konva.Rect({
				  	x: x,
				  	y: y,
				  	width: 5,
				  	height: 1,
				  	fill: "#dbe4eb"
				  });

			tick.rotation(10.5*i);
			this.headingTickGroup.add(tick);
		}

		// this.headingTextGroup.rotate(-90);
		// this.headingTickGroup.rotate(-90);

		// this.headingLayer.rotate(-120);

		this.headingLayer.add(this.headingTextGroup);
		this.headingLayer.add(this.headingTickGroup);
		this.stage.add(this.headingLayer);
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
		const turnGaugeAnimation = new Konva.Animation( (frame) => {
		    const yawSum = window.flightSim.yaw * (20/window.flightSim.maxYaw);

		    this.planeGroup.rotation(-window.flightSim.roll);
		    this.yawYBar.x(29.5 + -yawSum); 

		}, this.turnLayer);

		const altimeterGaugeAnimation = new Konva.Animation( (frame) => {
			const altitude = window.flightSim.y,
				  shortNeedleDeg = (altitude / 10000) * 36,
				  longNeedleDeg = (altitude / 1000) * 36;

			this.altimeterShortNeedle.rotation(shortNeedleDeg);
			this.altimeterLongNeedle.rotation(longNeedleDeg);

		}, this.altimeterLayer);

		const attitudeGaugeAnimation = new Konva.Animation( (frame) => {

		    this.attitudeBGGroup.rotation(window.flightSim.roll);
		    this.attitudePitchGroup.y(110 + (window.flightSim.pitch/2.5));

		}, this.attitudeLayer);

		const airspeedGaugeAnimation = new Konva.Animation( (frame) => {
			const aY = Math.abs(window.flightSim.aY - window.flightSim.gravAOffset),
				  knotsRatio = 25.714, // Max aY / (14/360)
				  needleDeg = (aY/100) * knotsRatio;

			this.knotsNeedle.rotation(needleDeg);

		}, this.knotsLayer);

		const headingGaugeAnimation = new Konva.Animation( (frame) => {
			const degrees = window.flightSim.heliRotation * 360;

		    this.headingTextGroup.rotation(degrees);
		    this.headingTickGroup.rotation(degrees);

		}, this.headingLayer);

		// Start Animations
		turnGaugeAnimation.start();
		altimeterGaugeAnimation.start();
		attitudeGaugeAnimation.start();
		airspeedGaugeAnimation.start();
		headingGaugeAnimation.start();

	}

}

module.exports = Cockpit;