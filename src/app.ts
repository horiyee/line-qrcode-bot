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

app.get("/images/:id", async (req, res) => {
  const id = req.params.id;

  const kv = await Deno.openKv();

  await kv
    .get(["qrcode", id])
    .then((result) => {
      const base64Image = result.value;

      const html = `
        <!DOCTYPE HTML>
        <html>
          <head>
            <title>QR Code</title>
            <meta property="og:title" content="QR Code" />
            <meta property="og:image" content="${base64Image}" />
            <meta property="twitter:image" content="${base64Image}" />
            <link rel="icon" type="image/x-icon" href="${base64Image}" />
          </head>
          <body>
            <img src="${base64Image}" />
          </body>
        </html>
      `;

      res.setHeader("Content-Type", "text/html");
      res.send(html);
    })
    .catch(console.error);
});

app.post("/callback", linebotParser);

bot.on("message", async (event) => {
  const eventMessageText = event.message.text;

  await qrcode(eventMessageText)
    .then(async (base64Image) => {
      const now = Date.now();

      const kv = await Deno.openKv();

      console.log((await kv.get(["qrcode", `${now}`])).versionstamp);

      await kv.set(["qrcode", `${now}`], base64Image);

      const url = `${HOST}/images/${now}`;

      await event.reply([
        `"${eventMessageText}" をQRコードに変換しました！`,
        "下のリンクから開いてね！",
        url,
      ]);
    })
    .catch(async (err) => {
      console.error(err);

      await event.reply([
        "エラーが発生しました :(",
        "送った文章が長すぎる場合、短くすれば成功するかもしれません！",
        "それでもうまくいかない場合は他の文章を送ってみてくれよな！",
      ]);
    });
});

app.listen(PORT, () =>
  console.log(`line-qrcode-bot is running on port ${PORT}`),
);
