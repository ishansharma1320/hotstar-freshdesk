'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.ObjectId;

var purecloud = {
	CSAT_CES_Reason_Text : String,
	CSAT_CES_Reason_9 : Boolean,
	CSAT_CES_Reason_8 : Boolean,
	CSAT_CES_Reason_7 : Boolean,
	CSAT_CES_Reason_6 : Boolean,
	CSAT_CES_Reason_5 : Boolean,
	Csat_CES : String,
	CSAT_CES_Reason_4 : Boolean,
	CSAT_CES_Reason_3 : Boolean,
	CSAT_CES_Reason_2 : Boolean,
	CSAT_CES_Reason_1 : Boolean,
	CSAT_CES_Reason_0 : Boolean,
	CSAT_CES_Self : String,
	CSAT_Agent_Rating : String,
	CSAT_Resolution : Boolean,
	CSAT_Feedback_Received_Date : String, 
	CSAT_Feedback : String,
	CSAT_RES_Reason : String,
	CSAT_Response_ID : String,
	Case_Owner_Guru : String, 
	Case_Owner_Class : String, 
	Case_Owner_Team : String,
	Case_Owner_Email : String, 
	Case_Owner_Name : String, 
	case_owner_id : String, 
	Type : String,
	Sub_Type : String,
	Sub_Type_Reason : String,
	Case_origin : String,
	Customer_DC : Number,
	Status : String,
	Customer_Meal_Plan_ID : String,
	Carrier : String,
	Weeks_Active_Stamp : Number, 
	Automated : Boolean,
	CaseNumber : String,
	customer_web_id : String,
	CSAT_Rating : String,
	Customer_Tier : String,
	First_Closed_Date_Time : String,
	CSAT_Created_Date : String, 
	CSAT_ASAT_Self : String,
	CSAT_RES_Self : Boolean
}


var ProcessSchema = new mongoose.Schema(
    {
//                account_id:String,
//originatingDirection -- to be added
	originatingDirection : String,
        customer_number : String,
	flow_name: String,
	transfer: String,	
        business_unit: {type: String},
        call_id:String,
        contact_phone_number:String,
        call_session_id:String,
        call_result:String,
        agent_result:String,
        campaign_filename:String,
        client_id:String,
        customer_name: String,
        start_at:Date,
        agent_name:String,
        total_time:Number,
        disposition:String,
        riskFlag:String, //{ 'type': Boolean, 'default': false }
        callsid:String,
        type:String,
        end_at:Date,
        contact_phone_number:String,
        user_id:String,
        user_name:String,
        user_email:String,
        talk_time:Number,
        silence_time:Number,
        hold_time:Number,
        abandon_time:Number,
        total_ringing_time:Number,
        disposition_code:String,
        notes:String,
        user_voice_rating:Number,
        ring_groups:String,
        ivr_options:Number,
        is_in_business_hours:Boolean,
        is_callback_from_queue:Boolean,
        is_transfer:Boolean,
        handling_user_id:String,
        handling_user_name:String,
        handling_user_email:String,
        recording_url:String,
        is_external_transfer:Boolean,
        is_if_no_answer:Boolean,
        is_call_forwarding:Boolean,
        csat_score:String,
        csat_survey_time:Date,
        mood:String,
        is_mood_prompted:String,
        agent_id:String,
        partcall_id:String,
        extension:String,
        ani:String,
        dnis:String,
        direction:String,
        tenant:String,
        campaign:String,
		ticket_id: String,
	    freshdesk_conversations: [
            {
                conversation_id: Number,
				speaker: String,
                body_text_latest: String,
                startTime: Number,
                is_agent: Boolean
            }
        ],
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
	    deviation: {
            startTime : Number,
            percentage : Number
        },
/*	    criteria:[{
		    criteria: String,
		    value: Boolean,
		    phrase:[String],
		    rangeType: String
	    }],*/
	    criteriascore: Number,
	   criteriaMatch:[{
		criteria: String,
		rangeType: String,
		phrase: String,
		criteriaStartTime: Number,
		criteriaEndTime: Number
	}],
        dollar_value: [{
                key_data : String,
                key_value : Number,
                key_time: String
        }],
        silence_report:[{
            start_time: String,
            time_duration: String,
            end_time: String
        }],
	keyphrase_data: [],
        qacriteria:[{
		    criteria: String,
                    value: Boolean
	}],
        qacriteriascore: Number,
	ivrEndTime: Number,
	code: String,
	customer_id: String,
        type_of_caller: String,
	disposition_two: String,
	purecloud: purecloud,
	qaCriteriaOverallScore: Number,
	criteriaOverallWeight: Number,
	criteriaOverallScore: Number,
	criteria: [{
		criteria: String,
		criteriaScore: Number,
		qaCriteriaScore: Number,
		criteriaWeight: Number,
		criteriaType: String,
		attributeScore: Number,
		reportName: String,
		speaker:String,
		phrase:[{
			key: String,
			scoreValue : Number,
			scored : Number,
			qascore : Number,
			phraseEndTime: Number,
			phraseStartTime: Number,
			rangeType: String,
			speaker:String
		}]
	}],
	holdcall: Boolean,
	priviouscallid: [],
        totalperformanceweight: Number,
        totalperformancescore: Number,
        performancerating:[{
                reportName: String,
                score: Number,
                weight: Number
        }]		
    }
);

module.exports = mongoose.model('ProcessedCall', ProcessSchema);

