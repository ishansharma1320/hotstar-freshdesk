var config = require('./config/database')
// var CustomCatPhrase = require('./models/CustomCatPhrase');
var ProcessedCall = require('./models/ProcessedCall');
var phrasesList_DB = require('./models/CustomCatPhrase.js');
var ProcessCallsUnwindData = require('./models/ProcessCallsUnwindData.js');
var CategoryRankingData = require('./models/AgentRanking_auto.js');
// var AgentRankingScore = require('./server/models/AgentRankingScore_auto.js');
var process = require('process');
 _ = require('lodash');
var fs = require('fs');
var async = require('async')
var amqp = require('amqplib/callback_api')
var mongoose = require('mongoose');
const defaultConfig = config.development;
const environment = process.env.NODE_ENV || 'testing';
const environmentConfig = config[environment];
const finalConfig = _.merge(defaultConfig, environmentConfig);
console.log(finalConfig);
mongoose.connect('mongodb://'+ finalConfig.username + ':' + finalConfig.password + '@' + finalConfig.host + '/' + finalConfig.db);

amqp.connect('amqps://qzvxjzeo:QVIitQBoPrpGwijC_A4RL4ffbSUIA6G4@lionfish.rmq.cloudamqp.com/qzvxjzeo', function(error0, connection) {
  if (error0) {
    throw error0;
  }
else{  connection.createChannel(function(error1, channel) {
   if (error1) {
      throw error1;
    }
else{
var queue = finalConfig.queueName;//'phraseActionQueue'
channel.assertQueue(queue, {
  durable: true
});
channel.prefetch(1);
channel.consume(queue, function(msg) {
message = JSON.parse(msg.content.toString())
console.log(message, typeof(message));
if (message.action === 'NEW' && message.account_id) {
        var account_id = message.account_id || message.account_id;
        var category = message.category;
        var phrases = message.phrases;
        var phrasesType = message.phrasesType;
        var accountType  = message.accountType; // For trial
        var speaker = message.speaker;
        var oneCustom = {
            account_id: message.account_id || message.account_id,
            category: category,
            phrases: phrases,
            phrasesType: phrasesType
        };
	// var transcriptspeaker="S0";

  var transcriptspeaker = speaker;
	//if (speaker=="left"){
	//transcriptspeaker="S0"
	//}
	//else 
	//transcriptspeaker="S1";
        console.log(transcriptspeaker);
	try{

function test(callids, callback)
 {

function queueAndWait(cb){
var matchQueryObj = {
    call_id:{$in: callids},
// 'transcript.speaker': transcriptspeaker,
    'freshdesk_conversations.body_text_latest': {
        $regex: new RegExp("(^|\\W)"+phrases+"($|\\W)"),
        $options: "$i"
    }
};
    if(speaker == "left" || speaker == "right"){
        matchQueryObj["freshdesk_conversations.speaker"] = transcriptspeaker; 
    }

                ProcessedCall.aggregate([{
                        "$unwind": "$freshdesk_conversations"
                    },
                    {
                        "$match": matchQueryObj
                    },
                    {
                        $group: {
                            _id: "$freshdesk_conversations",
                            'id': {
                                $first: '$_id'
                            }
                        }
                    }
                ], function(err, docs) {
                    console.log("here",docs);
                    if(docs)
                    for (let doc of docs) {
                        var pushObj = { "present_phrases": {
                            category: category,
                            phrase: phrases,
                            phrasesType: phrasesType,
                            // startTime: Number(doc._id.startTime)
                        }
                    }
                        if(speaker == "left" || speaker == "right"){
                            pushObj["present_phrases"]["speaker"] = speaker; 
                        }
                    console.log(pushObj)
                      ProcessedCall.findOneAndUpdate({
                            "_id": doc.id
                        }, {
                            "$push": pushObj
                        }, function(err, data) {
                            console.log("data",data);
                            var final_Object = {
                                account_id : account_id,
                                user_name: account_id,
                                ticket_id: data.ticket_id,
                                call_id: data.call_id,
                                contact_phone_number: data.contact_phone_number,
                                agent_name: data.agent_name,
                                start_at: data.start_at,
                                riskFlag: data.riskFlag,
                                total_time: data.total_time,
                                category: phrasesType,
                                // speaker:speaker,
                                present_phrases: [{
                                    category: category,
                                    phrase: phrases,
                                    phrasesType: phrasesType,
                                    startTime: Number(doc._id.startTime)
				    // speaker:speaker
                                }]
                            }

                            if(speaker == "left" || speaker == "right"){
                                final_Object["speaker"] = speaker;
                                final_Object.present_phrases[0]["speaker"] = speaker;
                            }
			//	console.log(final_Object, doc)
                              processCallsUnwind(final_Object, "UPDATE");

                        });
                        //console.log("Done");
                    }
                     storeCategoryRankingData(callids,account_id, phrasesType, function(vvv){

                        cb();
                        });
                });//ProcessedCalls Aggregate
            }
            queueAndWait(callback);
}

ProcessedCall.distinct('call_id',{account_id: message.account_id}, function(err, data){
    var chunk = [];
    while (data.length > 0) {
    chunk.push(data.splice(0,1000))
    }
async.eachSeries(chunk,function(b, cb){
    test(b, cb);
    },function files_finished(err){
        if (err){
           console.log( "ERROR::" + err);
        } else {

            console.log("All files processed");
		channel.ack(msg);
                //setTimeout(function() { process.exit(0);}, 500);
        }
    });
});



                }catch(e){
                    console.log(e)
//                    result.error = e;
                    //res.send(result);
                }

    } else if (message.action === 'DELETE' && message.account_id) {

        var query = {
            account_id: message.account_id,
            _id: message._id
        };

        var accountType  = message.accountType;
        if(accountType == "trial"){
            query = {
                account_id: message.account_id,
                _id: message.documentID
            };
        }
        var account_id =  message.account_id || message.account_id;
        var category = message.category || "";
        var phrases = message.phrases || "";
        var phrasesType = message.phrasesType || "";
        try{
                ProcessedCall.update({
                    account_id: message.account_id,
                    present_phrases: {
                        $elemMatch: {
                            category: category,
                            phrase: phrases,
                            phrasesType: phrasesType

                        }
                    }
                }, {
                    $pull: {
                        present_phrases: {
                            category: category,
                            phrase: phrases,
                            phrasesType: phrasesType
                        }
                    }
                }, {
                    multi: true
                }, function(err, data) {
                        console.log(err, "done....")
        //      });


                var oldPhrasesTypeName = (phrasesType.replace(/ /g, "_")) + "_present_phrases";
                            var jsonObj_temp = {};
                            jsonObj_temp[oldPhrasesTypeName] = 1;
			    CategoryRankingData.update({
                                'account_id': account_id
//                                'call_id': processed_Call.call_id
                            }, {
                                $unset: jsonObj_temp
                            }, {
                    multi: true
                }, function(err) {
            ProcessedCall.distinct('call_id',{account_id: message.account_id}, function(err, data){
                                storeCategoryRankingData(data,message.account_id, phrasesType, function(vvv){
					channel.ack(msg);
                                        //cb();
                                });
                        });


                });//CategoryRankingData
});
     var final_obje_delet = {
                            account_id: account_id,
                            category: category,
                            phrase: phrases,
                            phrasesType: phrasesType
                        }
                        processCallsUnwind(final_obje_delet, "DELETE");

                    }catch(e){
                        console.log(e);
                        //res.send(result);
                    }
    }else if(!message.account_id){
		channel.ack(msg);
	}

}, {
  noAck: false
});
}
});
}
})




function storeCategoryRankingData(callids, account_id, phrasesType, ccb){
    // console.log(callids,account_id,phrasesType)
    ProcessedCall.find({
        'account_id': account_id,
        'call_id':{$in: callids}
    }, {
        transcript: 0,
        data: 0
    }, function(error, processed_Call_Data) { // for all calls
	jsonObj_phraseType = {};
        processed_Call_Data.map(function(processed_Call, index) { //For all document testing
            // console.log(processed_Call);
            var phrasesTypeName = (phrasesType.replace(/ /g, "_")) + "_present_phrases";
		phrasesList_DB.distinct("category", {
                'account_id': account_id,
                phrasesType: phrasesType
            }, function(error, category_List) {
                try{
			var categoryData = (processed_Call.present_phrases.filter(x => x.phrasesType == phrasesType)).map(function(phrase) {
                        return phrase.category.trim()
                    });
                    var count = 0;
                    var pharseCount = 0;
                    var jsonObj = {};
                    category_List.map(function(category) {
                        var a = category.replace(/ /g, "_");
                        var len = categoryData.filter(function(x) {
                            return x === category
                        }).length;
                        (len > 0) ? count++ : 0;
                        pharseCount += len;
                        jsonObj[a] = categoryData.filter(function(x) {
                            return x === category
                        }).length;
                    });
                    var score = parseInt((count / category_List.length) * 100);
                    jsonObj.score = score;
                    jsonObj.totalScore = pharseCount;
                    jsonObj_phraseType[phrasesTypeName] = jsonObj;
                    //jsonObj_phraseType.account_id = account_id;
                    //jsonObj_phraseType.call_id = processed_Call.call_id;
                    jsonObj_phraseType.start_at = processed_Call.start_at;
                    jsonObj_phraseType.agent_name = processed_Call.agent_name;
		    CategoryRankingData.update({
                        'account_id': account_id,
                        'call_id': processed_Call.call_id
                    },{ $set: jsonObj_phraseType}, { upsert: true }, function(err, data) {
                        if(err){console.log(err);}
                        if(processed_Call_Data.length - 1  == index){
                            //storeAgentRankingData(account_id, phrasesType)
                                ccb(true);
                        }
                    });
                }catch(e){
                    console.log(e);
                }
            });
        });
    });
}
function processCallsUnwind(final_Object, method){
    if(final_Object.present_phrases.length > 0){
        for(let i = 0;i<final_Object.present_phrases.length;i++){
            final_Object.present_phrases[i].startTime = 1;
        }
    }
    if(method == "UPDATE"){
       var final_result =  new ProcessCallsUnwindData(final_Object);
       final_result.save(function(err, mongoRes) {
                console.log("MEMORY IN UPDATE IN NEW UPDATE",process.memoryUsage())
            if (err) console.log("Error : " + err);

   console.log("processCallsUnwind data saved........")
       })
    }else if(method == "DELETE"){
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        ProcessCallsUnwindData.remove({account_id : final_Object.account_id, 'present_phrases.category': final_Object.category, 'present_phrases.phrasesType': final_Object.phrasesType, 'present_phrases.phrase': final_Object.phrase}, function(err, response) {})
    }
}
