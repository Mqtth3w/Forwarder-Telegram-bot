# Bot to be contacted without giving your Telegram account
This bot allow you to be contacted without giving your Telegram account. In particular, Anyone who contacts you via this bot only has the information indicated in the bot or associated with it. Instead, you will know "everything" about who contacts you: ID, name, username, profile, language, if it is a bot...

Inspired by https://t.me/killmilk_support_bot.


## How to deploy the bot completely free ([Cloudflare](https://www.cloudflare.com/) based)
It can handle 100k requests for free per day (Cloudflare limits). The deployment only takes 10 minutes even though it seems endless.

- Create a new bot on telegram with [@BotFather](https://telegram.me/BotFather). Save the api token for future use.
- Create a Cloudflare account and click add a website or application.
- Go to workers & pages then create a new worker so deploy it.
- Click edit so replace the code with the content of [tel_bot_db.js](./tel_bot_db.js). Change the variable "nick" in the first lines with your custom nick, then deploy it.
- Click configure worker, go to setting, go to variables.
- Add the varible DESTINATION. Which is the unique Telegram ID of who have to be contacted.
- Add the variable API_KEY. Which is the bot api token.
- Add the variable SECRET_TOKEN. Generate its value through the script [gen_token.py](./gen_token.py). You can also type it with your hands (1-256 characters. Only characters `A-Z`, `a-z`, `0-9`, `_` and `-` are allowed). Save it for future use.
- Encrypt all variables and save.
- ### DB setup
  Follow the instructions in the DB setup [file](./README2.md).

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


# User guide
### Base user
- Start the bot.
- Send a message to the bot to send a message to DESTINATION.
- Send `/help` to see what the bot do: "This bot forward all messages you send to &lt;your nick&gt;. Through this bot, &lt;your nick&gt; can reply you.".
### DESTINATION
- Start the bot.
- To reply do reply at the message with the ID of the sender. You can reply with text, photo, video, audio, voice, animation, sticker, contact, document and location.
- `/block <Sender ID>` blocks the sender. <!-- &lt;replace with senderID&gt; -->
- `/unblock <Sender ID>` unblocks the sender.
- `/suspend <Optionally insert here a custom sentence>` suspends the service. Means that when a user uses the bot, they will receive a message: "Sorry, the service is temporarily suspended. [+custom sentence]". So the DESTINATION will not be informed. Example: `/suspend I'm in vacation` then the user will recive "Sorry, the service is temporarily suspended. I'm in vacation". You can also use the suspend command to change the custom sentence, sending it again with a new sentence.
- `/unsuspend` unsuspends the service. When you unsuspend, you clear the custom sentence.
- `/help` gives you a link to this User guide and FAQ.
- `/history` gives you the list of users that started the bot and all their data in the database with chunks of ten. It gives also the total amount of users. All the data refer to the start date. If the user change all the data you still be able to see they with the command `/show <User ID>`. 
- `/blocked` gives you the same data of the previous but only for the blocked users.
- `/pin <User ID>` sets the user as default receiver. It means if you send a message to the bot (not a command) it will be sent automatically to the pinned user except if you use the standard reply then you will reply the specified user.
- `/unpin` unpins the pinned user.
- `/show <User ID>` shows you the profile of the user. It works only if the user has already started/used the bot. It doesn't give you an answer if the user doesn't exist or if the previous condition is not satisfied.
- `/pcuser` negates and show you the protect content state for the users. If it is true protects the contents of the sent message from forwarding and saving. The default value is true.
- `/pcdest` is equal to the previous but for the DESTINATION. In this case the default value is false.
- `/silentuser` negates and show you the disable notification state for the users. If it is true users will receive notifications with no sound. The dafault value is false.
- `/silentdest` is equal to the previous but for the DESTINATION.
- `/delete <User ID>` delete the user with the specified ID from the database.
- `/broadcast <Your message>` broadcast the message to all the users in the DB. You must provide a message.
- `/state` shows you the current state congfiguration, so service suspended, custom suspend phrase, pinned user, protect content (user side), protect content (dest side), user sound notifications enabled, dest sound notifications enabled.
  
# Light version
This [tel_bot.js](./tel_bot.js) version doesn't have a database but you still be able to use almost all the functionalities by changing the state variables in the code.

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
- [liberapay](https://liberapay.com/mqtth3w).

