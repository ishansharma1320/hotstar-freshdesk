const Freshdesk = require('freshdesk-api');
// const util = require('util');
var Promise = require("bluebird");
const freshdesk = new Freshdesk('https://starstaging.freshdesk.com','CncVtKH3Bw0gnXag8R');
const fs = require('fs');
const asyncFreshDesk = Promise.promisifyAll(freshdesk);

// const freshdeskPromise = util.promisify(freshdesk);
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

// const mainFn = async () =>{
//     const {err,data,extra} = await asyncFreshDesk.listAllTicketsAsync({"updated_since":"2022-03-15T00:00:00Z","per_page":100});
//     console.log(extra);
    // let result = [];

    // // await asyncForEach(data,async (element)=>{
    // //     const ticketData = await asyncFreshDesk.getTicketAsync(element.id);
    // //     const convData = await asyncFreshDesk.listAllConversationsAsync(element.id);
    // //     ticketData.conversations = convData;
    // //     result.push(ticketData);
    // // })

    // for (const element of data) {
    //     const ticketData = await asyncFreshDesk.getTicketAsync(element.id);
    //     const convData = await asyncFreshDesk.listAllConversationsAsync(element.id);
    //     ticketData.conversations = convData;
    //     result.push(ticketData);
    // }
    
    // console.log(result.length);
    // fs.writeFileSync('./response.json',`${JSON.stringify(result,null, 2)}`);
// }


// mainFn();


// asyncFreshDesk.listAllTicketsAsync({"updated_since":"2022-03-15T00:00:00Z","per_page":100}).then(async (err,data)=>{
//     let result = [];
//     if(!err){
        // await data.forEach(async (element)=>{
        //     await asyncFreshDesk.getTicketAsync(element.id).then(async (err,ticketData)=>{
        //         await asyncFreshDesk.listAllConversationsAsync(element.id).then((err,convoData)=>{
        //             ticketData.conversations = convoData;
        //             result.push(ticketData);
        //             console.log(result);
        //         })
        //     })
        // })
//     }else{
//         console.error(err);
//     }
//     console.log(result);
// })


const saveTickets = (ticketData)=>{
    // find whether a ticket with this id exist or not,
    // if yes, then compare each conversations updated_at and id,
    // if id exists and updated_at is newer, update that conversation
    // else skip and add all new conversations
    const ticket_id = ticketData.id;

    Ticket.exists({freshdesk_id: ticket_id},(err,res)=>{
        if(err){
            console.error(err)
        }else{
            console.log("result: ",res);
        }
    })

}

freshdesk.listAllTickets({"updated_since":"2022-03-15T00:00:00Z","per_page":10},(err,data,extra)=>{
    if(!err){
        // console.log(extra);
        // let result = [];
        data.forEach((element,index) => {
            freshdesk.getTicket(element.id,(err,ticketData)=>{
                freshdesk.listAllConversations(element.id,(err,convData)=>{
                    ticketData.conversations = convData;
                    saveTickets(ticketData);            

        
                })
            })
        });
    }
    
});
