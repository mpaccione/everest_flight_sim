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

const url = './data/Grid_Output_Everest_4.json';

readFile(url);

function readFile(url){
	console.log("readFile");
	let fileContent;
	fs.readFile(url, 'utf8', function(err, data){
		if (err) {
			throw err;
		}

		console.log("TERRAIN DATA");
		console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");
		console.log(data);
		// console.log(JSON.parse(data.toString()));
		console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");

		formatData(data, 100, 10);

	})	
}

function formatData(terrainData, gridSize, subGridSize){
	console.log("FORMATTED DATA");
	console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");
	let indexedDBObj = {};

	// console.log(terrainData);

	for (var j = 0; j < terrainData.length; j++) {
		const gridTile = terrainData[j];
		for (var k = 0; k < gridTile.length; k++) {
			const subGridTile = gridTile[k];

			indexedDBObj[`${k}-${j}`] = {
				average_elevation: null,
				x_pos: j * gridSize,
				z_pos: k * gridSize,
				subgrids: null
			}

			// Column
			for (var a = 0; a < subGridTile.length; a++) {
				// Row
				let avgElevation = 0;

				indexedDBObj[`${k}-${j}`][a] = [];

				for (var b = 0; b < subGridTile[a].length; b++) {
					avgElevation += subGridTile[a][b]["elevation"];

					indexedDBObj[`${k}-${j}`][a].push({
						latitude: subGridTile[a][b]["latitude"],
						longitude: subGridTile[a][b]["longitude"],
						elevation: subGridTile[a][b]["elevation"],
						full_grid: `${k}-${j}-${b}-${a}`,
						x_pos: (j * subGridSize) + (a * subGridSize),
						z_pos: (k * subGridSize) + (b * subGridSize)
					})						

					// const elevation = subGridTile[a][b]["elevation"],
					// 	  latitude = subGridTile[a][b]["latitude"],
					// 	  longitude = subGridTile[a][b]["longitude"],
					// 	  geometry = new THREE.BoxGeometry( 800, elevation, 800 ),
					// 	  material = new THREE.MeshBasicMaterial( {wireframe: true, color: colorData(elevation)} ),
					// 	  cube = new THREE.Mesh( geometry, material );

					// console.log(elevation);
					// console.log(`${0}, ${a*800}, ${b*800}`);

					// cube.userData = {
					// 	lat: k,
					// 	long: j, 
					// 	subLat: b,
					// 	subLong: a,
					// 	elevation: elevation,
					// 	latitude: latitude,
					// 	longitude: longitude
					// }
					// cube.name = `${k}-${j}-${b}-${a}`;
					// cube.position.set( (a*800)+(j*8000), 2000, (b*-800)+(k*-8000) )

					// scene.add( cube );
				}

				if (a === subGridTile.length) {
					indexedDBObj[`${k}- ${j}`].average_elevation = avgElevation / 100;
				}

			}
			// lat -> Z axis
			// long -> X axis		
		}
	}
	console.log(indexedDBObj);
	console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");
}

// function writeToFile(data, direction, directory, log, type){
// 	console.log("writeToFile");
// 	const timestamp = new Date().getTime();
// 	let   dataFixed;

// 	dataFixed = type == "csv" ? "LAT,LONG,ALT\n"+data.map(e => e.join(",")).join("\n") : JSON.stringify(data);

// 	fs.writeFile(path.join(__dirname, `/${directory}/Coord_Data_${name}_${timestamp}.${type}`), dataFixed, (err) => {
// 		err 
// 		? console.warn(err) 
// 		: fs.writeFile(path.join(__dirname, `/${directory}/Data_Info_${name}_${timestamp}.json`), JSON.stringify(log), (err) => {
// 			if (err) {
// 				console.warn(err);
// 			} else {
// 				console.log("LAT, LONG, File Write Successful");
// 				if (type == "json") {
// 					getElevationData(data, timestamp);
// 				}
// 			}
// 		  })
// 	})
// }


//////////////////////////////////////
////////// Graph System /////////////
/////////////////////////////////////

// 90KM Wide (Long) x 40KM Tall (Lat)
// 3,600 KM^2 -> 360,000 Vertex Points
// 0.1 KM PT Density -> 100 PT's per 1KM^2

// Response Object with Keyname XY
// Reads from XY.txt

app.get('/terrainData/:indexes', function(req, res){
	const encoding = req.headers['accept-encoding'], 
		  reqArr   = req.params.indexes;

	if (compArr.length <= 1) {

		console.warn("Unsupported Content Encoding Headers");
		res.status(500).send(new Error('Dataset Not Currently Available'));

	} else {

		if (encoding.includes('br')) {

			fetchFiles('br');

		} else if (encoding.includes('gzip')) {

			fetchFiles('gzip');

		} else {
			console.warn("Unsupported Content Encoding Headers");
			res.status(415).send(new Error('Unsupported Requested Encoding Type'));
		}

	}
	
});

function fetchFiles(arr, compressionType){
	let resObj;

	for (var i = 0; i < arr.length; i++) {
		fs.readFile(path.join(__dirname, `/api-data/compressed/${arr[i]}.txt.${compressionType}`), (err, data) => {
	        if (err) {
	        	console.warn(err);
	        	res.status(500).send(new Error(`${compressionType} Compression Data Read Error`));
	        } else {
	        	let keyName = arr[i][0].toString() + arr[i][1].toString();
			 	resObj[keyName] = data;
	        }
		});
	}

	res.writeHead(200, {
		'Content-Type': 'application/json',
		'Content-Encoding': `${compressionType}`
	});
	res.end(resObj);
}

// Listen

app.listen(8080, () => console.log("API listening on 8080"))