const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const bodyParser = require("body-parser");
const { getEvents } = require("./getEvents");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.listen(process.env.PORT || 8000, () => {
	getEvents();
});
