// Modules
const cors                = require('cors'),
	  express             = require('express'),
	  expressStaticGzip   = require("express-static-gzip"),
	  fs                  = require('fs'),
	  path                = require('path'),
	  app                 = express();

// CORS for Local Testing

app.use(cors()); 

// Compression

app.use('/', expressStaticGzip(path.join(__dirname, 'build'), {
	enableBrotli: true,
	orderPreference: ['br', 'gz']
}))

// Routes

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

////////////////////////////////////
////////// Format Data /////////////
////////////////////////////////////

const fileName = "Grid_Output_Everest_60",
	  url = `./data/${fileName}.json`;

// readFile(url, fileName);

function readFile(url, fileName){
	console.log("readFile");
	let fileContent;
	fs.readFile(url, 'utf8', function(err, data){
		if (err) {
			throw err;
		}

		// console.log("TERRAIN DATA");
		// console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");
		// console.log(data);
		// console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");

		formatData(data, 100, 10, fileName);
	})	
}

function formatData(data, gridSize, subGridSize, fileName){
	// console.log("FORMATTED DATA");
	// console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");
	const terrainData = JSON.parse(data);
	let indexedDBObj = {};

	// // DATA STRUCTURE DEBUGGER
	// (function(terrainData){
	// 	console.log("J Len: "+terrainData.length);

	// 	for (var j = 0; j < terrainData.length; j++) {
	// 		const gridTile = terrainData[0][j];
	// 		console.log("K Len: "+gridTile.length);
	// 		for (var k = 0; k < gridTile.length; k++) {
	// 			const subGrid = gridTile[k];
	// 			console.log("A Len: "+subGrid.length);
	// 			for (var a = 0; a < subGrid.length; a++) {
	// 				const subGridTile = subGrid[a];
	// 				console.log("subGridTile");
	// 				console.log(subGridTile);
	// 			}
	// 		}
	// 	}
	// }(terrainData);

	for (var j = 0; j < terrainData.length; j++) {
		const gridTile = terrainData[j];
		for (var k = 0; k < gridTile.length; k++) {
			const subGridTile = gridTile[k];

			indexedDBObj[`${k}-${j}`] = {
				average_elevation: null,
				x_pos: j * gridSize,
				z_pos: k * gridSize,
				subgrids: []
			}
			// Column
			for (var a = 0; a < subGridTile.length; a++) {
				// Row
				indexedDBObj[`${k}-${j}`].subgrids[a] = [];
				let avgElevation = 0;
				
				for (var b = 0; b < subGridTile[a].length; b++) {
					avgElevation += parseInt(subGridTile[a][b].elevation);

					indexedDBObj[`${k}-${j}`].subgrids[a].push({
						latitude: parseFloat(subGridTile[a][b].latitude),
						longitude: parseFloat(subGridTile[a][b].longitude),
						elevation: parseInt(subGridTile[a][b].elevation),
						full_grid: `${k}-${j}-${b}-${a}`,
						x_pos: (j * subGridSize) + ((a + 1) * subGridSize),
						z_pos: (k * subGridSize) + ((b + 1) * subGridSize)
					})	

				}

				indexedDBObj[`${k}-${j}`].average_elevation = (avgElevation / 10);

			}
			// lat -> Z axis
			// long -> X axis		
		}
	}
	// console.log(indexedDBObj);
	// console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");
	writeToFile(indexedDBObj, fileName)
}

function writeToFile(data, fileName){
	console.log("writeToFile");
	fs.writeFile(path.join(__dirname, `/data/${fileName}_TILES.json`), JSON.stringify(data), (err) => {
		err ? console.warn(err) : console.log("File Write Complete");
	})
}


//////////////////////////////////////
////////// Graph System /////////////
/////////////////////////////////////

// 90KM Wide (Long) x 40KM Tall (Lat)
// 3,600 KM^2 -> 360,000 Vertex Points
// 0.1 KM PT Density -> 100 PT's per 1KM^2

// Response Object with Keyname XY
// Reads from XY.txt

app.get('/data/:dataset', function(req, res){
	const encoding = req.headers['accept-encoding'];

	if (encoding.includes('br')) {

		fetchFiles(req.params.dataset, 'br', res);

	} else if (encoding.includes('gzip')) {

		fetchFiles(req.params.dataset, 'gzip', res);

	} else {
		console.warn("Unsupported Content Encoding Headers");
		res.status(415).send(new Error('Unsupported Requested Encoding Type'));
	}
	
});

function fetchFiles(dataset, compressionType, res){
	let resObj;

	fs.readFile(path.join(__dirname, `./data/Grid_Output_Everest_${dataset}_TILES.json.${compressionType}`), (err, data) => {
        if (err) {
        	console.warn(err);
        	res.status(500).send(new Error(`${compressionType} Compression Data Read Error`));
        } else {
		 	resObj = data;
        }
	});

	res.writeHead(200, {
		'Content-Type': 'application/json',
		'Content-Encoding': `${compressionType}`
	});

	console.log(`File Path: `+path.join(__dirname, `./data/Grid_Output_Everest_${dataset}_TILES.json.${compressionType}`));
	console.log(resObj);

	return res.end(resObj);
}

// Listen

app.listen(8080, () => console.log("API listening on 8080"))