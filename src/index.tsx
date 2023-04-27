import { Context, Schema, h } from "koishi";

export const name = "maifriend-image";

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

export function apply(ctx: Context) {
  const sendImage = "请发送图片。图片宽高比最好为1:1，否则只保留中间部分。";
  const pendings = new Set<string>();

  ctx
    .command("maifriend [image:text]", "生成maimai旅行伙伴图片")
    .action((_, image) => {
      const [code] = h.select(image || [], "image");
      if (code && code.attrs.url) return generate(code.attrs.url);
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
    const [code] = h.select(session.content || [], "image");
    if (!code || !code.attrs.url) return next();
    pendings.delete(session.gid + session.uid);
    return generate(code.attrs.url);
  });
}

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
          src={"https://img1.imgtp.com/2023/04/27/0415eqID.png"}
        />
      </div>
    </html>
  );
}
