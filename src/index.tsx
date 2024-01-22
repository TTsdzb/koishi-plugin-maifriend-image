import { Context, Schema, h } from "koishi";
import path from "path";

export const name = "maifriend-image";

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

export function apply(ctx: Context) {
  const imagePath = "file://" + path.resolve(__dirname, "frame.png");
  const sendImage = "请发送图片。图片宽高比最好为1:1，否则只保留中间部分。";
  const pendings = new Set<string>();

  function generate(imageUrl: string) {
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

  ctx
    .command("maifriend [image:text]", "生成maimai旅行伙伴图片")
    .action((_, image) => {
      const [code] = h.select(image || [], "img");
      if (code && code.attrs.src) return generate(code.attrs.src);
      else {
        pendings.add(_.session.gid + _.session.uid);
        if (_.session.channel)
          return (
            <>
              <at id={_.session.userId} />
              {sendImage}
            </>
          );
        else return sendImage;
      }
    });

  ctx.middleware((session, next) => {
    if (!pendings.has(session.gid + session.uid)) return next();
    const [code] = h.select(session.content || [], "img");
    if (!code || !code.attrs.src) return next();
    pendings.delete(session.gid + session.uid);
    return generate(code.attrs.src);
  });
}
