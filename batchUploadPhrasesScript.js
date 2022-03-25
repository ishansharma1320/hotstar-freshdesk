#!/usr/local/bin/node
const argv =  require('optimist')
    .usage('\nUsage: $0 --a <account_id> --e <node environment> \n Current Directory should have gen_phrases_<account_id>.json')
    .demand(['a', 'e'])
    .alias('a', 'account')
    .alias('e', 'env')
    .argv
const CustomCatPhrase = require('./models/CustomCatPhrase');
const mongoose = require('mongoose');
const amqp = require('amqplib/callback_api');
const _ = require('lodash');
const config = require('./config/database');
const defaultConfig = config.development;
// const environment = process.env.NODE_ENV || argv.e;
// const environmentConfig = config[environment];
// const finalConfig = _.merge(defaultConfig, environmentConfig);
// console.log(finalConfig);
mongoose.connect('mongodb://'+ defaultConfig.username + ':' + defaultConfig.password + '@' + defaultConfig.host + '/' + defaultConfig.db);

var default_cust_pharses = require('./gen_phrases_'+argv.a);
 var queue = defaultConfig.queueName;//'phraseActionQueue';
var finalCustPharse = [];
                                      amqp.connect('amqps://qzvxjzeo:QVIitQBoPrpGwijC_A4RL4ffbSUIA6G4@lionfish.rmq.cloudamqp.com/qzvxjzeo', function(error0, connection) {
                                                if (error0) {
                                                    throw error0;
                                                }
                                                connection.createChannel(function(error1, channel) {
                                                    if (error1) {
                                                        throw error1;
                                                    }


                        for(var i = 0; i < default_cust_pharses.data.length ; i++){
                            var oneData = default_cust_pharses.data[i];
                            oneData.account_id = argv.a;
                            finalCustPharse.push(oneData)
			    var oneCustom =  {
			            account_id: argv.a,
			            category: oneData.category,
			            phrases: oneData.phrases,
			            phrasesType: oneData.phrasesType,
			            action: "NEW",//req.body.action,
			            action_time: new Date(),
                        speaker: oneData.speaker
			    }
				console.log(oneCustom)			
                                                    channel.assertQueue(queue, {
                                                        durable: true
                                                    });
                                                    channel.sendToQueue(queue, Buffer.from(JSON.stringify(oneCustom)), {
                                                        persistent: true
                                                    });
                                              
						if(i == default_cust_pharses.data.length-1){
				                        CustomCatPhrase.create(finalCustPharse, function(err,result){
        	                			        console.log(' error : '+JSON.stringify(err));
				                                console.log(result);
								setTimeout(function(){console.log("Close");mongoose.disconnect();//connection.close()
										}, 5000)
							});
						}
			}
						});
                                      });



