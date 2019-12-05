const TWEEN = require('@tweenjs/tween.js');

function initHelicopterAudio(){
	// const that = this;
	// console.log(that);
	try {
		console.log('initHelicopterAudio');
		// Remove Event Listener
		window.removeEventListener("keydown", initHelicopterAudio);
		// Fix up for prefixing
		window.AudioContext = window.AudioContext || window.webkitAudioContext;

		let audioCtx = new AudioContext(),
		    req = new XMLHttpRequest();

		req.open('GET', 'http://localhost/flight_sim/client/src/audio/helicopter_in_flight', true);
		req.responseType = 'arraybuffer';

		// Decode Asynchronously
		req.onload = function(event){ 
			console.log('req.onload');
			console.log(req.response);

			audioCtx.decodeAudioData(req.response, function(buffer){
				window.sourceGain = audioCtx.createGain(); 
				window.source = audioCtx.createBufferSource();
				window.source.buffer = buffer;
				window.source.loop = true;

				window.source.connect(audioCtx.destination);
				window.sourceGain.connect(audioCtx.destination);
				window.source.start(0);

				window.addEventListener("keydown", function(e){
					// Tween Audio Frequency In Relation To Acceleration
					const audioTween = new TWEEN.Tween({ playbackRate: window.source.playbackRate.value })
											.to({ playbackRate: window.flightSim.aY/1600 }, 500 )
											.easing( TWEEN.Easing.Quadratic.Out )
											.onUpdate( (tween) => {
												window.source.playbackRate.value = tween.playbackRate;
											} ).start();

					// If Leaning Outside Cockpit Make Volume Loud
					if ( e.key == "z" && window.flightSim.lookLeft == true && window.flightSim.lookDown == false ||
						 e.key == "x" && window.flightSim.lookRight == true && window.flightSim.lookDown == false) {
						window.sourceGain.gain.setValueAtTime(10, window.source.context.currentTime + 1);
					} else if ( e.key == "z" && window.flightSim.lookRight == true & window.flightSim.lookDown == true ||
					            e.key == "x" && window.flightSim.lookLeft == true && window.flightSim.lookDown == true ) {
						window.sourceGain.gain.setValueAtTime(1, window.source.context.currentTime + 1);
					}

					console.log("sourceGain Value");
					console.log(window.sourceGain.gain.value);
				});
			}, function(err){
				console.log(err)
			});
		}

		req.send();
	}
	catch(e) {
		alert('Web Audio API is not supported in this browser');
	}
}

class HelicopterAudio {

	constructor(){
		window.addEventListener("keydown", initHelicopterAudio);
	}

}

module.exports = HelicopterAudio;