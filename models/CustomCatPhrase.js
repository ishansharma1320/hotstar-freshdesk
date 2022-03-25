'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;
var ObjectId = mongoose.ObjectId;

var Customcatphrase = new mongoose.Schema({
    account_id: String,
    business_unit: {type: String},
    category: String,
    phrases: String,
    phrasesType: String,
    speaker:String,
    created_time: {type: Date, default: (new Date()).getTime()}
});

module.exports = mongoose.model('Customcatphrase', Customcatphrase);

