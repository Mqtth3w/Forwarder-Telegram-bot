
# DB setup
- Go to workers & pages then to D1 SQL databases.
- Create a new database. the name doesn't really matter. Instead could be useful to set a location near to "you".
- Select the database and create a new table called "users" with the following columns and types:
    - id: text. Set it as primary key.
    - name: text.
    - surname: text.
    - username: text.
    - start_date: text.
    - isblocked: text.
    - language_code: text.
    - is_bot: text.
- Create another table called "state" with the following columns and types:
    - suspended: text.
    - custom_susp: text.
    - pinned_usr: text.
    - pc_user: text.
    - pc_dest: text.
    - silent_user: text.
    - silent_dest: text.
- With the worker selected, go to settings and then bindings. Click add, click D1 database, choose the variable name "db" and select your database by the name you set previously. Then deploy it.

# DB info
It uses the Cloudflare D1 service. The database has a free plan but it have some [limitations](https://developers.cloudflare.com/d1/platform/limits/) as the free worker. If you aren't famous the limits are very high, so no worries. Sometimes this version can be slow (we are talking about milliseconds) because Cloudflare gives a limited amout of resources especially in db writing operations so the light version is recommended if you need a really responsive bot.

# Support
Donate to support my projects. 
- Crypto & others: Use the command `/support` in the [bot](https://t.me/Mqtth3w_support_bot).
- [Sponsor](https://github.com/sponsors/Mqtth3w).
- [Buy me a pizza](https://buymeacoffee.com/mqtth3w).
- [liberapay](https://liberapay.com/mqtth3w).
