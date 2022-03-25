
var CustomCatPhrase = require('../models/CustomCatPhrase');
// var ProcessedCall = require('../../models/ProcessedCall');
// var phrasesList_DB = require('../../models/CustomCatPhrase.js');
var ProcessCallsUnwindData = require('../models/ProcessCallsUnwindData.js');
// var CategoryRankingData = require('../../models/AgentRanking_auto.js');
// var AgentRankingScore = require('../../models/AgentRankingScore_auto.js');
var process = require('process');
var _ = require("underscore");
// var fs = require('fs');
// var async = require('async');
var amqp = require('amqplib/callback_api');
var config = require('../config/database.json')
	    _ = require('lodash');
//config = require('./config/developement');
const defaultConfig = config.development;
const environment = process.env.NODE_ENV  || 'testing';
const environmentConfig = config[environment];
const finalConfig = _.merge(defaultConfig, environmentConfig);
console.log(finalConfig.queueName)
//var file_path = __dirname+"/../../../gen_phrases_genCredit.json";

var getCustomCatPhrase = function(req, res) {
if(req.session.account_id){
    var query = {
        account_id: req.session.account_id
    };
console.log(req.body)
    var limitParam = 10;
    if (req.body.limitParam) {
        limitParam = req.body.limitParam
    }
    var skipParam = 0;
    if (req.body.pageNumber) {
        skipParam = limitParam * (req.body.pageNumber - 1);
    }

    if (req.body.category && req.body.category !== '' && req.body.category !== 'All') {
        query.category = req.body.category; 
	/*{
            $regex: req.body.category,
            '$options': 'i'
        };*/
    }

   if (req.body.category_single && req.body.category_single !== '' && req.body.category_single !== 'All') {
        query.category = {
            $regex: req.body.category_single,
            '$options': 'i'
        };
    }

   if (req.body.phrase && req.body.phrase !== '' && req.body.phrase !== 'All') {
        query.phrases = {
            $regex: req.body.phrase,
            '$options': 'i'
        };
    }


   if (req.body.phraseType && req.body.phraseType !== '' && req.body.phraseType !== 'All') {
        query.phrasesType = {
            $regex: req.body.phraseType,
            '$options': 'i'
        };
    }


    if(req.body.speaker && (req.body.speaker == "left" || req.body.speaker == "right")){
        query.speaker = { $regex: req.body.speaker,'$options': 'i'};
    }


console.log(query)
    var result = {
        response: {},
        status: false
    };
    CustomCatPhrase.distinct("category",{account_id: req.body.account_id}, function(err, cat_results) {
        CustomCatPhrase.find(query).sort({category: 1}).skip(skipParam).limit(limitParam).exec(function(err, results) {
            try{
                if (results !== null) {
                    result.status = true;
                    result.response = results;
                    cat_results.unshift("All");
                    result.cat_list = cat_results;
                    CustomCatPhrase.count(query, function(err, resultCount) {
                        result.resultCount = resultCount;
                        res.json(result);
                    })

                } else {
                    res.json(result);
                }
            }catch(e){
                console.log(e);
                res.json(result);
            }
        });
    });
}else{
    var result = {
        response: [],
        status: false
    };

     res.json(result);
}
};

var actionCustomsCategoryPharse = function(req, res) {
if(req.session.account_id){ 
   var result = {
        status: false
    };
  //  if (req.body.action === 'NEW') {
        var query = {
            account_id: req.session.account_id,
            _id: req.body._id
        };

        var account_id = req.session.account_id || req.session.account_id;
        var category = req.body.category;
        var phrases = req.body.phrases;
        var phrasesType = req.body.phrasesType;
        var accountType  = req.body.accountType; // For trial
        var oneCustom = {
            account_id: req.session.account_id || req.session.account_id,
            category: category,
            phrases: phrases,
            phrasesType: phrasesType,
            action: req.body.action,
            action_time: new Date()
        };

     

        var findoneCustom = {
            account_id: req.session.account_id || req.session.account_id,
            category: category,
            phrases: phrases,
            phrasesType: phrasesType
          };
          
          if(req.body.speaker && (req.body.speaker == 'left' || req.body.speaker == 'right')){
            oneCustom["speaker"] = req.body.speaker;
            findoneCustom["speaker"] = req.body.speaker; 
        }

        console.log("findoneCustom ");
        console.log(findoneCustom);

        console.log("oneCustom ");
        console.log(oneCustom);

        try{
                var flag = 0;
                var newCustomCatPhrase = CustomCatPhrase(oneCustom);
                if(accountType == "trial"){
                    req.session.documentID = newCustomCatPhrase._id
                }
                if (req.body.action === 'NEW') {
                  CustomCatPhrase.find(findoneCustom, function(err, customPhrase) {
                    if (customPhrase.length > 0) {
                      result.status = true;
                      res.send(result);
                    } else{
                        flag = 1
                        newCustomCatPhrase.save(function(err, mongoRes) {
                            if (err) throw err;
                               result.status = true;
                               result.response = mongoRes;
				try{
					 res.send(result);
				      setTimeout(function(){
				      amqp.connect('amqp://localhost', function(error0, connection) {
                        			if (error0) {
			                            throw error0;
                        			}
			                        connection.createChannel(function(error1, channel) {
                        			    if (error1) {
			                                throw error1;
                        			    }
			                            var queue = finalConfig.queueName;//'phraseActionQueue';
                        			    channel.assertQueue(queue, {
			                                durable: true
                        			    });
			                            channel.sendToQueue(queue, Buffer.from(JSON.stringify(oneCustom)), {
                        			        persistent: true
			                            });
			                      });
		                      });
				      }, 60000);
                                      //res.send(result);
				}catch(e){
					result.status = false;
					res.send(result);
				}
                        });
                    }
                    });
                }
                if (req.body.action === 'DELETE') {
                        CustomCatPhrase.findOne({
                                _id: req.body._id
                            }).then(function(doc) {
                        CustomCatPhrase.remove(query, function(err, data) {
                        try{
                                flag = 1;
                                if (data) {
                                    result.status = true;
                                    result.response = data;
				    try{
				   res.send(result);
				    setTimeout(function(){
                       	            amqp.connect('amqp://localhost', function(error0, connection) {
			                        if (error0) {
                        			    throw error0;
			                        }
                        			connection.createChannel(function(error1, channel) {
			                            if (error1) {
			                                throw error1;
			                            }
			                            var queue = finalConfig.queueName;//'phraseActionQueue';
			                            channel.assertQueue(queue, {
			                                durable: true
			                            });
			                            channel.sendToQueue(queue, Buffer.from(JSON.stringify(oneCustom)), {
			                                persistent: true
			                            });
			                      });
		                      });
				     }, 10000);
			             //res.send(result);
				     }catch(e){
					result.status = false;
					res.send(result);
				     }
                                } else {
                                    res.send(result);
                                }
                        }catch(e){
                                    console.log(e);
                                    res.send(result);
                                  }

                        });
                        });
                }

                    if(flag){

/*                    amqp.connect('amqp://localhost', function(error0, connection) {
                        if (error0) {
                            throw error0;
                        }
                        connection.createChannel(function(error1, channel) {
                            if (error1) {
                                throw error1;
                            }
                            var queue = 'phraseActionQueue';
                            channel.assertQueue(queue, {
                                durable: true
                            });
                            channel.sendToQueue(queue, Buffer.from(JSON.stringify(oneCustom)), {
                                persistent: true
                            });
                      });
                      });*/
                    }
                }catch(e){
                    console.log(e)
                    result.error = e;
                    res.send(result);
                }
        
}else{
    var result = {
        response: [],
        status: false
    };

     res.json(result);
}
//  if of req.body.action  }
};

function processCallsUnwind(final_Object, method){
    if(method == "UPDATE"){
       var final_result =  new ProcessCallsUnwindData(final_Object);
       final_result.save(function(err, mongoRes) {
                console.log("MEMORY IN UPDATE IN NEW UPDATE",process.memoryUsage())
            if (err) console.log("Error : " + err);

   console.log("processCallsUnwind data saved........")
       })
    }else if(method == "DELETE"){
        ProcessCallsUnwindData.remove({account_id : final_Object.account_id, 'present_phrases.category': final_Object.category, 'present_phrases.phrasesType': final_Object.phrasesType, 'present_phrases.phrase': final_Object.phrase}, function(err, response) {})
    }
}

var getExcelCustomCatPhrase = function(req, res){
if(req.session.account_id){ 
   var query = {
        account_id: req.session.account_id
    };

    if (req.body.category && req.body.category !== '' && req.body.category !== 'All') {
        query.category = {
            $regex: req.body.category,
            '$options': 'i'
        };
    }

    var result = {
        response: {},
        status: false
    };
    CustomCatPhrase.distinct("category",{account_id: req.body.account_id}, function(err, cat_results) {
        CustomCatPhrase.find(query).sort({category: 1}).exec(function(err, results) {
            try{
                if (results !== null) {
                    result.status = true;
                    result.response = results;
                    //cat_results.unshift("All");
                    //result.cat_list = cat_results;
                    //CustomCatPhrase.count(query, function(err, resultCount) {
                    //    result.resultCount = resultCount;
                        res.json(result);
                    //})

                } else {
                    res.json(result);
                }
            }catch(e){
                console.log(e);
                res.json(result);
            }
        });
    });
}else{
    var result = {
        response: [],
        status: false
    };

     res.json(result);
}
}

module.exports.getCustomCatPhrase = getCustomCatPhrase;
module.exports.actionCustomsCategoryPharse = actionCustomsCategoryPharse;
module.exports.getExcelCustomCatPhrase = getExcelCustomCatPhrase;

