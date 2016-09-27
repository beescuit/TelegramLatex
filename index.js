var token = ''; // Telegram Token
var TelegramBot = require('node-telegram-bot-api'); // Telegram Api
var randomstring = require("randomstring"); // Randomize file names
var bot = new TelegramBot(token, {polling: true}); // Create telegram bot
var mjAPI = require("mathjax-node"); // MathJax API (for rendering)

// OnCommand - /latex <input>
bot.onText(/\/latex (.+)/, function (msg, match) {
  var chatId = msg.chat.id;
  var resp = match[1]; // Arguments
  latex(resp, chatId); // Call the rendering function
});

function latex(latex, chatId) {
	var random = randomstring.generate(7); // Generate random file name
	mjAPI.config({
	  MathJax: {}
	});
	mjAPI.start();

	mjAPI.typeset({
	  math: latex,
	  format: "inline-TeX",
	  png:true,
	}, function (data) {
	  if (!data.errors) {
		// Base64 to full png
		var base64Data = data.png.replace(/^data:image\/png;base64,/, "");
		
		// Create file
		require("fs").writeFile("tmp/" + random + ".png", base64Data, 'base64', function(err) {
		  if(err) {
			console.log(err);
		  } else {
			bot.sendPhoto(chatId, "tmp/" + random + ".png", {caption: 'Latex rendered equation!'});
			// Remove file with some delay
			setTimeout(function(){ require("fs").unlinkSync("tmp/" + random + ".png"); }, 10000);
		  }
		});
		
	  }
	});
}
