import { json, linebot, opine } from "./deps.ts";

const options = {
  channelId: Deno.env.get("CHANNEL_ID"),
  channelSecret: Deno.env.get("CHANNEL_SECRET"),
  channelAccessToken: Deno.env.get("CHANNEL_ACCESS_TOKEN"),
  verify: true,
};

const bot = linebot(options);
const app = opine();
const linebotParser = bot.parser(json);

app.post("/callback", linebotParser);

bot.on("message", async (event) => {
  await event.reply(event.message.text).then(console.log);
});

// const port = Deno.env.get("PORT") || 80;

app.listen(8080, () => console.log(`line-qrcode-bot is running on port 8080`));
