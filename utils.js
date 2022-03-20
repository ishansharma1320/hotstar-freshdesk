const axios = require('axios');

const baseUrl = 'https://starstaging.freshdesk.com/'
const apiKey = 'CncVtKH3Bw0gnXag8R'

const auth = "Basic " + Buffer.from(`${apiKey}:X`, "utf-8").toString("base64");

const listAllConversations = async (ticketId,params) => {  
    const options = {
		method: 'GET',
		headers: {
			"Content-Type": "application/json",
			Authorization: auth,
		},
		url: `${baseUrl}/api/v2/tickets/${ticketId}/conversations`, 
		params: params,
	};
    const response = await axios(options); 
    const data = response.data;
    if(response.headers && typeof(response.headers.link) === "string"){
        let myRegexp = /&page=(.*)>/;
        page = Number(response.headers.link.match(myRegexp)[1]);
        params.page=page;
        
        return data.concat(await listAllConversations(ticketId,params)) 
    }
    else{
        return data;
    }
  }

  
module.exports.listAllConversations = listAllConversations;
