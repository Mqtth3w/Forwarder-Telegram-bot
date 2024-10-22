
let suspended = false;
let susp_info = "Sorry, the service is temporarily suspended.";
let custom_susp = "";
let pinned_usr = "";
const nick = "Mqtth3w"; // Change it with your nickname
const user_guide = "https://github.com/Mqtth3w/Forwarder-Telegram-bot/tree/main#user-guide";
const faq = "https://github.com/Mqtth3w/Forwarder-Telegram-bot/tree/main#faq";

async function SendMessage(url, cId, txt, prf) {
	let payload = {
		chat_id: cId,
		text: txt,
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

async function ForwardMessage(url, cId, fcId, mId) {
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

export default {
	async fetch(request, env) {
		const secret_token = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
		if (secret_token !== env.SECRET_TOKEN) {
			return new Response("Authentication Failed.", { status: 403 });
		}
		if (request.method === "POST") {
			const payload = await request.json();
			if ('message' in payload) {
				let url = `https://api.telegram.org/bot${env.API_KEY}/`;
				let chatId = payload.message.chat.id.toString();
				const text = payload.message.text;
				if (chatId === env.DESTINATION) {
					let command = text.split(" ")[0];
					if ('reply_to_message' in payload.message) {
						// Send reply, get first the original sender id
						let infoSender = payload.message.reply_to_message.text;
						let infoArr = infoSender.split(" ");
						const senderId = infoArr[0];
						await SendMessage(url, senderId, text);
						await SendMessage(url, env.DESTINATION, "Reply sent to " + senderId, senderId);
					}
					else if (command === "/start") {
						await SendMessage(url, env.DESTINATION, "Hello, chief!");
					}
					else if (command === "/block") {
						let infoBlock = text.split(" "); // Check if they are already blocked may be expensive
						if (infoBlock[1] && Number(infoBlock[1]) > 0) {
							await env.db.prepare("UPDATE users SET isblocked = ? WHERE id = ?").bind("true", infoBlock[1]).run();
							await SendMessage(url, env.DESTINATION, `User ${infoBlock[1]} blocked.`, infoBlock[1]);
						}
						else {
							await SendMessage(url, env.DESTINATION, "Invalid User ID.");
						}
					}
					else if(command === "/unblock") {
						let infoBlock = text.split(" "); // Check if they are already blocked may be expensive
						if (infoBlock[1] && Number(infoBlock[1]) > 0) {
							await env.db.prepare("UPDATE users SET isblocked = ? WHERE id = ?").bind("false", infoBlock[1]).run();
							await SendMessage(url, env.DESTINATION, `User ${infoBlock[1]} unblocked.`, infoBlock[1]);
						}
						else {
							await SendMessage(url, env.DESTINATION, "Invalid User ID.");
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
						await SendMessage(url, env.DESTINATION, "Service suspended.");
					}
					else if (command === "/unsuspend") {
						suspended = false;
						custom_susp = "";
						await SendMessage(url, env.DESTINATION, "Service unsuspended.");
					}
					else if (command === "/help") {
						await SendMessage(url, env.DESTINATION, `User guide: ${user_guide}. FAQ: ${faq}.`);
					}
					else if (command === "/blocked") {
						const { results } = await env.db.prepare("SELECT * FROM users WHERE isblocked = ?")
							.bind("true").all();
						await SendMessage(url, env.DESTINATION, results);
					}
					else if (command === "/pin") {
						let infoBlock = text.split(" ");
						if (infoBlock[1] && Number(infoBlock[1]) > 0) {
							pinned_usr = infoBlock[1];
							await SendMessage(url, env.DESTINATION, `User ${pinned_usr} pinned.`, pinned_usr);
						}
						else {
							await SendMessage(url, env.DESTINATION, "Invalid User ID.");
						}
					}
					else if (command === "/unpin") {
						await SendMessage(url, env.DESTINATION, `User ${pinned_usr} unpinned.`, pinned_usr);
						pinned_usr = "";
					}
					else if (command === "/show") {
						let infoBlock = text.split(" ");
						if (infoBlock[1] && Number(infoBlock[1]) > 0) {
							await SendMessage(url, env.DESTINATION, `User ${infoBlock[1]}.`, infoBlock[1]);
						}
						else {
							await SendMessage(url, env.DESTINATION, "Invalid User ID.");
						}
					}
					else if (command === "/history") {
						const { results } = await env.db.prepare("SELECT * FROM users").all();
						await SendMessage(url, env.DESTINATION, results);
					}
					else if (payload.message.entities && payload.message.entities.length > 0 && payload.message.entities[0].type === "bot_command") { 
						await SendMessage(url, env.DESTINATION, `Hey chief! Invalid command, check the User guide at ${user_guide}.`);
					}
					else if (pinned_usr) {
						await SendMessage(url, pinned_usr, payload.message.text);
						await SendMessage(url, env.DESTINATION, "Reply sent to " + pinned_usr, pinned_usr);
					}
					else { 
						await SendMessage(url, env.DESTINATION, `Hey chief! Invalid command, check the User guide at ${user_guide}.`);
					}
				}
				else { 
					const { results } = await env.db.prepare(
					  "SELECT isblocked FROM users WHERE id = ?").bind(chatId).all();
					let isBlocked = "false";
					if (results.length > 0) {
						isBlocked = results[0].isblocked;
					}
					if (isBlocked === "false" && suspended) {
						await SendMessage(url, chatId, susp_info + " " + custom_susp);
					}
					else if (isBlocked === "false") {
						const first_name = payload.message.from.first_name;
						const last_name = payload.message.from.last_name;
						const username = payload.message.from.username;
						let user = first_name;
						if (last_name != null) { 
							user = user + " " + last_name;
						}
						let info = chatId + "  " + user;

						if (text === "/start") {
							await SendMessage(url, chatId, `Hello, ${user}!`);
							const { results } = await env.db.prepare("SELECT * FROM users WHERE id = ?")
								.bind(chatId).all();
							if (results.length === 0) {
								await env.db.prepare("INSERT INTO users (id, name, surname, username, start_date, isblocked) VALUES (?,?,?,?,?,?)")
									.bind(chatId, first_name, last_name, username, (new Date()).toISOString(), "false").run();
							}
							await SendMessage(url, env.DESTINATION, (username != null) ? `${info} @${username} started the bot.`	: `${info} started the bot.`, chatId);
						}
						else if (text === "/help") {
							await SendMessage(url, chatId, `This bot forward all messages you send to ${nick}. Through this bot, ${nick} can reply you.`);
							await SendMessage(url, env.DESTINATION, (username != null) ? `${info} @${username} typed /help.` : `${info} typed /help.`, chatId);
						}
						else {
							await SendMessage(url, chatId, "Message sent.");
							await ForwardMessage(url, env.DESTINATION, chatId, payload.message.message_id);
							await SendMessage(url, env.DESTINATION, (username != null) ? `${info} @${username}.` : `${info}.`, chatId);
						}
					}
				}
			}
		}
		return new Response("OK", { status: 200 });
	}
};