
addEventListener("fetch", event => {
	event.respondWith(handleRequest(event.request));
});

let blocked = ["-1"]

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
};

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
};

async function handleRequest(request) {
	if (request.method === "POST") {
		const payload = await request.json();
		// Getting the POST request JSON payload
		if ('message' in payload) {
			const chatId = payload.message.chat.id;
			const text = payload.message.text;
			const forwardUrl = `https://api.telegram.org/bot${API_KEY}/forwardMessage`;
			const sendMessageUrl = `https://api.telegram.org/bot${API_KEY}/sendMessage`;
			const first_name = payload.message.from.first_name;
			const last_name = payload.message.from.last_name;
			const username = payload.message.from.username;
			let user = first_name;
			if (last_name != null) { 
				user = user + " " + last_name;
			}
			let info = chatId + "  " + user;
			if (chatId.toString() === DESTINATION) {
				let command = text.split(" ")[0];
				if ('reply_to_message' in payload.message) {
					// Send reply, get first the original sender id
					let infoSender = payload.message.reply_to_message.text;
					let infoArr = infoSender.split(" ");
					const senderId = infoArr[0];
					// Send reply
					await SendMessage(sendMessageUrl, senderId, text);
				}
				else if (command === "/start") {
					await SendMessage(sendMessageUrl, DESTINATION, "Hello, chief!");
				}
				else if (command === "/block") {
					let infoBlock = text.split(" ");
					if (infoBlock[1] && Number(infoBlock[1]) > 0) {
						let index = blocked.indexOf(infoBlock[1]);
						if (index === -1) { //Not already blocked
							blocked.push(infoBlock[1]);
							await SendMessage(sendMessageUrl, DESTINATION, "User blocked.");
						}
						else {
							await SendMessage(sendMessageUrl, DESTINATION, "User already blocked.");
						}
					}
					else {
						await SendMessage(sendMessageUrl, DESTINATION, "Invalid User ID.");
					}
				}
				else if(command === "/unblock") {
					let infoBlock = text.split(" ");
					if (infoBlock[1] && Number(infoBlock[1]) > 0) {
						let index = blocked.indexOf(infoBlock[1]);
						if (index > -1) { // only splice array when item is found
							blocked.splice(index, 1); // 2nd parameter means remove one item only
							await SendMessage(sendMessageUrl, DESTINATION, "User unblocked.");
						}
						else {
							await SendMessage(sendMessageUrl, DESTINATION, "Hey chief, the user is not blocked.");
						}
					}
					else {
						await SendMessage(sendMessageUrl, DESTINATION, "Invalid User ID.");
					}
				}
				else {
					await SendMessage(sendMessageUrl, DESTINATION, "Hey chief! Invalid command, check the User Guide at https://github.com/mqtth3w.");
				}
			}
			else if (blocked.indexOf(chatId.toString()) === -1) {
				if (text === "/start") {
					let welcome = "Hello, " + user + "!";
					await SendMessage(sendMessageUrl, chatId, welcome);
					await SendMessage(sendMessageUrl, DESTINATION, (username != null) ? (info + " @" + username + " started the bot.") : (info + " started the bot."));
				}
				else { 
					await SendMessage(sendMessageUrl, chatId, "Message sent.");
					await ForwardMessage(forwardUrl, DESTINATION, chatId, payload.message.message_id);
					await SendMessage(sendMessageUrl, DESTINATION, (username != null) ? (info + " @" + username + ".") : (info + "."));
				}
			}
		}
	}
	return new Response("OK");
};