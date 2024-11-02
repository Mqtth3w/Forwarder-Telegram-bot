# DB version
The version [tel_bot_db.js](./tel_bot_db.js) uses the Cloudflare D1 service, so it has a database and can save some data "permanetly". E.g. you can save all users that contacted you, etc. So this version have some more commands. The database has a free plan but it have some [limitations](https://developers.cloudflare.com/d1/platform/limits/) as the free worker. If you aren't famous the limits are very high, so no worries. Sometimes this version can be slow because Cloudflare gives a limited amout of resources especially in db writing operations so the normal version is recommended if you need a really responsive bot.

## How to deploy it (assuming that you have already deployed the normal version)
- Go to workers & pages then to D1 SQL databases.
- Create a new database. the name doesn't really matter. Instead could be useful to set a location near to "you".
- Select the database and create a new table called "users" with the following fileds and types:
    - id: text. Set it as primary key.
    - name: text.
    - surname: text.
    - username: text.
    - start_date: text.
    - isblocked: text. Default value: "false".
- Use the code of [tel_bot_db.js](./tel_bot_db.js) for your worker.
- With the worker selected, go to settings and then bindings. Click add, click D1 database, choose the variable name "db" and select your database by the name you set previously. Then deploy it.

## Extra commands (DESTINATION)
- `/history` gives you the list of users that started the bot, so id, name, surname (if exists), username (if exists), start date, blocked status. All the data refer to the date of the start. If the user change all the data you still be able to see they with the command `/show <User ID>`.
- `/blocked` gives you the same data of the previous but only for the blocked users. Now if you update your worker code the blocked users still stay blocked because they are saved in the database.
- `/delete <User ID>` delete the user with the specified ID from the database.
- `/broadcast <Your message>` broadcast the message to all the users in the DB. You must provide a messagge.
