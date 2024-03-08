
addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

let blocked = ["-3","-1"]

async function handleRequest(request) {
  if (request.method === "POST") {
    const payload = await request.json()
    // Getting the POST request JSON payload
    if ('message' in payload) {
      const chatId = payload.message.chat.id
      const text = payload.message.text
      const forwardUrl = `https://api.telegram.org/bot${API_KEY}/forwardMessage`
      const sendMessageUrl = `https://api.telegram.org/bot${API_KEY}/sendMessage`
      const first_name = payload.message.from.first_name
      const last_name = payload.message.from.last_name
      let user = first_name 

      if (last_name != null){ 
          user = user + " " + last_name
      }

      let info = chatId + "  " + user
      
      if (text == "/start") {
        
        let welcome = "Hello, " + user + "!"

        // Say hello 
        await fetch(sendMessageUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcome,
          }),
        }); 

        // Informate started
        await fetch(sendMessageUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: DESTINATION,
            text: info + " started the bot.",
          }),
        });

      }
      else if (text === "/block" && chatId.toString() === DESTINATION) {

        let infoBlock = payload.message.reply_to_message.text.split(" ")
        blocked.push(infoBlock[0].toString())

        await fetch(sendMessageUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: DESTINATION,
              text: "User blocked.",
            }),
          });

      }
      else if (text === "/unblock" && chatId.toString() === DESTINATION) {

        let infoBlock = payload.message.reply_to_message.text.split(" ")
        let index = blocked.indexOf(infoBlock[0].toString())
        if (index > -1) { // only splice array when item is found
          blocked.splice(index, 1); // 2nd parameter means remove one item only

          await fetch(sendMessageUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: DESTINATION,
              text: "User unblocked.",
            }),
          });

        }
      }
      else {

        if ('reply_to_message' in payload.message && chatId.toString() === DESTINATION) {
          // Send reply, get first the original sender id
          let infoSender = payload.message.reply_to_message.text
          let infoArr = infoSender.split(" ")
          const senderId = infoArr[0]

          await fetch(sendMessageUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: senderId,
              text: text,
            }),
          });

        }
        else if (blocked.indexOf(chatId.toString()) === -1) {

          // Informate forwarding 
          await fetch(sendMessageUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: "Message sent.",
            }),
          });

          // Forwarding the message
          await fetch(forwardUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: DESTINATION,
              from_chat_id: chatId,
              message_id: payload.message.message_id,
            }),
          });

          // Send sender info
          await fetch(sendMessageUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: DESTINATION,
              text: info + ".",
            }),
          });

        }

      }
      
    }

  }

  return new Response("OK"); // Doesn't really matter
  
}
