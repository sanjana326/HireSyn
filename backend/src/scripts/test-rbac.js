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

async function run() {
  const superEmail = "superadmin@c2c.com";
  const superPass = "Super@123!";
  const adminEmail = "rbac_admin@test.com";
  const adminPass = "Admin@123!";

  const loginSuper = await requestJSON("POST", "/api/auth/login", { email: superEmail, password: superPass });
  console.log("Login superadmin:", loginSuper.status, loginSuper.json?.message);
  const superToken = loginSuper.json?.data?.token;
  if (!superToken) throw new Error("Superadmin login failed");

  const createAdmin = await requestJSON("POST", "/api/auth/create-admin", { name: "RBAC Admin", email: adminEmail, password: adminPass }, superToken);
  console.log("Create admin:", createAdmin.status, createAdmin.json?.message);
  const newAdminId = createAdmin.json?.data?.users_id;
  if (!newAdminId) throw new Error("Admin creation failed");

  const loginAdmin = await requestJSON("POST", "/api/auth/login", { email: adminEmail, password: adminPass });
  console.log("Login admin:", loginAdmin.status, loginAdmin.json?.message);
  const adminToken = loginAdmin.json?.data?.token;
  if (!adminToken) throw new Error("Admin login failed");

  const profilesSuper = await requestJSON("GET", "/api/auth/profiles", null, superToken);
  console.log("Profiles superadmin:", profilesSuper.status, Array.isArray(profilesSuper.json?.data) ? profilesSuper.json.data.length : 0);

  const profilesAdmin = await requestJSON("GET", "/api/auth/profiles", null, adminToken);
  console.log("Profiles admin:", profilesAdmin.status, Array.isArray(profilesAdmin.json?.data) ? profilesAdmin.json.data.length : 0);

  const adminCreateAdmin = await requestJSON("POST", "/api/auth/create-admin", { name: "Should Fail", email: "fail@test.com", password: adminPass }, adminToken);
  console.log("Admin create admin (expect 403):", adminCreateAdmin.status);

  const deleteAdmin = await requestJSON("DELETE", `/api/auth/delete-user/${newAdminId}`, null, superToken);
  console.log("Delete admin:", deleteAdmin.status, deleteAdmin.json?.message);

  const loginDeletedAdmin = await requestJSON("POST", "/api/auth/login", { email: adminEmail, password: adminPass });
  console.log("Login deleted admin (expect 400/403):", loginDeletedAdmin.status);

  const protectedNoToken = await requestJSON("GET", "/api/auth/profiles", null, null);
  console.log("Protected no token (expect 401):", protectedNoToken.status);
}

run().catch((e) => {
  console.error(e && e.message ? e.message : String(e));
  process.exit(1);
});
