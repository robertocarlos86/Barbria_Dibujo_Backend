const express = require("express");
const mongoose = require("mongoose");
const Router = require("./routes")

const config = require('./config/config');

const app = express();

app.use(express.json());

mongoose.connect(config.URL_DB+config.NAME_DB,
  {
    useNewUrlParser: true,
	useUnifiedTopology:true
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully with MongoDB.");
});

app.use(Router);

app.listen(config.PORT, () => {
  console.log("Server is running at port "+config.PORT);
});