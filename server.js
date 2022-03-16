const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/database');
const dev = config.development;
const PORT = dev.port;
const Ticket = require('./models/freshDeskTickets');
const Freshdesk = require('freshdesk-api');
const freshdesk = new Freshdesk('https://starstaging.freshdesk.com/','CncVtKH3Bw0gnXag8R');

const MONGO_URI = 'mongodb://'+ dev.username + ':' + dev.password + '@' + dev.host + '/' + dev.db
mongoose.connect(MONGO_URI,{
  useNewUrlParser: true,
    useUnifiedTopology:true
})
.then(()=>{
  console.log("Connected to Database");
}).catch(()=>{
  console.error("Could not Connect to Database");
});

const app = express();


const saveTickets = (ticketData)=>{
    // find whether a ticket with this id exist or not,
    // if yes, then compare each conversations updated_at and id,
    // if id exists and updated_at is newer, update that conversation
    // else skip and add all new conversations
    const ticket_id = ticketData.id;

    Ticket.exists({freshdesk_id: ticket_id},(err,res)=>{
        if(err){
            console.error(err)
        }else if(res === null){
            const newTicket = new Ticket({
                account_id: 'HotStar',
                start_at: new Date(),
                freshdesk_support_email: ticketData.support_email,
                freshdesk_source: ticketData.source,
                freshdesk_id: ticket_id,
                freshdesk_created_at: ticketData.created_at !== null? new Date(ticketData.created_at): null,
                freshdesk_updated_at: ticketData.updated_at !== null? new Date(ticketData.updated_at): null,
                freshdesk_to_emails: ticketData.to_emails,
                freshdesk_cc_emails: ticketData.cc_emails,
                freshdesk_attachments: ticketData.attachments,
                freshdesk_priority: ticketData.priority,
                freshdesk_status: ticketData.status,
                freshdesk_fwd_emails: ticketData.fwd_emails,
                freshdesk_reply_cc_emails: ticketData.reply_cc_emails,
                freshdesk_ticket_cc_emails: ticketData.ticket_cc_emails,
                freshdesk_email_config_id: ticketData.email_config_id,
                freshdesk_group_id: ticketData.group_id,
                freshdesk_requester_id: ticketData.requester_id,
                freshdesk_responder_id: ticketData.responder_id,
                freshdesk_spam: ticketData.spam,
                freshdesk_subject: ticketData.subject,
                freshdesk_company_id: ticketData.company_id,
                freshdesk_type: ticketData.type,
                freshdesk_product_id: ticketData.product_id,
                freshdesk_due_by: ticketData.due_by,
                freshdesk_fr_due_by: ticketData.fr_due_by,
                freshdesk_is_escalated: ticketData.is_escalated,
                freshdesk_association_type: ticketData.association_type,
                freshdesk_description_text: ticketData.description_text,
                freshdesk_description: ticketData.description,
                freshdesk_custom_fields: ticketData.custom_fields,
                freshdesk_tags: ticketData.tags,
                freshdesk_source_additional_info: ticketData.source_additional_info,
                freshdesk_nr_due_by: ticketData.nr_due_by,
                freshdesk_nr_escalated: ticketData.nr_escalated,
                freshdesk_conversations: ticketData.conversations
            });

            newTicket.save((err,res)=>{
                if(err){
                    console.error(err);
                }else{
                    console.debug("Save successful");
                    // console.log(res);
                }
            })
        }else{
            console.log("Exist");
            // if yes, then compare each conversations updated_at and id,
           // if id exists and updated_at is newer, update that conversation
           // else skip and add all new conversations
        }
    })

}
const exec = (extra=null)=>{
    let page = undefined;
    let params = {"updated_since":"2022-03-15T00:00:00Z",'include': 'description,requester'}
    if(extra !== null){
        if (extra.pageIsLast === false){
            let myRegexp = /page=(.*)>/;
            page = Number(extra._headersLink.match(myRegexp)[1]);
            params.page=page;
        }else{
            return;
        }
        
    }
    freshdesk.listAllTickets(params,(err,data,extra)=>{
    
    if(!err){
        console.log(extra);
        
        data.forEach((ticket) => {
            freshdesk.listAllConversations(ticket.id,(err,convData)=>{
                if(!err){
                    ticket.conversations = convData;
                    saveTickets(ticket);
                }else{
                    console.error("List All Conversations");
                    console.error(err);
                }                    
            })
        
        });
        exec(extra);
    }else{
        console.error(err);
    }
    
});
}

app.listen(PORT, function () {
    console.log('server started at port : '+PORT);
    exec();
});
