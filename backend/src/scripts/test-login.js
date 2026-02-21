const http = require("http");

function postJson(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: "localhost",
        port: process.env.PORT ? Number(process.env.PORT) : 5000,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let chunks = "";
        res.on("data", (c) => (chunks += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, json: JSON.parse(chunks) });
          } catch {
            resolve({ status: res.statusCode, text: chunks });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  const email = (process.argv[2] || "admin@c2c.com").trim().toLowerCase();
  const password = (process.argv[3] || "Admin@123").trim();
  const result = await postJson("/api/auth/login", { email, password });
  console.log(JSON.stringify(result, null, 2));
})().catch((e) => {
  console.error(e && e.message ? e.message : String(e));
  process.exit(1);
});
