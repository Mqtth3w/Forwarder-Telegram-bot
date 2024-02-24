from telegram.ext import Updater, CommandHandler, MessageHandler, filters, Application

TOKEN = "6897686310:AAFMKTYJF2AyGvIG2D2RUYRAlH8F7CNW02s"
DESTINATION = 5804269249

async def start(update, context):
    
    first_name = str(update.message.from_user.first_name)
    welcome = "Hello, " + first_name
    if update.message.from_user.last_name:
        welcome = welcome + " " + str(update.message.from_user.last_name) 
        
    welcome = welcome + "!"
    await update.message.reply_text(welcome)
    

async def forward(update, context):
    
    try:
        target_chat_id = DESTINATION #update.message.from_user.id
        
        await context.bot.forward_message(
            chat_id=target_chat_id,
            from_chat_id=update.message.chat_id,
            message_id=update.message.message_id
        )
        
        await update.message.reply_text("Message sent.")
        
    except Exception as e:
        
        print(f"Error in forwarding message: {e}")
        await update.message.reply_text("An error occurred.")
    
    
async def reply(update, context):
    pass
    


if __name__ == '__main__':
    application = Application.builder().token(TOKEN).build()
    
    # Commands
    application.add_handler(CommandHandler('start', start))

    # Forward messagges
    application.add_handler(MessageHandler(filters.TEXT, forward))
    
    # Replyes
    #application.add_handler(MessageHandler(filters.TEXT, reply))
    
    # Run bot
    application.run_polling(1.0)
    print("running...")
    
'''
updater = Updater(TOKEN)
updater.dispatcher.add_handler(CommandHandler('start', start))
updater.dispatcher.add_handler(MessageHandler(filters.text, send))
updater.start_polling()'''

'''
/*
async function handleRequest(request) {
  if (request.method === "POST") {
    const payload = await request.json() 
    // Getting the POST request JSON payload
    if ('message' in payload) { 
      // Checking if the payload comes from Telegram
      const chatId = payload.message.chat.id
      const text = payload.message.text 
      const url = `https://api.telegram.org/bot${API_KEY}/sendMessage?chat_id=${chatId}&text=${text}`
      const data = await fetch(url).then(resp => resp.json()) 
      // Calling the API endpoint to send a telegram message
    }
  }
  return new Response("OK") // Doesn't really matter
}*/
'''
