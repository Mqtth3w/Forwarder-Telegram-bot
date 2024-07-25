# Bot to be contacted without giving your Telegram account

This bot allow you to be contacted without giving your Telegram account. In particular, Anyone who contacts you via this bot only has the information indicated in the bot or associated with it. Instead, you will know "everything" about who contacts you: name, ID, username, profile link...

Inspired by https://t.me/killmilk_support_bot.


## How to deploy the bot in JavaScript completely free ([Cloudflare](https://www.cloudflare.com/) based):
It can handle 100k requests for free per day (Cloudflare limits).

- Create a new bot on telegram with [@BotFather](https://telegram.me/BotFather).
- Save the api token.

- Create a Cloudflare account and click add a website or application.
- Go to workers & pages then create a new worker so deploy it.
- Click edit so replace the code with the content of [tel_bot.js](./tel_bot.js) then deploy it.
- Click configure worker, go to setting, go to variables.
- Add two varibles DESTINATION and API_KEY. DESTINATION is the unique Telegram ID of who have to be contacted. API_KEY is the bot token. Encrypt them and save.

### Open the following link after substitution to configure webhooks.
- [https://api.telegram.org/bot&lt;replace with bot api token&gt;/setWebhook?url=&lt;replace with your worker url&gt;](URL).
- You should see something like {"ok":true,"result":true,"description":"Webhook was set"} then the bot works.

### Try it!
https://t.me/Mqtth3w_support_bot

# User guide
### Base user
- Satrt the bot.
- Send a message to the bot to send a message to DESTINATION.
### DESTINATION
- Start the bot.
- To reply do reply at the message with the ID of sender. 
- To block the sender send a message `/block <replace with sender ID>`. <!-- &lt;replace with senderID&gt; -->
- To unblock the sender send a message `/unblock <replace with sender ID>;`.
- To suspend the service send `/suspend <optionally insert here a custom sentence>`. Means that when a user uses the bot, they will receive a message: "Sorry, the service is temporarily suspended. [+custom sentence]". Example: `/suspend I'm in vacation` so the user will recive "Sorry, the service is temporarily suspended. I'm in vacation". You can also use the suspend command to change the custom sentence, sending it again with a new sentence.
- To unsuspend the service send `/unsuspend`. When you unsuspend, you clear the custom sentence.

# FAQ
- Why the sender ID? Because it is an unique identifier that never changes for the user (until deletion). It is like a primary key.
- Why to use webhook? Webhook is more efficent than polling. Cloudflare allows only this option.
- How can I change the "DESTINATION"? Go on your Cloudflare account, select the worker, go to variables, deleted "DESTINATION" so create it again with a the new ID (Encrypt it). If you change your Telegram account you should also transefer the bot ownership to the new account through [@BotFather](https://telegram.me/BotFather).
