function initHelicopterAudio(){
	// const that = this;
	// console.log(that);
	try {
		// Remove Event Listener
		window.removeEventListener("keydown", initHelicopterAudio);
		// Fix up for prefixing
		window.AudioContext = window.AudioContext || window.webkitAudioContext;

		let audioCtx = new AudioContext(),
		    req = new XMLHttpRequest();

		req.open('GET', 'http://localhost/flight_sim/src/audio/helicopter_in_flight', true);
		req.responseType = 'arraybuffer';

		// Decode Asynchronously
		req.onload = function(event){ 
			audioCtx.decodeAudioData(req.response, function(buffer){
				window.source = audioCtx.createBufferSource();
				window.source.buffer = buffer; 
				window.source.connect(audioCtx.destination);
				window.source.playbackRate.value = window.flightSim.aY/1600;
				window.source.start(0);
				window.source.loop = true;

				window.addEventListener("keydown", function(){
					window.source.playbackRate.value = window.flightSim.aY/1600;
				});
			}, console.log(event));
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