const express = require('express');
const mongoose = require('mongoose');
const _ = require('lodash');
const config = require('./config/database');
const utils = require('./utils');
const listAllConversations = utils.listAllConversations;
const dev = config.development;
const PORT = dev.port;
const Ticket = require('./models/freshDeskTickets');
const Freshdesk = require('freshdesk-api');
const freshdesk = new Freshdesk('https://starstaging.freshdesk.com/','CncVtKH3Bw0gnXag8R');



const createTicketObject = (ticketData,op)=>{
    let newTicket;
    let commFields = {freshdesk_support_email: ticketData.support_email,
        freshdesk_source: ticketData.source,
        freshdesk_id: ticketData.id,
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
}
    switch(op){
        case 'create':
            newTicket= new Ticket({
                account_id: 'HotStar',
                start_at: new Date(),
                ...commFields,
                });
            break;
        case 'update':
            newTicket = commFields;
            break;
    }
     
    return newTicket;
}

const saveTickets = (ticketData)=>{
    // find whether a ticket with this id exist or not,
    // if yes, then compare each conversations updated_at and id,
    // if id exists and updated_at is newer, update that conversation
    // else skip and add all new conversations
    const ticket_id = ticketData.id;
    Ticket.findOne({freshdesk_id: ticket_id},(err,res)=>{
        // console.log(res);
        if(err){
            console.error(err)
        }else if(res === null){
            
            ticketData.description_text = [{updated_at: new Date(ticketData.updated_at),description_text: ticketData.description_text}];
            ticketData.description = [{updated_at: new Date(ticketData.updated_at),description: ticketData.description}];
            for(let i = 0; i<ticketData.conversations.length;i++){
                let body = ticketData.conversations[i].body;
                let body_text = ticketData.conversations[i].body_text;
                let attachments = ticketData.conversations[i].attachments;

                ticketData.conversations[i].body = [{updated_at: ticketData.conversations[i].updated_at,body}]
                ticketData.conversations[i].body_text = [{updated_at: ticketData.conversations[i].updated_at,body_text}]
                ticketData.conversations[i].attachments = [{updated_at: ticketData.conversations[i].updated_at,attachments}]
                if('incoming' in ticketData.conversations[i]){
                    ticketData.conversations[i].speaker = ticketData.conversations[i].incoming === true?'right':'left';
                }
            }

            let newTicket = createTicketObject(ticketData,'create');
            newTicket.save((err,res)=>{
                if(err){
                    console.error(err);
                }else{
                    console.debug("Save successful");
                    // console.log(res);
                }
            })
        }
        else if(res !== null){
            let prevUpdAt = res.freshdesk_updated_at;
            let newUpdAt = new Date(ticketData.updated_at);
            let newConversations = [];
            
            // console.debug("Ticket Data Conversations: ",ticketData.conversations);            
            // Filteration of new conversations starts
            // This is not working for updating conversations, check ticket 821094, 62029079446, 
            // reason -- when ticket is updated, somehow conversation param(updated_at) is not updated 
            // but ticket param(updated_at) is updated. 
            ticketData.conversations.forEach((element)=>{
                let elUpdAt = new Date(element.updated_at);
                if(elUpdAt >= prevUpdAt && elUpdAt <=newUpdAt){
                    newConversations.push(element);
                }
            })
            // Filteration of new conversations ends



            console.debug("Ticket Data Conversations: ",ticketData.conversations.length);  
            console.debug("New Conversations: ",newConversations.length);
            let lastDescription = res.freshdesk_description_text[res.freshdesk_description_text.length -1].description_text;
            console.log(lastDescription);
            // check for ticket changes
            if(lastDescription !== ticketData.description_text){
                res.freshdesk_description.push({updated_at: newUpdAt,description: ticketData.description})
                res.freshdesk_description_text.push({updated_at: newUpdAt,description_text: ticketData.description_text})   
                // Delete ticket from processed model
            }
            
            // check if newConversations ids exist in processed
            const processedIds = [];
            // Model Call
            // Line 137 - 140 to be changed with processed model
            res.freshdesk_conversations.forEach((element)=>{
               processedIds.push(element.id)
            })
            console.debug("Processed IDs: ",processedIds);
            let finalConversations = [];
            for(newConv of newConversations){
                console.log("Inside Loop");
                if(processedIds.includes(newConv.id)){    
                    let commonConv = res.freshdesk_conversations.filter(element => newConv.id === element.id);
                    
                    let prevConvBody = commonConv[commonConv.length-1].body;
                    prevConvBody = prevConvBody[prevConvBody.length-1].body;
                    
                    let prevConvAttachment = commonConv[commonConv.length-1].attachments;
                    prevConvAttachment = prevConvAttachment[prevConvAttachment.length-1].attachments;
                    
                    if(prevConvBody !== newConv.body){
                        commonConv[commonConv.length-1].body.push({updated_at: newConv.updated_at,body: newConv.body});
                        commonConv[commonConv.length-1].body_text.push({updated_at: newConv.updated_at,body_text: newConv.body_text});
                    }
                    if(prevConvAttachment !== newConv.attachments){
                        commonConv[commonConv.length-1].attachments.push({updated_at: newConv.updated_at,attachments: newConv.attachments});
                    }
                    //delete processedId
                    finalConversations.push(commonConv)
                    
                }else{
                    console.debug("NEW CONVERSATION");
                    
                    let body = newConv.body;
                    let body_text = newConv.body_text;
                    let attachments = newConv.attachments;

                    newConv.body = [{updated_at: newConv.updated_at,body: body}]
                    newConv.body_text = [{updated_at: newConv.updated_at,body_text: body_text}]
                    newConv.attachments = [{updated_at: newConv.updated_at,attachments: attachments}]
                    finalConversations.push(newConv);
                }
            }
            console.debug("Final Conversations: ",finalConversations);
            ticketData.description = res.freshdesk_description;
            ticketData.description_text = res.freshdesk_description_text;
            finalConversations = finalConversations.filter(element=>element.id !== undefined);
            res.freshdesk_conversations = res.freshdesk_conversations.filter(element=>element.id !== undefined);
            if (finalConversations.length > 0){
                console.log("New Conversations");
                ticketData.conversations = res.freshdesk_conversations.concat(finalConversations);
            }else{
                ticketData.conversations = res.freshdesk_conversations;
            } 
            for(let i = 0;i<ticketData.conversations.length;i++){
                if(('incoming' in ticketData.conversations[i]) && !('speaker' in ticketData.conversations[i])){
                    ticketData.conversations[i].speaker = ticketData.conversations[i].incoming === true?'right':'left';
                }
            }
            // console.log(finalConversations.length);
            // console.log(ticketData.conversations.length);
            let newTicketObj = createTicketObject(ticketData,'update');
            
            console.log(newTicketObj.freshdesk_conversations.length);
            
            Ticket.replaceOne({_id: res._id},newTicketObj,(err,res)=>{
                if(err){
                    console.error(err);
                }else{
                    console.log(res);
                }
            });
    }
})

}
const exec = (extra=null,date)=>{
    let page = undefined;
    let params = {"updated_since":date,'include': 'description,requester'}
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
        // console.log(extra);
        
        data.forEach((ticket) => {
            const convParams = {'per_page':100,'page':1}
            listAllConversations(ticket.id,convParams).then((convData)=>{
                ticket.conversations = convData;
                saveTickets(ticket);
            }).catch(err=>{
                console.error("List All Conversations");
                console.error(err);
            })
        });
        exec(extra,date);
    }else{
        console.error(err);
    }
    
});
}


const MONGO_URI = 'mongodb://'+ dev.username + ':' + dev.password + '@' + dev.host + '/' + dev.db
mongoose.connect(MONGO_URI,{
  useNewUrlParser: true,
    useUnifiedTopology:true
})
.then(()=>{
    console.log("Connected to Database");
    let upr = new Date();
    upr.setTime(upr.getTime() - (5 * 60 * 1000));
    date = upr.toISOString()
    console.log("executing");
    exec(null,date);
    console.log("done");
    return -1;
    
}).catch(()=>{
  console.error("Could not Connect to Database");
});






