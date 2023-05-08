const express = require("express");
const { request } = require("urllib");
const { v4: uuidv4 } = require("uuid");
const app = express();
const port = process.env.PORT || 3030;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/send-transaction", async (requestParam, responseParam) => {
  const payload = getPayload();
  console.log(`payload=${payload}`);
  try {
    const { data, res } = await request(
      "https://sistemadev.com/asp/osp/authrequest?customer=7824",
      {
        method: "POST",
        content: JSON.stringify({
          messageId: `TRX_${uuidv4()}`,
          messageType: "AUTH",
          ts: "oFEEC777D7",
          userId: null,
          deviceId: null,
          payloadData: {
            passType: "2",
            notifyMsgFlag: "0",
            notifyMsgData: {
              textToDisplay: "Authenticate your transaction"
            },
            msgFlag: "0",
            msgData: {
              data: "Apa aja bisa dah!"
            }
          },
          callbackUrl: "https://sistemadev.com/osp",
          vseSign: "1",
          appBundleId: "id.co.sistema.vkey"
        }),
        headers: { 'Content-Type': 'application/json', },
        timeout: 60000,
        digestAuth: "7824:f33e1e4c6d6bd0aed9ebab909e059391",
      }
    );

    console.log(`body string=${data.toString("utf8")}`);
    console.log(
      "status: %s, body size: %d, headers: %j",
      res.statusCode,
      data.length,
      res.headers
    );

    responseParam.status(res.statusCode).json({
      responseCode: res.statusCode,
      message: data.toString("utf8"),
    });
  } catch (error) {
    console.log(error);
  }
});

function getPayload() {
  return `{
    "messageId": "TRX_${uuidv4()}",
    "messageType": "AUTH",
    "ts": "oFEEC777D7",
    "userId": null,
    "deviceId": null,
    "payloadData": {
      "passType": "2",
      "notifyMsgFlag": "0",
      "notifyMsgData": {
        "textToDisplay": "Authenticate your transaction"
      },
      "msgFlag": "0",
      "msgData": {
        "data": "zUvcArlRssvv+LVV4LEbQ96JYlZQJlePAQeBlAvlwnEfizffh/+HCCD5P/mJrxObk7JqTCH3vKApJzt63kJ+VT/x51jcmWI8PnEETTjxDSI3+vNWuu4qHzrggu8j+vxlgUSbIPUXYd6DztxJfu/yxixIZcb7g5KGhXyWdsyrQlfcIt7PNv/K6MqB8wS3tgTJRo24yZhsyN4kBa3uh8xPd+g1jA74pI/5/KcAZBJp4BfcQxM53wVKvWWEsAhc8o/SE4vWe5rzuw2dgjQIxJbM0QCTbOsiS4mC3qKbM2JEPF85g35l65LKuaWhugRFBzRb"
      }
    },
    "callbackUrl": "https://sistemadev.com/osp",
    "vseSign": "1",
    "appBundleId": "id.co.sistema.vkey"
  }`;
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
