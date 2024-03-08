
addEventListener("fetch", event => {
	event.respondWith(handleRequest(event.request))
})

let blocked = ["-3","-1"]

async function SendMessage(Url, cId, txt) {
	await fetch(Url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			chat_id: cId,
			text: txt,
		}),
	}); 
}

async function ForwardMessage(Url, cId, fcId, mId) {
	await fetch(Url, {
		method: "POST",
		headers: {
		  "Content-Type": "application/json",
		},
		body: JSON.stringify({
		  chat_id: cId,
		  from_chat_id: fcId,
		  message_id: mId,
		}),
	});
}

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
				SendMessage(sendMessageUrl, chatId, welcome);
				// Informate started
				SendMessage(sendMessageUrl, DESTINATION, info + " started the bot.")
			}
			else if (text === "/block" && chatId.toString() === DESTINATION) {
				let infoBlock = payload.message.reply_to_message.text.split(" ")
				blocked.push(infoBlock[0].toString())
				// Informate blocked
				SendMessage(sendMessageUrl, DESTINATION, "User blocked.")
			}
			else if (text === "/unblock" && chatId.toString() === DESTINATION) {
				let infoBlock = payload.message.reply_to_message.text.split(" ")
				let index = blocked.indexOf(infoBlock[0].toString())
				if (index > -1) { // only splice array when item is found
					blocked.splice(index, 1); // 2nd parameter means remove one item only
					// Informate unblocked
					SendMessage(sendMessageUrl, DESTINATION, "User unblocked.")
				}
			}
			else {
				if ('reply_to_message' in payload.message && chatId.toString() === DESTINATION) {
					// Send reply, get first the original sender id
					let infoSender = payload.message.reply_to_message.text
					let infoArr = infoSender.split(" ")
					const senderId = infoArr[0]
					// Send reply
					SendMessage(sendMessageUrl, senderId, text)
				}
				else if (blocked.indexOf(chatId.toString()) === -1) {
					// Informate forwarding 
					SendMessage(sendMessageUrl, chatId, "Message sent.")
					// Forwarding the message
					ForwardMessage(forwardUrl, DESTINATION, chatId, payload.message.message_id)
					// Send sender info
					SendMessage(sendMessageUrl, DESTINATION, info + ".")
				}
			}
		}
	}
	return new Response("OK") // Doesn't really matter
}
