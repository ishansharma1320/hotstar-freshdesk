const mongoose = require('mongoose');
const _ = require('lodash');
const config = require('./config/database');
const dev = config.development;
const PORT = dev.port;
const ProcessedCall = require('./models/ProcessedCall');
const MONGO_URI = 'mongodb://'+ dev.username + ':' + dev.password + '@' + dev.host + '/' + dev.db
mongoose.connect(MONGO_URI,{
  useNewUrlParser: true,
    useUnifiedTopology:true
})
.then((dbConnection)=>{
    console.log("Connected to Database");
}).catch(()=>{
  console.error("Could not Connect to Database");
});

const processedCall = {
        
            call_id: '821133',
            client_id: 'hotstar',
            customer_name: 'hotstar',
            start_at: new Date(),
            ticket_id: '821133',
            freshdesk_conversations: [
                {
                    conversation_id: 62029273495,
                    speaker: 'left',
                    body_text_latest: 'we are happy, thanks for calling',
                    startTime: Date.now(),
                    is_agent: false
                },
                {
                    conversation_id: 62029273496,
                    speaker: 'left',
                    body_text_latest: 'how are you doing?',
                    startTime: Date.now(),
                    is_agent: false
                },
                {
                    conversation_id: 62029273497,
                    speaker: 'left',
                    body_text_latest: 'how can i help you?',
                    startTime: Date.now(),
                    is_agent: false
                },
                {
                    conversation_id: 62029273498,
                    speaker: 'left',
                    body_text_latest: 'good afternoon',
                    startTime: Date.now(),
                    is_agent: false
                },
                {
                    conversation_id: 62029273499,
                    speaker: 'left',
                    body_text_latest: 'good morning',
                    startTime: Date.now(),
                    is_agent: false
                },
            ],
            present_phrases: [
                {
                    category: 'greeting',
                    phrase: 'good morning',
                    startTime: Date.now(),
                    phrasesType: 'greeting',
                    is_agent: 'false',
                    speaker:'left'
                },
                {
                    category: 'greeting',
                    phrase: 'good afternoon',
                    startTime: Date.now(),
                    phrasesType: 'greeting',
                    is_agent: 'false',
                    speaker:'left'
                },
                
            ],
        }

const newObj = new ProcessedCall({...processedCall});

newObj.save((err,res)=>{
    if(err){
        console.error(err);
    }else{
        console.debug("Save successful");
        // console.log(res);
    }
})