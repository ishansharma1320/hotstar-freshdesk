'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.ObjectId;

var ProcessSchema = new mongoose.Schema(
    {
	account_id: String,
	user_name: String,
    agent_id: String,
    start_at: Date,
	category: String,
	speaker:String,
    conversation_id: String,
    ticket_id: String,
    present_phrases: [
        {
            category: String,
            phrase: String,
            startTime: Number,
            phrasesType: String,
            is_agent: Boolean,
    speaker:String
        }
    ],

    }
);

module.exports = mongoose.model('ProcessCallsUnwindData', ProcessSchema);

