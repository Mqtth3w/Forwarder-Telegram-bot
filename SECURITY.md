# Security Policy 📜

> [!IMPORTANT]
> ## Security guidelines
> 
> - Never share your bot api key.
> - Never Share your secret token.
> - Never share your Cloudflare worker url. If someone know your worker url can impersonate you with fake requests to the worker (they should also know your secret token or brute force it), because your Telegram ID is not secret. If your worker url is not secret change it!
>
> ## Attention!
> Please note: Cloudflare hosts your service so they could be able to see all your data. To stay really secure and anonym you should host it by yourself.
> 
> ## Good privacy practices 
> - To protect your privacy you could use a [duck address](https://duckduckgo.com/duckduckgo-help-pages/email-protection/duck-addresses/) for the cloudflare registration. A duck address should be binded to a privacy focused email (e.g. [tutamail](https://tuta.com/)).
> - Protect your ip address: no log [vpn](https://riseup.net/en/vpn), [whonix](https://www.whonix.org/).
---
> [!TIP]
> ## Certificate
> 
> Optionally, you can set up a self-signed certificate to enhance the security of the requests. 
> For more datails check the following links: [setWebhook](https://core.telegram.org/bots/api#setwebhook) and [self-signed](https://core.telegram.org/bots/self-signed).
---
<!--
## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 5.1.x   | :white_check_mark: |
| 5.0.x   | :x:                |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |
-->

> [!NOTE]
> ## Reporting a Vulnerability
> 
> Contact me [here](https://t.me/Mqtth3w_support_bot) or use the [Discussions](https://github.com/Mqtth3w/Forwarder-Telegram-bot/discussions) section.
>
> ## Responsibility
>
> You are responsible for what you do with this code. In some countries, e.g. EU states according to the GDPR law, there are laws that protect users from data collection so in that countries you should provide an opt out mode (db version).

<!--
Use this section to tell people how to report a vulnerability.

Tell them where to go, how often they can expect to get an update on a
reported vulnerability, what to expect if the vulnerability is accepted or
declined, etc.
-->
