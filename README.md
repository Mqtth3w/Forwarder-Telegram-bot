# Bot to be contacted without giving your Telegram account
This bot allow you to be contacted without giving your Telegram account. In particular, Anyone who contacts you via this bot only has the information indicated in the bot or associated with it. Instead, you will know "everything" about who contacts you: ID, name, username, profile, language, if it is a bot...

Inspired by https://t.me/killmilk_support_bot.


## How to deploy the bot completely free ([Cloudflare](https://www.cloudflare.com/) based)
It can handle 100k requests for free per day (Cloudflare limits).

- Create a new bot on telegram with [@BotFather](https://telegram.me/BotFather). Save the api token for future use.
- Create a Cloudflare account and click add a website or application.
- Go to workers & pages then create a new worker so deploy it.
- Click edit so replace the code with the content of [tel_bot.js](./tel_bot.js). Change the variable "nick" in the first lines with your custom nick, then deploy it.
- Click configure worker, go to setting, go to variables.
- Add the varible DESTINATION. Which is the unique Telegram ID of who have to be contacted.
- Add the variable API_KEY. Which is the bot api token.
- Add the variable SECRET_TOKEN. Generate its value through the script [gen_token.py](./gen_token.py). You can also type it with your hands (1-256 characters. Only characters `A-Z`, `a-z`, `0-9`, `_` and `-` are allowed). Save it for future use.
- Encrypt all variables and save.

- ### Webhook
  Open the following link after substitution to configure webhook.
  ```
  https://api.telegram.org/bot<replace with your bot api token>/setWebhook?url=<replace with your worker url>&secret_token=<replace with your secret token>
  ```
  You should see something like {"ok":true,"result":true,"description":"Webhook was set"} then the bot works.
  <br><br>
  If you filled wrong info or need to update info you can delete webhook and then you can set it again. Open the following link after substitution to delete webhook.
  ```
  https://api.telegram.org/bot<replace with your bot api token>/deleteWebhook
  ```

### Try it!
https://t.me/Mqtth3w_support_bot

<!--
## How to deploy the bot on your own server (best option, to stay 100% secure and anonym you cannot trust cloudflare):
[TODO] I don't have a own server to test it :(
To deploy it, follow these steps:
- Ensure that your server supports HTTPS and has a valid SSL/TLS certificate. Webhooks require secure connections.
- Install the required packages:
  ```bash
  pip install python-telegram-bot aiohttp
  ```
- Download tel_bot.py and edit it to set the TOKEN, DESTINATION and WEBHOOK_URL variables.
- Run the bot on your own server:
  ```bash
  python tel_bot.py
  ```
-->
# User guide
### Base user
- Start the bot.
- Send a message to the bot to send a message to DESTINATION.
- Send `/help` to see what the bot do: "This bot forward all messages you send to &lt;your nick&gt;. Through this bot, &lt;your nick&gt; can reply you.".
### DESTINATION
- Start the bot.
- To reply do reply at the message with the ID of the sender. You can reply with text, photo, video, audio, voice, animation, sticker, document and location.
- `/block <Sender ID>` block the sender. <!-- &lt;replace with senderID&gt; -->
- `/unblock <Sender ID>` unblock the sender.
- `/suspend <Optionally insert here a custom sentence>` suspend the service. Means that when a user uses the bot, they will receive a message: "Sorry, the service is temporarily suspended. [+custom sentence]". So the DESTINATION will not be informed. Example: `/suspend I'm in vacation` then the user will recive "Sorry, the service is temporarily suspended. I'm in vacation". You can also use the suspend command to change the custom sentence, sending it again with a new sentence.
- `/unsuspend` unsuspend the service. When you unsuspend, you clear the custom sentence.
- `/help` gives you a link to this User guide and FAQ.
- `/blocked` gives you the list of users you blocked (their IDs). This may be useful because if you update your bot's code, the blocked list will reset and start from scratch (limitation solved in the DB version).
- `/pin <User ID>` set the user with the specified ID as default receiver. It means if you send a message to the bot (not a command) it will be sent automatically to the pinned user except if you use the standard reply then you will reply the specified user.
- `/unpin` unpin the pinned user.
- `/show <User ID>` show you the profile of the user with the specified ID. It works only if the user has already started/used the bot. It doesn't give you an answer if the user doesn't exist or if the previous condition is not satisfied.

# DB version
[This](./README2.md) version is based on a database and have more commands.

# FAQ
- Why the sender ID? Because it is an unique identifier that never changes for the user (until deletion). It is like a primary key.
- Why to use webhook? Webhook is more efficient and scalable than polling.
- How can I change the "DESTINATION"? Go on your Cloudflare account, select the worker, go to variables, delete the variable "DESTINATION" so create it again with the new ID (Encrypt it). Looks like that now is possible to edit it by "Rotate" so without recreate it. If you change your Telegram account, you should also transefer the bot ownership to the new account through [@BotFather](https://telegram.me/BotFather).

# Discussion
For any comment or to request a new feature you can either use the [Discussions](https://github.com/Mqtth3w/Forwarder-Telegram-bot/discussions) section or contact me through the [bot](https://t.me/Mqtth3w_support_bot).

# Support
Donate to support my projects. 
- Crypto & others: Use the command `/support` in the [bot](https://t.me/Mqtth3w_support_bot).
- [Sponsor](https://github.com/sponsors/Mqtth3w).
- [Buy me a pizza](https://buymeacoffee.com/mqtth3w).

