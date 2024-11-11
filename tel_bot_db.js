/**
 * @fileoverview This script handle a Telegram support bot to be contacted anonymously.
 *
 * @author Mqtth3w https://github.com/Mqtth3w/
 * @license GPL-3.0+ https://github.com/Mqtth3w/Forwarder-Telegram-bot/blob/main/LICENSE
 *
 */
// "Const"
const nick = "Mqtth3w"; // Change it with your nickname (NOT something linkable to you or your identity)
let susp_info = "Sorry, the service is temporarily suspended.";
const user_guide = "https://github.com/Mqtth3w/Forwarder-Telegram-bot/tree/main#user-guide";
const faq = "https://github.com/Mqtth3w/Forwarder-Telegram-bot/tree/main#faq";
// Default state
let suspended = false;
let custom_susp = "";
let pinned_usr = "";
let pc_user = true; // protect_content: If true protects the contents
let pc_dest = false; // of the sent message from forwarding and saving
let silent_user = false; // If true the user will receive the notifications without sound
let silent_dest = false;

/**
 * Sends a text message to a specified user via a Telegram bot.
 *
 * @param {string} url - The root URL for the Telegram bot API, e.g., `https://api.telegram.org/bot<token>/`.
 * @param {number|string} cId - The chat ID of the user to send the message to.
 * @param {string} txt - The text message to be sent.
 * @param {boolean} [pc=true] - Whether to protect the content of the message. Defaults to true.
 * @param {boolean} [s=false] - If true, disables notification for the message. Defaults to false.
 * @param {number|string} [prf] - The chat ID for the profile, used to generate an inline keyboard with a link to the user profile.
 * @returns {Promise<void>} - This function does not return a value.
 */
async function SendMessage(url, cId, txt, pc = true, s = false, prf) {
	let payload = {
		chat_id: cId,
		text: txt,
		protect_content: pc,
		disable_notification: s,
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

/**
 * Forwards any type of message to a specified user via a Telegram bot.
 *
 * @param {string} url - The root URL for the Telegram bot API, e.g., `https://api.telegram.org/bot<token>/`.
 * @param {number|string} cId - The chat ID of the user to send the message to.
 * @param {number|string} fcId - The chat ID of the user who sent the message to be forwarded.
 * @param {number|string} mId - The message ID of the message to be forwarded.
 * @param {boolean} [pc=true] - Whether to protect the content of the message. Defaults to true.
 * @param {boolean} [s=false] - If true, disables notification for the message. Defaults to false.
 * @returns {Promise<void>} - This function does not return a value.
 */
async function ForwardMessage(url, cId, fcId, mId, pc = true, s = false) {
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
			disable_notification: s,
		}),
	});
};

/**
 * Sends a formatted message with user details to a specified destination.
 * The function splits the users into batches of 10 to avoid message length limitations.
 *
 * @param {string} url - The root URL for the Telegram bot API, e.g., `https://api.telegram.org/bot<token>/`.
 * @param {number|string} dest - The chat ID of the destination where the message will be sent.
 * @param {Array<Object>} res - An array of user objects containing user information to be formatted and sent.
 * @param {boolean} [pc=true] - Whether to protect the content of the message. Defaults to true.
 * @param {boolean} [s=false] - If true, disables notification for the message. Defaults to false.
 * @returns {Promise<void>} - This function does not return a value.
 */
async function SendFormatMessage(url, dest, res, pc = true, s = false) {
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
		message += `ID: ${user.id}\n
			name: ${user.name}\n 
            surname: ${user.surname}\n
            username: ${username}\n
            start_date: ${user.start_date}\n 
            isblocked: ${user.isblocked}\n
			language_code: ${user.language_code}\n 
			is_bot: ${user.is_bot}\n\n`;
		if ((total % batchSize === 0) || (i === res.length - 1)) {
			if (i === res.length - 1) {
				message += `total: ${total}.`;
			}
			await SendMessage(url, dest, message, pc_dest, s);
			message = ""; 
		}
    }
};

/**
 * Sends a broadcast message to a list of users, handling errors and avoiding rate limits.
 * If an error occurs while sending a message to a user, it sends an error notification to the specified destination.
 *
 * @param {string} url - The root URL for the Telegram bot API, e.g., `https://api.telegram.org/bot<token>/`.
 * @param {number|string} dest - The chat ID of the destination where the error message will be sent in case of an issue.
 * @param {string} msg - The message to be sent to each user.
 * @param {Array<number|string>} users - An array of user IDs to whom the message will be sent.
 * @param {boolean} [pc=true] - Whether to protect the content of the message. Defaults to true.
 * @param {boolean} [s=false] - If true, disables notification for the message. Defaults to false.
 * @returns {Promise<void>} - This function does not return a value.
 */
async function sendBroadcastMessage(url, dest, msg, users, pc = true, s = false) {
    for (const userId of users) {
        try {
            await SendMessage(url, userId, msg, pc, s);
            await new Promise(resolve => setTimeout(resolve, 40)); // Avoid hitting rate limits (30 messages/second)
        } catch (err) {
            await SendMessage(url, dest, `An error occurred while broadcasting to the user ${userId}: ${err}.`, pc, s, userId);
        }
    }
};

/**
 * Sends a media message (photo, sticker, document, video, animation, audio, voice, location, or contact) to a specified chat.
 * The function determines the media type based on the message structure and sends the appropriate media type.
 * 
 * @param {string} url - The root URL for the Telegram bot API, e.g., `https://api.telegram.org/bot<token>/`.
 * @param {Object} msg - The message object containing the media or data to be sent.
 * @param {number|string} dest - The chat ID of the destination where the status message will be sent.
 * @param {number|string} cId - The chat ID of the user who will receive the media.
 * @param {boolean} [pc=true] - Whether to protect the content of the message (user side). Defaults to true.
 * @param {boolean} [pc_d=false] - Whether to protect the content of the status message (dest side). Defaults to false.
 * @param {boolean} [s=false] - If true, disables notification for the media message (user side). Defaults to false.
 * @param {boolean} [s_d=false] - If true, disables notification for the status message (dest side). Defaults to false.
 * @returns {Promise<void>} - This function does not return a value.
 */
async function SendMedia(url, msg, dest, cId, pc = true, pc_d = false, s = false, s_d = false) {
	let method = "";
	let method2 = "";
	let methodr = "";
	let fileId = "";
	let payload = { chat_id: cId, protect_content: pc, disable_notification: s };
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
	else if (msg.contact) {
        method = "sendContact";
        methodr = "Contact";
        payload.phone_number = msg.contact.phone_number;
        payload.first_name = msg.contact.first_name;
        if (msg.contact.last_name) payload.last_name = msg.contact.last_name;
    }
	else {
		await SendMessage(url, dest, `Unexpected data, reply not sent.`, pc_d, s_d);
		return;
	}

	if (!msg.location && !msg.contact) {
		payload[method2] = fileId;
	}

	await fetch(url + `${method}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});
	await SendMessage(url, dest, `${methodr} sent to ${cId}.`, pc_d, s_d, cId);
};

/**
 * Get the current state from the database. If the state does not exist, insert the default state.
 * 
 * @param {string} url - The root URL for the Telegram bot API, e.g., `https://api.telegram.org/bot<token>/`.
 * @param {object} db - The database connection object.
 * @param {number|string} dest - The chat ID of the destination where the error message will be sent in case of an issue.
 * @param {boolean} [pc=false] - Whether to protect the content of the error message. Defaults to false.
 * @param {boolean} [s=false] - Whether to sende the message with no sound. Defaults to false.
 * @returns {Promise<void>} - This function does not return a value.
 */
async function getCurrentState(url, db, dest, pc = false, s = false) {
    try {
        const { results } = await db.prepare("SELECT * FROM state").all();
        if (results && results.length === 0) {
            await db.prepare(`
                INSERT INTO state (suspended, custom_susp, pinned_usr, pc_user, pc_dest, silent_user, silent_dest)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(suspended.toString(), custom_susp, pinned_usr, pc_user.toString(), pc_dest.toString(), silent_user.toString(), silent_dest.toString()).run();
        }
		else {
            suspended = results[0]?.suspended === "true" ? true : (results[0]?.suspended === "false" ? false : suspended);
			custom_susp = results[0]?.custom_susp ?? custom_susp;
			pinned_usr = results[0]?.pinned_usr ?? pinned_usr;
			pc_user = results[0]?.pc_user === "true" ? true : (results[0]?.pc_user === "false" ? false : pc_user);
			pc_dest = results[0]?.pc_dest === "true" ? true : (results[0]?.pc_dest === "false" ? false : pc_dest);
			silent_user = results[0]?.silent_user === "true" ? true : (results[0]?.silent_user === "false" ? false : silent_user);
			silent_dest = results[0]?.silent_dest === "true" ? true : (results[0]?.silent_dest === "false" ? false : silent_dest);
        }
    } catch (err) {
        await SendMessage(url, dest, `An error occurred while getting the current state: ${err}.`, pc, s);
    }
};

/**
 * Update the current state in the database.
 * 
 * @param {string} url - The root URL for the Telegram bot API, e.g., `https://api.telegram.org/bot<token>/`.
 * @param {object} db - The database connection object.
 * @param {number|string} dest - The chat ID of the destination where the error message will be sent in case of an issue.
 * @param {boolean} [pc=false] - Whether to protect the content of the error message. Defaults to false.
 * @param {boolean} [s=false] - Whether to sende the message with no sound. Defaults to false.
 * @returns {Promise<void>} - This function does not return a value.
 */
async function updateCurrentState(url, db, dest, pc = false, s = false) {
    try {
        db.prepare(`UPDATE state
            SET suspended = ?, custom_susp = ?, pinned_usr = ?, pc_user = ?, pc_dest = ?, silent_user = ?, silent_dest = ?;`
			).bind(suspended.toString(), custom_susp, pinned_usr, pc_user.toString(), pc_dest.toString(), silent_user.toString(), silent_dest.toString()).run();
    } catch (err) {
        await SendMessage(url, dest, `An error occurred while updating the current state: ${err}.`, pc, s);
    }
};

/**
 * Handles incoming requests to the Cloudflare Worker.
 * 
 * @param {Request} request - The HTTP request object representing the incoming request.
 * @param {ExecutionContext} env - The environment object containing runtime information, such as bindings.
 * @returns {Promise<Response>} A Promise that resolves to a Response object, which will be returned as the response to the incoming request.
 */
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
				await getCurrentState(url, env.db, env.DESTINATION, pc_dest, silent_dest);
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
								await SendMessage(url, senderId, text, pc_user, silent_user);
								await SendMessage(url, env.DESTINATION, `Reply sent to ${senderId}.`, pc_dest, silent_dest, senderId);
							}
							else {
								await SendMedia(url, payload.message, env.DESTINATION, senderId, pc_user, pc_dest, silent_user, silent_dest);
							}
						}
						else {
							await SendMessage(url, env.DESTINATION, "Reply only to messages starting with an user ID.", pc_dest, silent_dest);
						}
					}
					else if (command === "/start") {
						await SendMessage(url, env.DESTINATION, "Hello, chief!", pc_dest, silent_dest);
					}
					else if (command === "/block") {
						let infoBlock = text.split(" "); // Check if they are already blocked may be expensive
						if (infoBlock[1] && Number(infoBlock[1]) > 0) {
							try {
								await env.db.prepare("UPDATE users SET isblocked = ? WHERE id = ?").bind("true", infoBlock[1]).run();
								await SendMessage(url, env.DESTINATION, `User ${infoBlock[1]} blocked.`, pc_dest, silent_dest, infoBlock[1]);
							} catch (err) {
								await SendMessage(url, env.DESTINATION, `An error occurred while saving the blocked user: ${err}.`, pc_dest, silent_dest, infoBlock[1]);
							}
						}
						else {
							await SendMessage(url, env.DESTINATION, "Invalid User ID.", pc_dest, silent_dest);
						}
					}
					else if(command === "/unblock") {
						let infoBlock = text.split(" "); // Check if they are already unblocked may be expensive
						if (infoBlock[1] && Number(infoBlock[1]) > 0) {
							try {
								await env.db.prepare("UPDATE users SET isblocked = ? WHERE id = ?").bind("false", infoBlock[1]).run();
								await SendMessage(url, env.DESTINATION, `User ${infoBlock[1]} unblocked.`, pc_dest, silent_dest, infoBlock[1]);
							} catch (err) {
								await SendMessage(url, env.DESTINATION, `An error occurred while saving the unblocked user: ${err}.`, pc_dest, silent_dest, infoBlock[1]);
							}
						}
						else {
							await SendMessage(url, env.DESTINATION, "Invalid User ID.", pc_dest, silent_dest);
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
						await updateCurrentState(url, env.db, env.DESTINATION, pc_dest, silent_dest);
						await SendMessage(url, env.DESTINATION, "Service suspended.", pc_dest, silent_dest);
					}
					else if (command === "/unsuspend") {
						suspended = false;
						custom_susp = "";
						await updateCurrentState(url, env.db, env.DESTINATION, pc_dest, silent_dest);
						await SendMessage(url, env.DESTINATION, "Service unsuspended.", pc_dest, silent_dest);
					}
					else if (command === "/help") {
						await SendMessage(url, env.DESTINATION, `User guide: ${user_guide}. FAQ: ${faq}.`, pc_dest, silent_dest);
					}
					else if (command === "/blocked") {
						try {
							const { results } = await env.db.prepare("SELECT * FROM users WHERE isblocked = ?")
								.bind("true").all();
							await SendFormatMessage(url, env.DESTINATION, results, pc_dest, silent_dest);
						} catch (err) {
							await SendMessage(url, env.DESTINATION, `An error occurred while getting the blocked users: ${err}.`, pc_dest, silent_dest);
						}
					}
					else if (command === "/pin") {
						let infoBlock = text.split(" ");
						if (infoBlock[1] && Number(infoBlock[1]) > 0) {
							pinned_usr = infoBlock[1];
							await updateCurrentState(url, env.db, env.DESTINATION, pc_dest, silent_dest);
							await SendMessage(url, env.DESTINATION, `User ${pinned_usr} pinned.`, pc_dest, silent_dest, pinned_usr);
						}
						else {
							await SendMessage(url, env.DESTINATION, "Invalid User ID.", pc_dest, silent_dest);
						}
					}
					else if (command === "/unpin") {
						let msg = `User ${pinned_usr} unpinned.`;
						pinned_usr = "";
						await updateCurrentState(url, env.db, env.DESTINATION, pc_dest, silent_dest);
						await SendMessage(url, env.DESTINATION, msg, pc_dest, silent_dest, pinned_usr);
					}
					else if (command === "/show") {
						let infoBlock = text.split(" ");
						if (infoBlock[1] && Number(infoBlock[1]) > 0) {
							await SendMessage(url, env.DESTINATION, `User ${infoBlock[1]}.`, pc_dest, silent_dest, infoBlock[1]);
						}
						else {
							await SendMessage(url, env.DESTINATION, "Invalid User ID.", pc_dest, silent_dest);
						}
					}
					else if (command === "/history") {
						try {
							const { results } = await env.db.prepare("SELECT * FROM users").all();
							await SendFormatMessage(url, env.DESTINATION, results, pc_dest, silent_dest);
						} catch (err) {
							await SendMessage(url, env.DESTINATION, `An error occurred while getting the users: ${err}.`, pc_dest, silent_dest);
						}
					}
					else if (command === "/delete") {
						let infoBlock = text.split(" ");
						if (infoBlock[1] && Number(infoBlock[1]) > 0) {
							try {
								await env.db.prepare("DELETE FROM users WHERE id = ?").bind(infoBlock[1]).run();
								await SendMessage(url, env.DESTINATION, `User ${infoBlock[1]} deleted (if exist).`, pc_dest, silent_dest, infoBlock[1]);
							} catch (err) {
								await SendMessage(url, env.DESTINATION, `An error occurred while the user delete: ${err}.`, pc_dest, silent_dest, infoBlock[1]);
							}
						}
						else {
							await SendMessage(url, env.DESTINATION, "Invalid User ID.", pc_dest, silent_dest);
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
									await SendMessage(url, env.DESTINATION, "Message broadcasted.", pc_dest, silent_dest);
								}
								else {
									await SendMessage(url, env.DESTINATION, "There aren't users in your DB.", pc_dest, silent_dest);
								}
							} catch (err) {
								await SendMessage(url, env.DESTINATION, `An error occurred while getting the users: ${err}.`, pc_dest, silent_dest);
							}
						}
						else {
							await SendMessage(url, env.DESTINATION, "You must provide a message to be broadcasted.", pc_dest, silent_dest);
						}
					}
					else if (command === "/pcuser") {
						pc_user = !pc_user;
						await updateCurrentState(url, env.db, env.DESTINATION, pc_dest, silent_dest);
						let msg = pc_user ? `User content protection is enabled.` : `User content protection is disabled.`;
						await SendMessage(url, env.DESTINATION, msg, pc_dest, silent_dest);
					}
					else if (command === "/pcdest") {
						pc_dest = !pc_dest;
						await updateCurrentState(url, env.db, env.DESTINATION, pc_dest, silent_dest);
						let msg = pc_dest ? `Destionation content protection is enabled.` : `Destination content protection is disabled.`;
						await SendMessage(url, env.DESTINATION, msg, pc_dest, silent_dest);
					}
					else if (command === "/silentuser") {
						silent_user = !silent_user;
						await updateCurrentState(url, env.db, env.DESTINATION, pc_dest, silent_dest);
						let msg = silent_user ? `User sound notifications are disabled.` : `User sound notifications are enabled.`;
						await SendMessage(url, env.DESTINATION, msg, pc_dest, silent_dest);
					}
					else if (command === "/silentdest") {
						silent_dest = !silent_dest;
						await updateCurrentState(url, env.db, env.DESTINATION, pc_dest, silent_dest);
						let msg = silent_dest ? `Destination sound notifications are disabled.` : `Destination sound notifications are enabled.`;
						await SendMessage(url, env.DESTINATION, msg, pc_dest, silent_dest);
					}
					else if (payload.message.entities && payload.message.entities.length > 0 && payload.message.entities[0].type === "bot_command") { 
						await SendMessage(url, env.DESTINATION, `Hey chief! Invalid command, check the User guide at ${user_guide}.`, pc_dest, silent_dest);
					}
					else if (pinned_usr) {
						if (text) {
							await SendMessage(url, pinned_usr, text, pc_user);
							await SendMessage(url, env.DESTINATION, `Reply sent to ${pinned_usr}.`, pc_dest, silent_dest, pinned_usr);
						}
						else {
							await SendMedia(url, payload.message, env.DESTINATION, pinned_usr, pc_user, pc_dest, silent_user, silent_dest);
						}
					}
					else {
						await SendMessage(url, env.DESTINATION, `Hey chief! Invalid command, check the User guide at ${user_guide}.`, pc_dest, silent_dest);
					}
				}
				else {
					const { results } = await env.db.prepare("SELECT isblocked FROM users WHERE id = ?").bind(chatId).all();
					let isBlocked = "false";
					if (results && results.length > 0) {
						isBlocked = results[0].isblocked;
					}
					if (isBlocked === "false" && suspended) {
						await SendMessage(url, chatId, `${susp_info} ${custom_susp}`, pc_user, silent_user);
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
							try {
								const { results } = await env.db.prepare("SELECT * FROM users WHERE id = ?").bind(chatId).all();
								if (results.length === 0) {
									await env.db.prepare("INSERT INTO users (id, name, surname, username, start_date, isblocked, language_code, is_bot) VALUES (?,?,?,?,?,?,?,?)")
										.bind(chatId, first_name, last_name || "", username || "", (new Date()).toISOString(), "false", lang, is_bot).run();
									await SendMessage(url, chatId, `Hello, ${user}!`, pc_user, silent_user);
								}
								else {
									await SendMessage(url, chatId, `Welcome back, ${user}!`, pc_user, silent_user);
								}
								await SendMessage(url, env.DESTINATION, username ? `${info} @${username} ${extraInfo} started the bot.`	: `${info} ${extraInfo} started the bot.`, pc_dest, silent_dest, chatId);
							} catch (err) {
								await SendMessage(url, env.DESTINATION, `An error occurred while saving the new user: ${err}.`, pc_dest, silent_dest, chatId);
							}
						}
						else if (text === "/help") {
							await SendMessage(url, chatId, `This bot forward all messages you send to ${nick}. Through this bot, ${nick} can reply you.`, pc_user, silent_user);
							await SendMessage(url, env.DESTINATION, username ? `${info} @${username} ${extraInfo} typed /help.` : `${info} ${extraInfo} typed /help.`, pc_dest, silent_dest, chatId);
						}
						else {
							await SendMessage(url, chatId, `Message sent to ${nick}.`, pc_user, silent_user);
							await ForwardMessage(url, env.DESTINATION, chatId, payload.message.message_id, pc_dest, silent_dest);
							await SendMessage(url, env.DESTINATION, username ? `${info} @${username} ${extraInfo}.` : `${info} ${extraInfo}.`, pc_dest, silent_dest, chatId);
						}
					}
				}
			}
		}
		return new Response("OK", { status: 200 });
	}
};