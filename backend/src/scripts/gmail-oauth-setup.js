import "dotenv/config";
import { google } from "googleapis";
import http from "node:http";
import crypto from "node:crypto";
import { config } from "../config/config.js";

const CLIENT_ID = config.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = config.GOOGLE_CLIENT_SECRET;

const REDIRECT_URI = "http://localhost:53682/oauth2callback";
const SCOPES = ["https://mail.google.com/"];
// scopes -> application Google se kis type ki permission maang rahi hai.

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const state = crypto.randomBytes(24).toString("hex");
//OAuth mein state ek security check hai. Jab authorization request jaati hai, apan state bhejte hain. Callback aane par verify karte hain ki wahi state wapas aayi hai.

const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
  state,
});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);

  if (url.pathname !== "/oauth2callback") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  if (url.searchParams.get("state") !== state) {
    res.writeHead(403);
    res.end("Invalid OAuth state. Please retry.");
    server.close();
    return;
  }

  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");

  if (error || !code) {
    res.writeHead(400);
    res.end("Authorization was not completed. Check the terminal.");
    console.error("Google authorization was cancelled or failed.");
    server.close();
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      "<h2>Google authorization successful.</h2>" +
      "<p>You can close this tab and return to the terminal.</p>"
    );

    if (!tokens.refresh_token) {
      console.log(
        "No refresh token was returned. Revoke this app's Google access " +
        "and run the script again to request consent."
      );
    } else {
      console.log("\nGMAIL_REFRESH_TOKEN (copy it to backend .env):\n");
      console.log(tokens.refresh_token);
      console.log(
        "\nKeep this token secret. Do not share it or commit it to GitHub."
      );
    }
  } catch {
    res.writeHead(500);
    res.end("Token exchange failed. Check the terminal.");
    console.error(
      "OAuth token exchange failed. Verify client credentials and redirect URI."
    );
  } finally {
    server.close();
  }
});

server.on("error", (err) => {
  console.error("Local callback server failed:", err.message);
});

server.listen(53682, "localhost", () => {
  console.log("Open this URL in your browser to authorize Gmail:");
  console.log(authorizationUrl);
  console.log("\nWaiting for Google's callback...");
});


// full flow :-
// Script run hoti hai aur .env se configuration load hoti hai.
// Google OAuth client configure hota hai aur random state banti hai.
// Authorization URL terminal mein print hota hai; tu browser mein open karta hai.
// Tu Google par Gmail access approve karta hai.
// Google browser ko local callback server par redirect karta hai.
// Script path aur state verify karke authorization code ko tokens mein exchange karti hai.
// Refresh token mila toh terminal mein print hota hai; tu use local .env mein store karta hai.
// Script temporary server band kar deti hai.
