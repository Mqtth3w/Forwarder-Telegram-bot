// @author Mqtth3w https://github.com/Mqtth3w/

let suspended = false;
let susp_info = "Sorry, the service is temporarily suspended.";
let custom_susp = "";
let pinned_usr = "";
const nick = "Mqtth3w"; // Change it with your nickname
const pc_user = true; // protect_content: If true protects the contents
const pc_dest = false; // of the sent message from forwarding and saving
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

async function SendFormatMessage(url, dest, res, pc = true) {
	if (res.length === 0) {
		await SendMessage(url, dest, "No users.", pc_dest);
		return;
	}
	let total = 0;
	let message = "";
	const batchSize = 10;
	for (let i = 0; i < res.length; i++) {
		const user = res[i];
		let username = user.username ? `@${user.username}` : ``;
		total++;
		message += `ID: ${user.id}\n` + 
			`name: ${user.name}\n` + 
            `surname: ${user.surname}\n` + 
            `username: ${username}\n` + 
            `start_date: ${user.start_date}\n` + 
            `isblocked: ${user.isblocked}\n` + 
			`language_code: ${user.language_code}\n` + 
			`is_bot: ${user.is_bot}\n\n`;
		if ((total % batchSize === 0) || (i === res.length - 1)) {
			if (i === res.length - 1) {
				message += `total: ${total}.`;
			}
			await SendMessage(url, dest, message, pc_dest);
			message = ""; 
		}
    }
};

async function sendBroadcastMessage(url, dest, msg, users, pc = true) {
    for (const userId of users) {
        try {
            await SendMessage(url, userId, msg, pc);
            await new Promise(resolve => setTimeout(resolve, 40)); // Avoid hitting rate limits (30 messages/second)
        } catch (err) {
            await SendMessage(url, dest, `An error occurred while broadcasting to the user ${userId}: ${err}.`, pc, userId);
        }
    }
};

async function SendMedia(url, msg, dest, chatId, pc = true, pc_d = false) {
	let method = "";
	let method2 = "";
	let methodr = "";
	let fileId = "";
	let payload = { chat_id: chatId, protect_content: pc };
	if (msg.photo) {
		method = "sendPhoto";
		method2 = "photo";
		methodr = "Photo";
		fileId = msg.photo[msg.photo.length - 1].file_id;
	}
	else if (msg.sticker) {
		method = "sendSticker";
		method2 = "sticker";
		methodr = "Sticker";
		fileId = msg.sticker.file_id;
	}
	else if (msg.document) {
		method = "sendDocument";
		method2 = "document";
		methodr = "Document";
		fileId = msg.document.file_id;
	}
	else if (msg.video) {
		method = "sendVideo";
		method2 = "video";
		methodr = "Video";
		fileId = msg.video.file_id;
	} 
	else if (msg.animation) {
		method = "sendAnimation";
		method2 = "animation";
		methodr = "Animation";
		fileId = msg.animation.file_id;
	}
	else if (msg.audio) {
		method = "sendAudio";
		method2 = "audio";
		methodr = "Audio";
		fileId = msg.audio.file_id;
	}
	else if (msg.voice) {
		method = "sendVoice";
		method2 = "voice";
		methodr = "Voice";
		fileId = msg.voice.file_id;
	}
	else if (msg.location) {
		method = "sendLocation";
		methodr = "Location";
		payload.latitude = msg.location.latitude;
		payload.longitude = msg.location.longitude;
	}
	else {
		await SendMessage(url, dest, `Unexpected data, reply not sent.`, pc_d);
		return;
	}

	if (!msg.location) {
		payload[method2] = fileId;
	}

	await fetch(url + `${method}`, {
		method: "POST",
		headers: {
		"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});
	await SendMessage(url, dest, `${methodr} sent to ${chatId}.`, pc_d, chatId);
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
				const text = payload.message.text || "";
				if (chatId === env.DESTINATION) {
					let command = text.split(" ")[0];
					if ('reply_to_message' in payload.message) {
						// Send reply, get first the original sender id
						let infoSender = payload.message.reply_to_message.text || "";
						let infoArr = infoSender.split(" ");
						const senderId = infoArr[0];
						if (senderId && Number(senderId) > 0) {
							if (text) {
								await SendMessage(url, senderId, text, pc_user);
								await SendMessage(url, env.DESTINATION, `Reply sent to ${pinned_usr}.`, pc_dest, senderId);
							}
							else {
								await SendMedia(url, payload.message, env.DESTINATION, senderId, pc_user, pc_dest);
							}
						}
						else {
							await SendMessage(url, env.DESTINATION, "Reply only to messages starting with an user ID.", pc_dest);
						}
					}
					else if (command === "/start") {
						await SendMessage(url, env.DESTINATION, "Hello, chief!", pc_dest);
					}
					else if (command === "/block") {
						let infoBlock = text.split(" "); // Check if they are already blocked may be expensive
						if (infoBlock[1] && Number(infoBlock[1]) > 0) {
							await env.db.prepare("UPDATE users SET isblocked = ? WHERE id = ?").bind("true", infoBlock[1]).run();
							await SendMessage(url, env.DESTINATION, `User ${infoBlock[1]} blocked.`, pc_dest, infoBlock[1]);
						}
						else {
							await SendMessage(url, env.DESTINATION, "Invalid User ID.", pc_dest);
						}
					}
					else if(command === "/unblock") {
						let infoBlock = text.split(" "); // Check if they are already unblocked may be expensive
						if (infoBlock[1] && Number(infoBlock[1]) > 0) {
							await env.db.prepare("UPDATE users SET isblocked = ? WHERE id = ?").bind("false", infoBlock[1]).run();
							await SendMessage(url, env.DESTINATION, `User ${infoBlock[1]} unblocked.`, pc_dest, infoBlock[1]);
						}
						else {
							await SendMessage(url, env.DESTINATION, "Invalid User ID.", pc_dest);
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
						await SendMessage(url, env.DESTINATION, "Service suspended.", pc_dest);
					}
					else if (command === "/unsuspend") {
						suspended = false;
						custom_susp = "";
						await SendMessage(url, env.DESTINATION, "Service unsuspended.", pc_dest);
					}
					else if (command === "/help") {
						await SendMessage(url, env.DESTINATION, `User guide: ${user_guide}. FAQ: ${faq}.`, pc_dest);
					}
					else if (command === "/blocked") {
						const { results } = await env.db.prepare("SELECT * FROM users WHERE isblocked = ?")
							.bind("true").all();
						await SendFormatMessage(url, env.DESTINATION, results, pc_dest);
					}
					else if (command === "/pin") {
						let infoBlock = text.split(" ");
						if (infoBlock[1] && Number(infoBlock[1]) > 0) {
							pinned_usr = infoBlock[1];
							await SendMessage(url, env.DESTINATION, `User ${pinned_usr} pinned.`, pc_dest, pinned_usr);
						}
						else {
							await SendMessage(url, env.DESTINATION, "Invalid User ID.", pc_dest);
						}
					}
					else if (command === "/unpin") {
						await SendMessage(url, env.DESTINATION, `User ${pinned_usr} unpinned.`, pc_dest, pinned_usr);
						pinned_usr = "";
					}
					else if (command === "/show") {
						let infoBlock = text.split(" ");
						if (infoBlock[1] && Number(infoBlock[1]) > 0) {
							await SendMessage(url, env.DESTINATION, `User ${infoBlock[1]}.`, pc_dest, infoBlock[1]);
						}
						else {
							await SendMessage(url, env.DESTINATION, "Invalid User ID.", pc_dest);
						}
					}
					else if (command === "/history") {
						const { results } = await env.db.prepare("SELECT * FROM users").all();
						await SendFormatMessage(url, env.DESTINATION, results, pc_dest);
					}
					else if (command === "/delete") {
						let infoBlock = text.split(" ");
						if (infoBlock[1] && Number(infoBlock[1]) > 0) {
							await env.db.prepare("DELETE FROM users WHERE id = ?").bind(infoBlock[1]).run();
							await SendMessage(url, env.DESTINATION, `User ${infoBlock[1]} deleted (if exist).`, pc_dest, infoBlock[1]);
						}
						else {
							await SendMessage(url, env.DESTINATION, "Invalid User ID.", pc_dest);
						}
					}
					else if (command === "/broadcast") {
						let firstSpaceIndex = text.indexOf(' ');
						if (firstSpaceIndex !== -1) {
							let msg = text.slice(firstSpaceIndex + 1);
							const { results } = await env.db.prepare("SELECT id FROM users").all();
							if (results.length > 0) {
								await sendBroadcastMessage(url, env.DESTINATION, msg, results.map(row => row.id));
								await SendMessage(url, env.DESTINATION, "Message broadcasted.", pc_dest);
							}
							else {
								await SendMessage(url, env.DESTINATION, "There aren't users in your DB.", pc_dest);
							}
						}
						else {
							await SendMessage(url, env.DESTINATION, "You must provide a message to be broadcasted.", pc_dest);
						}
					}
					else if (payload.message.entities && payload.message.entities.length > 0 && payload.message.entities[0].type === "bot_command") { 
						await SendMessage(url, env.DESTINATION, `Hey chief! Invalid command, check the User guide at ${user_guide}.`, pc_dest);
					}
					else if (pinned_usr) {
						if (text) {
							await SendMessage(url, pinned_usr, text, pc_user);
							await SendMessage(url, env.DESTINATION, `Reply sent to ${pinned_usr}.`, pc_dest, pinned_usr);
						}
						else {
							await SendMedia(url, payload.message, env.DESTINATION, pinned_usr, pc_user, pc_dest);
						}
					}
					else {
						await SendMessage(url, env.DESTINATION, `Hey chief! Invalid command, check the User guide at ${user_guide}.`, pc_dest);
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
						await SendMessage(url, chatId, `${susp_info} ${custom_susp}`, pc_user);
					}
					else if (isBlocked === "false") {
						const first_name = payload.message.from.first_name;
						const last_name = payload.message.from.last_name;
						const username = payload.message.from.username;
						let user = first_name;
						if (last_name) { 
							user = user + " " + last_name;
						}
						let info = chatId + "  " + user;
						const lang = payload.message.from.language_code;
						const is_bot = payload.message.from.is_bot.toString();
						let extraInfo = `language_code:${lang} is_bot:${is_bot}`;
						if (text === "/start") {
							const { results } = await env.db.prepare("SELECT * FROM users WHERE id = ?")
								.bind(chatId).all();
							if (results.length === 0) {
								await env.db.prepare("INSERT INTO users (id, name, surname, username, start_date, isblocked, language_code, is_bot) VALUES (?,?,?,?,?,?,?,?)")
									.bind(chatId, first_name, last_name || "", username || "", (new Date()).toISOString(), "false", lang, is_bot).run();
								await SendMessage(url, chatId, `Hello, ${user}!`, pc_user);
							}
							else {
								await SendMessage(url, chatId, `Welcome back, ${user}!`, pc_user);
							}
							await SendMessage(url, env.DESTINATION, username ? `${info} @${username} ${extraInfo} started the bot.`	: `${info} ${extraInfo} started the bot.`, pc_dest, chatId);
						}
						else if (text === "/help") {
							await SendMessage(url, chatId, `This bot forward all messages you send to ${nick}. Through this bot, ${nick} can reply you.`, pc_user);
							await SendMessage(url, env.DESTINATION, username ? `${info} @${username} ${extraInfo} typed /help.` : `${info} ${extraInfo} typed /help.`, pc_dest, chatId);
						}
						else {
							await SendMessage(url, chatId, "Message sent.", pc_user);
							await ForwardMessage(url, env.DESTINATION, chatId, payload.message.message_id, pc_dest);
							await SendMessage(url, env.DESTINATION, username ? `${info} @${username} ${extraInfo}.` : `${info} ${extraInfo}.`, pc_dest, chatId);
						}
					}
				}
			}
		}
		return new Response("OK", { status: 200 });
	}
};