'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;
var ObjectId = mongoose.ObjectId;

var thingSchema = new mongoose.Schema({}, { strict: false });
module.exports = mongoose.model('AgentRanking', thingSchema);               //pass collection name...


