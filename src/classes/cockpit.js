const Konva = require('konva');

class Cockpit {

	constructor(){
		this.container = document.getElementById("instrument-panel");
		this.stage = new Konva.Stage({
			container: this.container,
			width: this.container.offsetWidth,
			height: this.container.offsetHeight
		});
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

		this.drawGauges();
		this.drawRollAndYawGauge();
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

		this.stage.add(panelLayer);
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
			  	y: 0,
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
			  	y: 0,
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

		window.planeGroup = this.planeGroup;
		console.log(this.planeGroup);

		this.rollAndYawLayer.add(tickGroup);
		this.rollAndYawLayer.add(this.planeGroup); 

		this.stage.add(this.rollAndYawLayer);

		console.log(this.yawYBar);

	}

	drawAltimeterGauge(){
	
	}

	drawRollAndPitchGauge(){
		
	}

	drawKnotsGauge(){
		
	}

	drawRPMGauge(){
		
	}

	animate(){
		console.log("K Animate");

		const rollAndYawGaugeAnimation = new Konva.Animation( (frame) => {
		    const time = frame.time,
		          timeDiff = frame.timeDiff,
		          frameRate = frame.frameRate,
		          yawSum = window.flightSim.yaw * (20/window.flightSim.maxYaw);

		    console.log(this.yawYBar.attrs.x + yawSum);

		    this.planeGroup.rotation(-window.flightSim.roll);
		    this.yawYBar.x(29.5 + -yawSum); 

		    // update stuff
		}, this.rollAndYawLayer);

		rollAndYawGaugeAnimation.start();
	}

}

module.exports = Cockpit;