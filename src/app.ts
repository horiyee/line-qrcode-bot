import {
  json,
  linebot,
  opine,
  hexToBuffer,
  qrcode,
  encodeBase64,
} from "./deps.ts";

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

  const base64Image = await qrcode(eventMessageText).catch(console.error);

  await event.reply(`"${eventMessageText}" をQRコードに変換しました！`);

  console.log({ eventMessageText, base64Image });

  const fileName = `${Date.now()}.jpg`;

  const image = encodeBase64(`${base64Image}`);
  const buffer = hexToBuffer(image);

  await Deno.writeFile(`../static/images/${fileName}`, new Uint8Array(buffer));

  const url = `${HOST}/images/${fileName}`;

  await event.reply({
    type: "image",
    originalContentUrl: url,
    previewImageUrl: url,
  });
});

app.listen(PORT, () =>
  console.log(`line-qrcode-bot is running on port ${PORT}`),
);
