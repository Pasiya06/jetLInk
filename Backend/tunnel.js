// Starts the ngrok tunnel for the backend (no ngrok.exe needed).
// Usage: npm run tunnel   (keep `npm start` running in another window)
import dotenv from "dotenv";
import ngrok from "@ngrok/ngrok";

dotenv.config();

const PORT = process.env.PORT || 5001;
// Set NGROK_DOMAIN in .env to your own account's free static domain
const DOMAIN = process.env.NGROK_DOMAIN || "caffeinic-maximiliano-incidentless.ngrok-free.dev";

if (!process.env.NGROK_AUTHTOKEN) {
  console.error("NGROK_AUTHTOKEN is missing. Add it to Backend/.env");
  process.exit(1);
}

try {
  const listener = await ngrok.forward({
    addr: Number(PORT),
    domain: DOMAIN,
    authtoken_from_env: true,
  });
  console.log(`✅ Tunnel online: ${listener.url()} -> http://localhost:${PORT}`);
  console.log("Keep this window open. Press Ctrl+C to stop.");
  process.stdin.resume(); // keep the process alive
} catch (err) {
  console.error("❌ ngrok failed:", err.message || err);
  process.exit(1);
}
