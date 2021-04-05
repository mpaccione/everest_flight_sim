// server.js
const express = require("express");
const path = require("path");
const port = process.env.PORT || 8080;
const app = express();

// the __dirname is the current directory from where the script is running
app.use(express.static("../client"));
// send the user to index html page inspite of the url
app.get("*", (req, res) => {
  res.sendFile(path.resolve("../client", "index.html"));
});
app.listen(port);

console.log(`Client Served on ${port}`);
