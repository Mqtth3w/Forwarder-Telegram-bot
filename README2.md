# DB version
The version [tel_bot_db.js](./tel_bot_db.js) uses the Cloudflare D1 service, so it has a database and can save some data "permanetly". E.g. you can save all users that contacted you, etc. So this version have some more commands. The database has a free plan but it have some [limitations]().

## How to deploy it
- Go to workers & pages then to D1 SQL databases.
- Create a new database. the name doesn't really matter. Instead could be useful to set a location near to you.
- Select the database and create a new table called "users" with the following fileds and types:
    - id: text. Set it as primary key.
    - name: text.
    - surname: text.
    - username: text.
    - start_date: text.
    - isblocked: text. Default value: false.

## Extra commands (DESTINATION)
- `/history` gives you the list of users that started the bot, so id, name, surname (if exists), username (if exists), start date, if it is blocked. All the data refer to the date of the start. If the user change all the data you still be able to see they with the command `/show <User ID>`.
