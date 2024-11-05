let suspended = false;
let susp_info = "Sorry, the service is temporarily suspended.";
let custom_susp = "";
let pinned_usr = "";
const nick = "Mqtth3w"; // Change it with your nickname
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
		await SendMessage(url, dest, "No users.", false);
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
			await SendMessage(url, dest, message, false);
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
}

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
								await SendMessage(url, senderId, text);
								await SendMessage(url, env.DESTINATION, `Reply sent to ${senderId}.`, false, senderId);
							}
						}
						else {
							await SendMessage(url, env.DESTINATION, "Reply only to messages starting with an user ID.", false);
						}
					}
					else if (command === "/start") {
						await SendMessage(url, env.DESTINATION, "Hello, chief!", false);
					}
					else if (command === "/block") {
						let infoBlock = text.split(" "); // Check if they are already blocked may be expensive
						if (infoBlock[1] && Number(infoBlock[1]) > 0) {
							await env.db.prepare("UPDATE users SET isblocked = ? WHERE id = ?").bind("true", infoBlock[1]).run();
							await SendMessage(url, env.DESTINATION, `User ${infoBlock[1]} blocked.`, false, infoBlock[1]);
						}
						else {
							await SendMessage(url, env.DESTINATION, "Invalid User ID.", false);
						}
					}
					else if(command === "/unblock") {
						let infoBlock = text.split(" "); // Check if they are already unblocked may be expensive
						if (infoBlock[1] && Number(infoBlock[1]) > 0) {
							await env.db.prepare("UPDATE users SET isblocked = ? WHERE id = ?").bind("false", infoBlock[1]).run();
							await SendMessage(url, env.DESTINATION, `User ${infoBlock[1]} unblocked.`, false, infoBlock[1]);
						}
						else {
							await SendMessage(url, env.DESTINATION, "Invalid User ID.", false);
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
						await SendMessage(url, env.DESTINATION, "Service suspended.", false);
					}
					else if (command === "/unsuspend") {
						suspended = false;
						custom_susp = "";
						await SendMessage(url, env.DESTINATION, "Service unsuspended.", false);
					}
					else if (command === "/help") {
						await SendMessage(url, env.DESTINATION, `User guide: ${user_guide}. FAQ: ${faq}.`, false);
					}
					else if (command === "/blocked") {
						const { results } = await env.db.prepare("SELECT * FROM users WHERE isblocked = ?")
							.bind("true").all();
						await SendFormatMessage(url, env.DESTINATION, results, false);
					}
					else if (command === "/pin") {
						let infoBlock = text.split(" ");
						if (infoBlock[1] && Number(infoBlock[1]) > 0) {
							pinned_usr = infoBlock[1];
							await SendMessage(url, env.DESTINATION, `User ${pinned_usr} pinned.`, false, pinned_usr);
						}
						else {
							await SendMessage(url, env.DESTINATION, "Invalid User ID.", false);
						}
					}
					else if (command === "/unpin") {
						await SendMessage(url, env.DESTINATION, `User ${pinned_usr} unpinned.`, false, pinned_usr);
						pinned_usr = "";
					}
					else if (command === "/show") {
						let infoBlock = text.split(" ");
						if (infoBlock[1] && Number(infoBlock[1]) > 0) {
							await SendMessage(url, env.DESTINATION, `User ${infoBlock[1]}.`, false, infoBlock[1]);
						}
						else {
							await SendMessage(url, env.DESTINATION, "Invalid User ID.", false);
						}
					}
					else if (command === "/history") {
						const { results } = await env.db.prepare("SELECT * FROM users").all();
						await SendFormatMessage(url, env.DESTINATION, results, false);
					}
					else if (command === "/delete") {
						let infoBlock = text.split(" ");
						if (infoBlock[1] && Number(infoBlock[1]) > 0) {
							await env.db.prepare("DELETE FROM users WHERE id = ?").bind(infoBlock[1]).run();
							await SendMessage(url, env.DESTINATION, `User ${infoBlock[1]} deleted (if exist).`, false, infoBlock[1]);
						}
						else {
							await SendMessage(url, env.DESTINATION, "Invalid User ID.", false);
						}
					}
					else if (command === "/broadcast") {
						let firstSpaceIndex = text.indexOf(' ');
						if (firstSpaceIndex !== -1) {
							let msg = text.slice(firstSpaceIndex + 1);
							try {
								const { results } = await env.db.prepare("SELECT id FROM users").all();
								if (results.length > 0) {
									await sendBroadcastMessage(url, env.DESTINATION, msg, results.map(row => row.id));
									await SendMessage(url, env.DESTINATION, "Message broadcasted.", false);
								}
								else {
									await SendMessage(url, env.DESTINATION, "There aren't users in your DB.", false);
								}
							} catch (err) {
								await SendMessage(url, env.DESTINATION, `Error: ${err}`, false);
							}
						}
						else {
							await SendMessage(url, env.DESTINATION, "You must provide a message to be broadcasted.", false);
						}
					}
					else if (payload.message.entities && payload.message.entities.length > 0 && payload.message.entities[0].type === "bot_command") { 
						await SendMessage(url, env.DESTINATION, `Hey chief! Invalid command, check the User guide at ${user_guide}.`, false);
					}
					else if (pinned_usr) {
						if (text) {
							await SendMessage(url, pinned_usr, text);
							await SendMessage(url, env.DESTINATION, `Reply sent to ${pinned_usr}.`, false, pinned_usr);
						}
					}
					else {
						await SendMessage(url, env.DESTINATION, `Hey chief! Invalid command, check the User guide at ${user_guide}.`, false);
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
						await SendMessage(url, chatId, `${susp_info} ${custom_susp}`);
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
						const is_bot = payload.message.from.is_bot;
						let extraInfo = `language_code:${lang} is_bot:${is_bot}`;
						if (text === "/start") {
							const { results } = await env.db.prepare("SELECT * FROM users WHERE id = ?")
								.bind(chatId).all();
							if (results.length === 0) {
								try {
									await env.db.prepare("INSERT INTO users (id, name, surname, username, start_date, isblocked, language_code, is_bot) VALUES (?,?,?,?,?,?,?,?)")
										.bind(chatId, first_name, last_name || "", username || "", (new Date()).toISOString(), "false", lang, is_bot).run();
									await SendMessage(url, chatId, `Hello, ${user}!`);
								} catch (err) {
									await SendMessage(url, env.DESTINATION, `Error during user ${chatId} start: ${err}.`, false, chatId);
								}
							}
							else {
								await SendMessage(url, chatId, `Welcome back, ${user}!`);
							}
							await SendMessage(url, env.DESTINATION, username ? `${info} @${username} ${extraInfo} started the bot.`	: `${info} ${extraInfo} started the bot.`, false, chatId);
						}
						else if (text === "/help") {
							await SendMessage(url, chatId, `This bot forward all messages you send to ${nick}. Through this bot, ${nick} can reply you.`);
							await SendMessage(url, env.DESTINATION, username ? `${info} @${username} ${extraInfo} typed /help.` : `${info} ${extraInfo} typed /help.`, false, chatId);
						}
						else {
							await SendMessage(url, chatId, "Message sent.");
							await ForwardMessage(url, env.DESTINATION, chatId, payload.message.message_id, false);
							await SendMessage(url, env.DESTINATION, username ? `${info} @${username} ${extraInfo}.` : `${info} ${extraInfo}.`, false, chatId);
						}
					}
				}
			}
		}
		return new Response("OK", { status: 200 });
	}
};