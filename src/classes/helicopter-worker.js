// Helicopter Collision Detection Web Worker

self.addEventListener("message", function(e){

	const data = JSON.parse(e.data);

	if (data.rayCasters !== undefined) {
		for (let i = 0; i < data.collidableMeshList.length; i++) {
			for (let n = 0; n < data.rayCasters.length; n++) {
				console.log(data.rayCasters[n]);
				// data.collidableMeshList[i].updateMatrixWorld()
				const collisionResults = data.rayCasters[n].intersectObjects( data.collidableMeshList[i], true )
				// if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
				if ( collisionResults.length > 0 ) {
					console.log("Collision");
					self.postMessage(true);
				} else {
					self.postMessage(false);
				}
				self.postMessage(false);
			}	
		}

	}

}, false);
