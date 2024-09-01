
addEventListener("fetch", event => {
	event.respondWith(handleRequest(event.request));
});

let blocked = ["-1"]
let suspended = false;
let susp_info = "Sorry, the service is temporarily suspended.";
let custom_susp = "";
const nick = "Mqtth3w"; // Change with your nickname
let url = `https://api.telegram.org/bot${API_KEY}/`;

async function SendMessage(cId, txt) {
	await fetch(url + 'sendMessage', {
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

async function ForwardMessage(cId, fcId, mId) {
	await fetch(url + 'forwardMessage', {
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
	const secret_token = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
    	if (secret_token !== SECRET_TOKEN) {
		return new Response("Authentication Failed.", { status: 403 });
    	}
	if (request.method === "POST") {
		const payload = await request.json();
		if ('message' in payload) {
			const chatId = payload.message.chat.id;
			const text = payload.message.text;
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
					await SendMessage(senderId, text);
				}
				else if (command === "/start") {
					await SendMessage(DESTINATION, "Hello, chief!");
				}
				else if (command === "/block") {
					let infoBlock = text.split(" ");
					if (infoBlock[1] && Number(infoBlock[1]) > 0) {
						if (!blocked.includes(infoBlock[1])) { //Not already blocked
							blocked.push(infoBlock[1]);
							await SendMessage(DESTINATION, "User blocked.");
						}
						else {
							await SendMessage(DESTINATION, "User already blocked.");
						}
					}
					else {
						await SendMessage(DESTINATION, "Invalid User ID.");
					}
				}
				else if(command === "/unblock") {
					let infoBlock = text.split(" ");
					if (infoBlock[1] && Number(infoBlock[1]) > 0) {
						let index = blocked.indexOf(infoBlock[1]);
						if (index > -1) { // only splice array when item is found
							blocked.splice(index, 1); // 2nd parameter means remove one item only
							await SendMessage(DESTINATION, "User unblocked.");
						}
						else {
							await SendMessage(DESTINATION, "Hey chief, the user is not blocked.");
						}
					}
					else {
						await SendMessage(DESTINATION, "Invalid User ID.");
					}
				}
				else if (command === "/suspend") {
					let firstSpaceIndex = text.indexOf(' ');
					if (firstSpaceIndex !== -1) {
						custom_susp = text.slice(firstSpaceIndex + 1);
					}
					else {
						custom_susp = "";
					}
					suspended = true;
					await SendMessage(DESTINATION, "Service suspended.");
				}
				else if (command === "/unsuspend") {
					suspended = false;
					custom_susp = "";
					await SendMessage(DESTINATION, "Service unsuspended.");
				}
				else if (command === "/help") {
					await SendMessage(DESTINATION, "User Guide: https://github.com/Mqtth3w/Forwarder-Telegram-bot/tree/main#user-guide. FAQ: https://github.com/Mqtth3w/Forwarder-Telegram-bot/tree/main#faq");
				}
				else {
					await SendMessage(DESTINATION, "Hey chief! Invalid command, check the User Guide at https://github.com/Mqtth3w/Forwarder-Telegram-bot/tree/main#user-guide.");
				}
			}
			else if (!blocked.includes(chatId.toString()) && suspended) {
				await SendMessage(chatId, susp_info + " " + custom_susp);
			}
			else if (!blocked.includes(chatId.toString())) {
				if (text === "/start") {
					let welcome = "Hello, " + user + "!";
					await SendMessage(chatId, welcome);
					await SendMessage(DESTINATION, (username != null) ? (info + " @" + username + " started the bot.") : (info + " started the bot."));
				}
				else if (text === "/help") {
					await SendMessage(chatId, "This bot forward all messages you send to " + nick + ". Through this bot, " + nick + " can reply you.");
					await SendMessage(DESTINATION, (username != null) ? (info + " @" + username + " typed /help.") : (info + " typed /help."));
				}
				else { 
					await SendMessage(chatId, "Message sent.");
					await ForwardMessage(DESTINATION, chatId, payload.message.message_id);
					await SendMessage(DESTINATION, (username != null) ? (info + " @" + username + ".") : (info + "."));
				}
			}
		}
	}
	return new Response("OK", { status: 200 });
};
