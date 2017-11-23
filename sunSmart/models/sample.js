var db = require("../db");

var sampleSchema = new db.Schema({

	deviceId:	String,
	longitude:	Number,
	latitude:	Number,
	uv:     Number,
	zip:	{type: Number, default: 0},
	submitTime:	{type: Date, default: Date.now}
});

var Sample = db.model("Sample", sampleSchema);

module.exports = Sample;
