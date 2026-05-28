const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const dataDir = path.join(root, "data");
const classesFile = path.join(dataDir, "classes.json");
const callbacksFile = path.join(dataDir, "callbacks.json");
const port = process.env.PORT || 8080;

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

for (const file of [classesFile, callbacksFile]) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "[]", "utf8");
  }
}

function readJsonList(file) {
  try {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJsonList(file, items) {
  fs.writeFileSync(file, JSON.stringify(items, null, 2), "utf8");
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body is too large"));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  response.end(body);
}

function contentType(filePath) {
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml"
  };
  return types[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function normalizeSubjects(value) {
  return String(value || "")
    .split(",")
    .map((subject) => subject.trim())
    .filter(Boolean)
    .join(", ");
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (url.pathname === "/api/classes" && request.method === "GET") {
      sendJson(response, 200, readJsonList(classesFile));
      return;
    }

    if (url.pathname === "/api/classes" && request.method === "POST") {
      const incoming = JSON.parse(await readBody(request));
      if (!incoming.name || !incoming.city || !incoming.phone) {
        sendJson(response, 400, { message: "Class name, city, and phone number are required." });
        return;
      }

      const saved = {
        id: Date.now(),
        name: String(incoming.name),
        owner: String(incoming.owner || ""),
        city: String(incoming.city),
        locality: String(incoming.locality || ""),
        subjects: normalizeSubjects(incoming.subjects),
        level: String(incoming.level || ""),
        fee: Number(incoming.fee || 0),
        phone: String(incoming.phone),
        address: String(incoming.address || ""),
        nextBatch: String(incoming.nextBatch || ""),
        scholarship: Boolean(incoming.scholarship),
        hostel: Boolean(incoming.hostel),
        girlsSafe: Boolean(incoming.girlsSafe),
        createdAt: new Date().toISOString()
      };

      const classes = readJsonList(classesFile);
      classes.push(saved);
      writeJsonList(classesFile, classes);
      sendJson(response, 201, saved);
      return;
    }

    if (url.pathname === "/api/callbacks" && request.method === "GET") {
      sendJson(response, 200, readJsonList(callbacksFile));
      return;
    }

    if (url.pathname === "/api/callbacks" && request.method === "POST") {
      const incoming = JSON.parse(await readBody(request));
      if (!incoming.name || !incoming.phone || !incoming.need) {
        sendJson(response, 400, { message: "Name, phone number, and support need are required." });
        return;
      }

      const saved = {
        id: Date.now(),
        name: String(incoming.name),
        phone: String(incoming.phone),
        need: String(incoming.need),
        status: "new",
        createdAt: new Date().toISOString()
      };

      const callbacks = readJsonList(callbacksFile);
      callbacks.push(saved);
      writeJsonList(callbacksFile, callbacks);
      sendJson(response, 201, saved);
      return;
    }

    const requestedPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
    const filePath = path.resolve(root, `.${requestedPath}`);

    if (!filePath.startsWith(root) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "Content-Type": contentType(filePath) });
    fs.createReadStream(filePath).pipe(response);
  } catch (error) {
    sendJson(response, 500, { message: error.message || "Server error" });
  }
});

server.listen(port, () => {
  console.log(`RightLearn is running on http://localhost:${port}`);
});
