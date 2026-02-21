const http = require("http");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

function requestJSON(method, urlPath, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = { "Content-Type": "application/json" };
    if (data) headers["Content-Length"] = Buffer.byteLength(data);
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const req = http.request(
      {
        hostname: "localhost",
        port: process.env.PORT ? Number(process.env.PORT) : 5000,
        path: urlPath,
        method,
        headers,
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
    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  const login = await requestJSON("POST", "/api/auth/login", { email: "superadmin@c2c.com", password: "Super@123!" });
  console.log("login:", login.status, login.json?.message);
  const token = login.json?.data?.token;
  if (!token) {
    console.log(JSON.stringify(login, null, 2));
    process.exit(0);
  }
  const uid = login.json?.data?.users_id;
  const ping1 = await requestJSON("GET", "/api/vendors/ping", null, null);
  console.log("ping:", ping1.status, ping1.json?.message || ping1.text);
  const ping2 = await requestJSON("GET", "/api/vendors/ping-direct", null, null);
  console.log("ping-direct:", ping2.status, ping2.json?.message || ping2.text);
  const create = await requestJSON("POST", "/api/vendors", {
    representative_name: "Rep A",
    organization_name: "Org A",
    contact: "9999999999",
    email: "vendor1@test.com",
    budget_type: "Both",
    handled_by: uid,
  }, token);
  console.log("create:", create.status, create.json?.message);
  const vid = create.json?.data?.vendor_id;
  const list = await requestJSON("GET", "/api/vendors?page=1&limit=5&search=Org", null, token);
  console.log("list:", list.status, list.json?.data?.total);
  const upd = await requestJSON("PUT", `/api/vendors/${vid}`, { contact: "8888888888" }, token);
  console.log("update:", upd.status, upd.json?.message);
  const get = await requestJSON("GET", `/api/vendors/${vid}`, null, token);
  console.log("get:", get.status, get.json?.data?.vendor_id);
  const del = await requestJSON("DELETE", `/api/vendors/${vid}`, null, token);
  console.log("delete:", del.status, del.json?.message);
  const get2 = await requestJSON("GET", `/api/vendors/${vid}`, null, token);
  console.log("get-deleted:", get2.status, get2.json?.message);
})(); 
