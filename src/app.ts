import { qrcode } from "./deps.ts";
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
  const eventMessageText = event.message.text;

  await qrcode(eventMessageText)
    .then(async (base64Image) => {
      console.log(base64Image);
      await event.reply(`${eventMessageText}をQRコードに変換しました！`);
    })
    .catch(console.error);
});

// const port = Deno.env.get("PORT") || 80;

app.listen(8080, () => console.log(`line-qrcode-bot is running on port 8080`));
