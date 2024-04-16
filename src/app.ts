import { json, linebot, opine, qrcode } from "./deps.ts";

const HOST = Deno.env.get("HOST");
const PORT = Number(Deno.env.get("PORT"));

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
      await event.reply(`"${eventMessageText}" をQRコードに変換しました！`);

      const now = Date.now();

      const kv = await Deno.openKv();
      await kv.set(["qrcode", `${now}`], base64Image);

      const url = `${HOST}/images/${now}`;
      await event.reply({
        type: "image",
        originalContentUrl: url,
        previewImageUrl: url,
      });
    })
    .catch(console.error);
});

app.listen(PORT, () =>
  console.log(`line-qrcode-bot is running on port ${PORT}`),
);
