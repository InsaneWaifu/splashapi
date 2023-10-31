import { Client, GatewayIntentBits, Message, TextChannel } from 'discord.js';
import 'dotenv/config'
import express from 'express';

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildModeration
	]
});

let guild;

const app = express()
const port = 3000


client.on('ready', () => {
	console.log(`Logged in as ${client.user!!.tag}!`);
});

let cache: string[] = [];

function getRandomInt(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

let loggedin = false;
let loggingin = false;
let last_cache_time = 0;

app.get('/', async (req, res) => {
	if (!loggedin) {
		if (loggingin) {
			res.send("the splash screens is still loading... sorry bout that :100:")
			return
		}
		loggingin = true;
		client.login(process.env.DISCORD_TOKEN);
		loggedin = true;
		loggingin = false;
	}

	if (cache.length == 0 || Date.now() - last_cache_time > 500*1000) {
		last_cache_time = Date.now();
		cache = [];
		let guild = await client.guilds.fetch("1077322702043496570")!!;
		let chan = await guild.channels.fetch("1106688230067277894")!! as TextChannel;


		let messages: Message[] = [];

		// Create message pointer
		let message = await chan.messages
		  .fetch({ limit: 1 })
		  .then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null));
	  
		while (message) {
		  await chan.messages
			.fetch({ limit: 100, before: message.id })
			.then(messagePage => {
			  messagePage.forEach(msg => messages.push(msg));
	  
			  // Update our message pointer to be the last message on the page of messages
			  message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
			});
		}

		messages.forEach(msg => cache.push(msg.content))
	}

	res.send(cache[getRandomInt(0, cache.length)]);

})
app.get("/info", (rq, res) => {
	res.send(`Cache of length ${cache.length}`)
})

app.get("/invalidate", (rq, res) => {
	cache = [];
	res.redirect("/")
})

client.login(process.env["TOKEN"])

console.log("Listen")
app.listen(3000, () => {
	console.log("Listening")
})
