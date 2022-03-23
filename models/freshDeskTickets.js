'use strict'
var mongoose = require('mongoose');

var ticketSchema = new mongoose.Schema({

    account_id: String,
    start_at:Date,
    // call_id: String,
    // freshdesk_body_text:String,
    // freshdesk_body:String,
    // freshdesk_incoming:Boolean,
    // freshdesk_private:Boolean,
    // freshdesk_user_id:Number,
    freshdesk_support_email:String,
    freshdesk_source:String,
    // freshdesk_ticket_id:String,
    freshdesk_created_at: Date,
    freshdesk_updated_at: Date,
    // freshdesk_from_email : String,
    freshdesk_to_emails : Array,
    freshdesk_cc_emails: Array,
    // freshdesk_bcc_emails: Array,
    freshdesk_attachments : Array,
    // freshdesk_last_edited_at : Date,
    // freshdesk_last_edited_user_id : Number,
    // freshdesk_cloud_files:Array,
    freshdesk_priority:Number,
    freshdesk_status:Number,
    freshdesk_fwd_emails : Array,
    freshdesk_reply_cc_emails : Array,
    freshdesk_ticket_cc_emails:Array,
    freshdesk_email_config_id : Number, 
    freshdesk_group_id : String, 
    freshdesk_requester_id : Number, 
    freshdesk_responder_id : Number, 
    freshdesk_spam : Boolean, 
    freshdesk_subject : String, 
    freshdesk_company_id : Number, 
    freshdesk_id : {type: Number, unique: true, required: true},
    freshdesk_type : String, 
    freshdesk_product_id : Number,
    freshdesk_due_by : Date, 
    freshdesk_fr_due_by : Date, 
    freshdesk_is_escalated : Boolean, 
    freshdesk_association_type : String, 
    freshdesk_description_text : [{updated_at: Date, description_text: String}],
    freshdesk_description : [{updated_at: Date, description: String}], 
    freshdesk_custom_fields : mongoose.Mixed,
    freshdesk_tags : Array,
    // freshdesk_archived : Boolean,

    freshdesk_source_additional_info:mongoose.Mixed,
    freshdesk_nr_due_by:Date,
    freshdesk_nr_escalated:Boolean,
    // freshdesk_conversations:Array, //
    freshdesk_conversations:[{
        body:[{updated_at: Date, body: String}],
        body_text:[{updated_at: Date, body_text: String}],
        body_text_latest: String,
        id:Number,
        incoming:Boolean,
        private:Boolean,
        /* agent id */user_id:Number,
        support_email:String,
        source:Number,
        category:Number,
        to_emails:Array,
        from_email:String,
        cc_emails: Array,
        bcc_emails: Array,
        email_failure_count:Number,
        outgoing_failures:Number,
        thread_id:Number,
        thread_message_id:Number,
        created_at:Date,
        updated_at:Date,
        last_edited_at:Date,
        last_edited_user_id:Number,
        attachments:[{updated_at: Date, attachments: Array}],
        automation_id:Number,
        automation_type_id:Number,
        auto_response:Boolean,
        ticket_id:Number,
        source_additional_info:mongoose.Mixed,
        speaker: String,
    }]
});

// ticketSchema.index({ start_at: 1 });


module.exports = mongoose.model('ticket', ticketSchema);
