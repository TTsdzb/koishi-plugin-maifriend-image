import { Context, Schema, h } from "koishi";
import path from "path";

export const name = "maifriend-image";

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

export function apply(ctx: Context) {
  ctx.i18n.define("zh-CN", require("./locales/zh-CN"));

  const imagePath = "file://" + path.resolve(__dirname, "frame.png");

  function generate(imageUrl: string): h {
    return (
      <html>
        <div
          style={{
            width: "1170px",
            height: "1162px",
          }}
        >
          <img
            style={{
              position: "absolute",
              left: "158px",
              top: "190px",
              width: "854px",
              height: "854px",
              "object-fit": "cover",
            }}
            src={imageUrl}
          />
          <img
            style={{
              position: "absolute",
              left: 0,
              top: 0,
            }}
            src={imagePath}
          />
        </div>
      </html>
    );
  }

  ctx.command("maifriend [image:text]").action(async ({ session }, image) => {
    const [argCode] = h.select(image || [], "img");

    if (argCode && argCode.attrs.src) return generate(argCode.attrs.src);

    await session.send(
      <>
        {session.channel ? <at id={session.userId} /> : ""}
        <i18n path=".pleaseSendImage" />
      </>
    );
    const [resCode] = h.select((await session.prompt()) || [], "img");
    if (resCode && resCode.attrs.src) return generate(resCode.attrs.src);

    return (
      <>
        {session.channel ? <at id={session.userId} /> : ""}
        <i18n path=".jobCanceled" />
      </>
    );
  });
}
