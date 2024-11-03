
addEventListener("fetch", event => {
	event.respondWith(handleRequest(event.request));
});

let blocked = ["-1"]
let suspended = false;
let susp_info = "Sorry, the service is temporarily suspended.";
let custom_susp = "";
let pinned_usr = ""; 
const nick = "Mqtth3w"; // Change it with your nickname
let url = `https://api.telegram.org/bot${API_KEY}/`;
const user_guide = "https://github.com/Mqtth3w/Forwarder-Telegram-bot/tree/main#user-guide";
const faq = "https://github.com/Mqtth3w/Forwarder-Telegram-bot/tree/main#faq";

async function SendMessage(url, cId, txt, pc = true, prf) {
	let payload = {
		chat_id: cId,
		text: txt,
		protect_content: pc,
	};
	if (prf) {
		payload.reply_markup = {
			inline_keyboard: [[
				{
					text: "User Profile",
					url: `tg://user?id=${prf}`,
				}
			]]
		};

	}
	await fetch(url + 'sendMessage', {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	}); 
};

async function ForwardMessage(url, cId, fcId, mId, pc = true) {
	await fetch(url + 'forwardMessage', {
		method: "POST",
		headers: {
		  "Content-Type": "application/json",
		},
		body: JSON.stringify({
		  chat_id: cId,
		  from_chat_id: fcId,
		  message_id: mId,
		  protect_content: pc,
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
			const chatId = payload.message.chat.id.toString();
			const text = payload.message.text || "";
			if (chatId === DESTINATION) {
				let command = text.split(" ")[0];
				if ('reply_to_message' in payload.message) {
					// Send reply, get first the original sender id
					let infoSender = payload.message.reply_to_message.text || "";
					let infoArr = infoSender.split(" ");
					const senderId = infoArr[0];
					if (senderId && Number(senderId) > 0) {
						if (text) {
							await SendMessage(url, senderId, text);
							await SendMessage(url, env.DESTINATION, `Reply sent to ${senderId}.`, false, senderId);
						}
					}
					else {
						await SendMessage(url, env.DESTINATION, "Reply only to messages starting with an user ID.", false);
					}
				}
				else if (command === "/start") {
					await SendMessage(DESTINATION, "Hello, chief!", false);
				}
				else if (command === "/block") {
					let infoBlock = text.split(" ");
					if (infoBlock[1] && Number(infoBlock[1]) > 0) {
						if (!blocked.includes(infoBlock[1])) { // Not already blocked
							blocked.push(infoBlock[1]);
							await SendMessage(DESTINATION, `User ${infoBlock[1]} blocked.`, false, infoBlock[1]);
						}
						else {
							await SendMessage(DESTINATION, "User already blocked.", false);
						}
					}
					else {
						await SendMessage(DESTINATION, "Invalid User ID.", false);
					}
				}
				else if(command === "/unblock") {
					let infoBlock = text.split(" ");
					if (infoBlock[1] && Number(infoBlock[1]) > 0) {
						let index = blocked.indexOf(infoBlock[1]);
						if (index > -1) { // Only splice array when item is found
							blocked.splice(index, 1); // 2nd parameter means remove one item only
							await SendMessage(DESTINATION, `User ${infoBlock[1]} unblocked.`, false, infoBlock[1]);
						}
						else {
							await SendMessage(DESTINATION, "Hey chief, the user is not blocked.", false);
						}
					}
					else {
						await SendMessage(DESTINATION, "Invalid User ID.", false);
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
					await SendMessage(DESTINATION, "Service suspended.", false);
				}
				else if (command === "/unsuspend") {
					suspended = false;
					custom_susp = "";
					await SendMessage(DESTINATION, "Service unsuspended.", false);
				}
				else if (command === "/help") {
					await SendMessage(DESTINATION, `User guide: ${user_guide}. FAQ: ${faq}.`, false);
				}
				else if (command === "/blocked") {
					let blocked_str = 'blocked = ["' + blocked.join('", "') + '"]';
					await SendMessage(DESTINATION, blocked_str);
				}
				else if (command === "/pin") {
					let infoBlock = text.split(" ");
					if (infoBlock[1] && Number(infoBlock[1]) > 0) {
						pinned_usr = infoBlock[1];
						await SendMessage(DESTINATION, `User ${pinned_usr} pinned.`, false, pinned_usr);
					}
					else {
						await SendMessage(DESTINATION, "Invalid User ID.", false);
					}
				}
				else if (command === "/unpin") {
					await SendMessage(DESTINATION, `User ${pinned_usr} unpinned.`, false, pinned_usr);
					pinned_usr = "";
				}
				else if (command === "/show") {
					let infoBlock = text.split(" ");
					if (infoBlock[1] && Number(infoBlock[1]) > 0) {
						await SendMessage(DESTINATION, `User ${infoBlock[1]}.`, false, infoBlock[1]);
					}
					else {
						await SendMessage(DESTINATION, "Invalid User ID.", false);
					}
				}
				else if (payload.message.entities && payload.message.entities.length > 0 && payload.message.entities[0].type === "bot_command") { 
					await SendMessage(DESTINATION, `Hey chief! Invalid command, check the User guide at ${user_guide}.`, false);
				}
				else if (pinned_usr) {
					if (text) {
						await SendMessage(pinned_usr, text);
						await SendMessage(DESTINATION, `Reply sent to ${pinned_usr}`, false, pinned_usr);
					}
				}
				else { 
					await SendMessage(DESTINATION, `Hey chief! Invalid command, check the User guide at ${user_guide}.`, false);
				} 
			}
			else if (!blocked.includes(chatId) && suspended) {
				await SendMessage(chatId, `${susp_info} {custom_susp}`);
			}
			else if (!blocked.includes(chatId)) {
				const first_name = payload.message.from.first_name;
				const last_name = payload.message.from.last_name;
				const username = payload.message.from.username;
				let user = first_name;
				if (last_name) { 
					user = user + " " + last_name;
				}
				let info = chatId + "  " + user;
				if (text === "/start") {
					await SendMessage(chatId, `Hello, ${user}!`);
					await SendMessage(DESTINATION, (username) ? `${info} @${username} started the bot.`	: `${info} started the bot.`, false, chatId);
				}
				else if (text === "/help") {
					await SendMessage(chatId, `This bot forward all messages you send to ${nick}. Through this bot, ${nick} can reply you.`);
					await SendMessage(DESTINATION, (username) ? `${info} @${username} typed /help.` : `${info} typed /help.`, false, chatId);
				}
				else {
					await SendMessage(chatId, "Message sent.");
					await ForwardMessage(DESTINATION, chatId, payload.message.message_id);
					await SendMessage(DESTINATION, (username) ? `${info} @${username}.` : `${info}.`, false, chatId);
				}
			}
		}
	}
	return new Response("OK", { status: 200 });
};