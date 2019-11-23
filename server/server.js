// Modules
const cors                = require('cors'),
	  express             = require('express'),
	  expressStaticGzip   = require("express-static-gzip"),
	  fs                  = require('fs'),
	  path                = require('path'),
	  app                 = express(),
// Globals
getDirectories = (source) => {
	return fs.readdirSync(source, { withFileTypes: true })
			 .filter(dir => dir.isDirectory())
			 .map(dir => dir.name);
};


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

// app.get('/.well-known(/*)?', function(req, res) {
// 	res.sendFile(path.join(__dirname, '.well-known', 'assetlinks.json'))
// })

// app.get('/privacy-policy', function(req, res) {
// 	res.sendFile(path.join(__dirname, 'privacy_policy.html'))
// })

// API

// app.get('/bufferLength', function(req, res){
// 	const encoding = req.headers['accept-encoding'], 
// 		  compArr = getDirectories(path.join(__dirname, '/api-data/compressed/'))
// 	                .sort(function sortNum(a, b){ return b - a });

// 	if (compArr.length < 2) {

// 		console.warn("ByteLength Not Available");
// 		res.status(500).send(new Error('ByteLength Not Available'));

// 	} else {

// 		console.log("BUFFER LENGTH RES");

// 		fs.readFile(path.join(__dirname, `/api-data/compressed/${compArr[1]}/byteLength.json`), (err, data) => {
// 	        if (err) {
// 	        	console.warn(err);
// 	        	res.status(500).send(new Error(err));
// 	        } else {
// 	        	console.log(data);
// 			    res.writeHead(200, { 'Content-Type': 'application/json' });
// 				res.end(data);
// 	        }
// 	    });

// 	 }

// });

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
	const resArr = new Array(arr.length);

	for (var i = 0; i < arr.length; i++) {
		fs.readFile(path.join(__dirname, `/api-data/compressed/${arr[i]}.txt.${compressionType}`), (err, data) => {
	        if (err) {
	        	console.warn(err);
	        	res.status(500).send(new Error(`${compressionType} Compression Data Read Error`));
	        } else {
			 	resArr[i] = data; 
	        }
		});
	}

	res.writeHead(200, {
		'Content-Type': 'application/json',
		'Content-Encoding': `${compressionType}`
	});
	res.end(resArr);
}

// Listen

app.listen(8080, () => console.log("API listening on 8080"))
