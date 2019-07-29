// Helicopter Collision Detection Web Worker

self.addEventListener("message", function(e){

	console.log(e);

	if (e.data.rayCasters !== undefined) {
		for (let i = 0; i < e.data.collidableMeshList.length; i++) {
			for (let n = 0; n < e.data.rayCasters.length; n++) {
				const collisionResults = e.data.rayCasters[n].intersectObject( e.data.collidableMeshList[i], true )
				// if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
				if ( collisionResults.length > 0 ) {
					console.log("Collision");
					self.postMessage(true);
				} else {
					self.postMessage(false);
				}
			}	
		}

	}

}, false);
