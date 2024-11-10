/**
 * @fileoverview This script handle a Telegram support bot to be contacted anonymously.
 *
 * @author Mqtth3w https://github.com/Mqtth3w/
 * @license GPL-3.0+ https://github.com/Mqtth3w/Forwarder-Telegram-bot/blob/main/LICENSE
 *
 */
/**
 * Event listener that listens for the 'fetch' event and delegates to the `handleRequest` function.
 * 
 * @param {FetchEvent} event - The FetchEvent object representing the incoming fetch event.
 * The event contains the `request` object, which holds details about the incoming HTTP request.
 */
addEventListener("fetch", event => {
	event.respondWith(handleRequest(event.request));
});

let blocked = ["-1"]
let suspended = false;
let susp_info = "Sorry, the service is temporarily suspended.";
let custom_susp = "";
let pinned_usr = ""; 
const nick = "Mqtth3w"; // Change it with your nickname (NOT something linkable to you or your identity)
let pc_user = true; // protect_content: If true protects the contents
let pc_dest = false; // of the sent message from forwarding and saving
let silent_user = false; // If true the user will receive the notifications without sound
let silent_dest = false;
let url = `https://api.telegram.org/bot${API_KEY}/`;
const user_guide = "https://github.com/Mqtth3w/Forwarder-Telegram-bot/tree/main#user-guide";
const faq = "https://github.com/Mqtth3w/Forwarder-Telegram-bot/tree/main#faq";

/**
 * Sends a text message to a specified user via a Telegram bot.
 *
 * @param {number|string} cId - The chat ID of the user to send the message to.
 * @param {string} txt - The text message to be sent.
 * @param {boolean} [pc=true] - Whether to protect the content of the message. Defaults to true.
 * @param {boolean} [s=false] - If true, disables notification for the message. Defaults to false.
 * @param {number|string} [prf] - The chat ID for the profile, used to generate an inline keyboard with a link to the user profile.
 * @returns {Promise<void>} - This function does not return a value.
 */
async function SendMessage(cId, txt, pc = true, s = false, prf) {
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
 * @param {number|string} cId - The chat ID of the user to send the message to.
 * @param {number|string} fcId - The chat ID of the user who sent the message to be forwarded.
 * @param {number|string} mId - The message ID of the message to be forwarded.
 * @param {boolean} [pc=true] - Whether to protect the content of the message. Defaults to true.
 * @param {boolean} [s=false] - If true, disables notification for the message. Defaults to false.
 * @returns {Promise<void>} - This function does not return a value.
 */
async function ForwardMessage(cId, fcId, mId, pc = true, s = false) {
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
 * Sends a media message (photo, sticker, document, video, animation, audio, voice, location, or contact) to a specified chat.
 * The function determines the media type based on the message structure and sends the appropriate media type.
 * 
 * @param {Object} msg - The message object containing the media or data to be sent.
 * @param {number|string} dest - The chat ID of the destination where the status message will be sent.
 * @param {number|string} cId - The chat ID of the user who will receive the media.
 * @param {boolean} [pc=true] - Whether to protect the content of the message (user side). Defaults to true.
 * @param {boolean} [pc_d=false] - Whether to protect the content of the status message (dest side). Defaults to false.
 * @param {boolean} [s=false] - If true, disables notification for the media message (user side). Defaults to false.
 * @param {boolean} [s_d=false] - If true, disables notification for the status message (dest side). Defaults to false.
 * @returns {Promise<void>} - This function does not return a value.
 */
async function SendMedia(msg, dest, chatId, pc = true, pc_d = false, s = false, s_d = false) {
	let method = "";
	let method2 = "";
	let methodr = "";
	let fileId = "";
	let payload = { chat_id: chatId, protect_content: pc, disable_notification: s };
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
		await SendMessage(dest, `Unexpected data, reply not sent.`, pc_d, s_d);
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
	await SendMessage(dest, `${methodr} sent to ${chatId}.`, pc_d, s_d, chatId);
};

/**
 * Handles the incoming HTTP request.
 * 
 * @param {Request} request - The HTTP request object representing the incoming request.
 * @returns {Promise<Response>} A Promise that resolves to a Response object, which will be returned as the response to the incoming request.
 */
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
							await SendMessage(senderId, text, pc_user, silent_user);
							await SendMessage(DESTINATION, `Reply sent to ${senderId}.`, pc_dest, silent_dest, senderId);
						}
						else {
							await SendMedia(payload.message, DESTINATION, senderId, pc_user, pc_dest, silent_dest);
						}
					}
					else {
						await SendMessage(DESTINATION, "Reply only to messages starting with an user ID.", pc_dest, silent_dest);
					}
				}
				else if (command === "/start") {
					await SendMessage(DESTINATION, "Hello, chief!", pc_dest, silent_dest);
				}
				else if (command === "/block") {
					let infoBlock = text.split(" ");
					if (infoBlock[1] && Number(infoBlock[1]) > 0) {
						if (!blocked.includes(infoBlock[1])) { // Not already blocked
							blocked.push(infoBlock[1]);
							await SendMessage(DESTINATION, `User ${infoBlock[1]} blocked.`, pc_dest, silent_dest, infoBlock[1]);
						}
						else {
							await SendMessage(DESTINATION, "User already blocked.", pc_dest, silent_dest);
						}
					}
					else {
						await SendMessage(DESTINATION, "Invalid User ID.", pc_dest, silent_dest);
					}
				}
				else if(command === "/unblock") {
					let infoBlock = text.split(" ");
					if (infoBlock[1] && Number(infoBlock[1]) > 0) {
						let index = blocked.indexOf(infoBlock[1]);
						if (index > -1) { // Only splice array when item is found
							blocked.splice(index, 1); // 2nd parameter means remove one item only
							await SendMessage(DESTINATION, `User ${infoBlock[1]} unblocked.`, pc_dest, silent_dest, infoBlock[1]);
						}
						else {
							await SendMessage(DESTINATION, "Hey chief, the user is not blocked.", pc_dest, silent_dest);
						}
					}
					else {
						await SendMessage(DESTINATION, "Invalid User ID.", pc_dest, silent_dest);
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
					await SendMessage(DESTINATION, "Service suspended.", pc_dest, silent_dest);
				}
				else if (command === "/unsuspend") {
					suspended = false;
					custom_susp = "";
					await SendMessage(DESTINATION, "Service unsuspended.", pc_dest, silent_dest);
				}
				else if (command === "/help") {
					await SendMessage(DESTINATION, `User guide: ${user_guide}. FAQ: ${faq}.`, pc_dest, silent_dest);
				}
				else if (command === "/blocked") {
					let blocked_str = 'blocked = ["' + blocked.join('", "') + '"]';
					await SendMessage(DESTINATION, blocked_str, pc_dest, silent_dest);
				}
				else if (command === "/pin") {
					let infoBlock = text.split(" ");
					if (infoBlock[1] && Number(infoBlock[1]) > 0) {
						pinned_usr = infoBlock[1];
						await SendMessage(DESTINATION, `User ${pinned_usr} pinned.`, pc_dest, silent_dest, pinned_usr);
					}
					else {
						await SendMessage(DESTINATION, "Invalid User ID.", pc_dest, silent_dest);
					}
				}
				else if (command === "/unpin") {
					await SendMessage(DESTINATION, `User ${pinned_usr} unpinned.`, pc_dest, silent_dest, pinned_usr);
					pinned_usr = "";
				}
				else if (command === "/show") {
					let infoBlock = text.split(" ");
					if (infoBlock[1] && Number(infoBlock[1]) > 0) {
						await SendMessage(DESTINATION, `User ${infoBlock[1]}.`, pc_dest, silent_dest, infoBlock[1]);
					}
					else {
						await SendMessage(DESTINATION, "Invalid User ID.", pc_dest, silent_dest);
					}
				}
				else if (command === "/pcuser") {
					pc_user = !pc_user;
					let msg = pc_user ? `User content protection is enabled.` : `User content protection is disabled.`;
					await SendMessage(DESTINATION, msg, pc_dest, silent_dest);
				}
				else if (command === "/pcdest") {
					pc_dest = !pc_dest;
					let msg = pc_dest ? `Destionation content protection is enabled.` : `Destination content protection is disabled.`;
					await SendMessage(DESTINATION, msg, pc_dest, silent_dest);
				}
				else if (command === "/silentuser") {
					silent_user = !silent_user;
					let msg = silent_user ? `User sound notifications are disabled.` : `User sound notifications are enabled.`;
					await SendMessage(DESTINATION, msg, pc_dest, silent_dest);
				}
				else if (command === "/silentdest") {
					silent_dest = !silent_dest;
					let msg = silent_dest ? `Destination sound notifications are disabled.` : `Destination sound notifications are enabled.`;
					await SendMessage(DESTINATION, msg, pc_dest, silent_dest);
				}
				else if (payload.message.entities && payload.message.entities.length > 0 && payload.message.entities[0].type === "bot_command") { 
					await SendMessage(DESTINATION, `Hey chief! Invalid command, check the User guide at ${user_guide}.`, pc_dest, silent_dest);
				}
				else if (pinned_usr) {
					if (text) {
						await SendMessage(pinned_usr, text, pc_user, silent_user);
						await SendMessage(DESTINATION, `Reply sent to ${pinned_usr}`, pc_dest, silent_dest, pinned_usr);
					}
					else {
						await SendMedia(payload.message, DESTINATION, pinned_usr, pc_user, pc_dest, silent_user, silent_dest);
					}
				}
				else { 
					await SendMessage(DESTINATION, `Hey chief! Invalid command, check the User guide at ${user_guide}.`, pc_dest, silent_dest);
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
				let extraInfo = `language_code=${payload.message.from.language_code} is_bot=${payload.message.from.is_bot}`;
				if (text === "/start") {
					await SendMessage(chatId, `Hello, ${user}!`, pc_user, silent_user);
					await SendMessage(DESTINATION, username ? `${info} @${username} ${extraInfo} started the bot.`	: `${info} ${extraInfo} started the bot.`, pc_dest, silent_dest, chatId);
				}
				else if (text === "/help") {
					await SendMessage(chatId, `This bot forward all messages you send to ${nick}. Through this bot, ${nick} can reply you.`, pc_user, silent_user);
					await SendMessage(DESTINATION, username ? `${info} @${username} ${extraInfo} typed /help.` : `${info} ${extraInfo} typed /help.`, pc_dest, silent_dest, chatId);
				}
				else {
					await SendMessage(chatId, `Message sent to ${nick}.`, pc_user, silent_user);
					await ForwardMessage(DESTINATION, chatId, payload.message.message_id, pc_dest, silent_dest);
					await SendMessage(DESTINATION, username ? `${info} @${username} ${extraInfo}.` : `${info} ${extraInfo}.`, pc_dest, silent_dest, chatId);
				}
			}
		}
	}
	return new Response("OK", { status: 200 });
};