[Bot to be contacted without giving your telegram account.]

How to deploy the bot in JavaScript completely free (cloudfare based):
Webhooks based more efficent than polling. It can handle 100k request free per day (cloudfare limits)

Create a new bot on telegram with @BotFather (https://telegram.me/BotFather).
Save the api token.

Create a cloudfare account and click add a website or application.
Go to workers & pages then create a new workerthen deploy it.
Click quick edit so replace the code with the content of tel_bot.js then deploy it.
Click configure worker, go to setting, go to variables.
Add two varibles DESTINATION and API_KEY. DESTINATION is the unique id of who have to be contacted. API_KEY is the bot token. Encrypt them.

Open the following link after substitution to configure webhooks.
https://api.telegram.org/bot<replace with bot api token>/setWebhook?url=<replace with our worker url> 
You should see something like {"ok":true,"result":true,"description":"Webhook was set"} then the bot works.

[User guide:]
-Base user
Satrt the bot
Send a message to the bot to send a message to DESTINATION
-DESTINATION
Start the bot
To reply do reply at the message with the id of sender. 
To block the sender send a message "/block <replace with sender id>".
To unblock the sender send a message "/unblock <replace with sender id>".