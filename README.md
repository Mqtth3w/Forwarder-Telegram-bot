# Bot to be contacted without giving your telegram account.

## How to deploy the bot in JavaScript completely free (Cloudflare based):
It can handle 100k requests for free per day (Cloudflare limits).

- Create a new bot on telegram with @BotFather (https://telegram.me/BotFather).
- Save the api token.

- Create a Cloudflare account and click add a website or application.
- Go to workers & pages then create a new worker so deploy it.
- Click edit so replace the code with the content of [`tel_bot.js`](./tel_bot.js) then deploy it.
- Click configure worker, go to setting, go to variables.
- Add two varibles DESTINATION and API_KEY. DESTINATION is the unique ID of who have to be contacted. API_KEY is the bot token. Encrypt them and save.

### Open the following link after substitution to configure webhooks.
- [https://api.telegram.org/bot&lt;replace with bot api token&gt;/setWebhook?url=&lt;replace with your worker url&gt;](URL).
- You should see something like {"ok":true,"result":true,"description":"Webhook was set"} then the bot works.

### Try it!
https://t.me/Mqtth3w_support_bot

# User guide:
### Base user
- Satrt the bot
- Send a message to the bot to send a message to DESTINATION
### DESTINATION
- Start the bot
- To reply do reply at the message with the ID of sender. 
- To block the sender send a message "/block &lt;replace with sender ID&gt;".
- To unblock the sender send a message "/unblock &lt;replace with sender ID&gt;".

## FAQ
- Why the sender ID? Because it is an unique identifier that never changes for the user (until deletion). It is like a primary key.
- Why to use webhook? Webhook is more efficent than polling. Cloudflare allows only this option.
