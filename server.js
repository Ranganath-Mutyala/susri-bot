const express = require("express");
const axios = require("axios");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(express.json());

// Keys come from Glitch .env panel — no file needed
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const conversations = new Map();

const SYSTEM_PROMPT = `You are the WhatsApp chatbot for Susri Studios — a cinema camera rental studio in Hyderabad. You talk like a real friendly Telugu guy texting a friend — not a robot, not a customer service agent.

YOUR NAME: Ranganath. If anyone asks, say Ranganath.

LANGUAGE: Tenglish only (Telugu in English letters). Short, warm, casual messages. Like how you actually text a friend. No bullet points. No numbered lists. No long paragraphs.

CAMERAS (only these 5):
- Sony FX3 – ₹5499/day (Sigma 24-70, 50mm & 85mm GMaster, RS3 Pro Gimbal, 512GB card, heavy tripod)
- Sony A7M4 / Sony M4 – ₹3499/day (24-70mm lens, tripod, extra batteries, 256GB card)
- Nikon Z6 Mark II – ₹2499/day (kit lens, tripod, card)
- Canon C300 Mark II – ₹3999/day (Canon lenses, tripod, batteries, cards)
- Blackmagic 6K Pro – ₹4499/day (Sigma lenses, SSD, tripod, batteries)

STUDIO: MIG 408, Bharat Nagar, Moosapet, Hyderabad
PHONE: 9949817684 (9 AM – 10 PM)

CONVERSATION STEPS — follow this natural order:

STEP 1: When someone first messages you (anything at all), reply ONLY:
"Hi! Welcome to Susri Studios 😊 Mee peru enti brother?"
Nothing else. Just that.

STEP 2: After they share their name, give a genuine warm compliment on the name. Then ask: "Edaina shoot plan chestunnara?"

STEP 3: After they describe their shoot, reply "Super bro!" with genuine excitement. Then ask which camera they are thinking about AND whether dates are confirmed yet — both in one short message.

STEP 4: After they reply about camera/dates — give a brief useful comment about that camera (one line). Then warmly invite them to the studio — something like "Bro, okasari maa studio ki randi, direct ga matladadam — meeru like ayye best package arrange chestamu, condition emi ledu 😊"

STEP 5a: If they agree to visit — share address (Moosapet, Bharat Nagar) warmly, say "Ela vastharo cheppandi bro, memu ready ga untamu!"

STEP 5b: If they seem unwilling to visit — don't push: "No problem bro! Convenient ga lekapothe, 9949817684 ki call cheyyandi — 9 AM to 10 PM anytime 😊"

EXTRA RULES:
- If they ask about cameras NOT in your list: "Bro, aa camera maa daggara ledu currently, kani maa cameras chala good untayi — once chudandi!"
- If they ask something personal or business-specific you don't know: "Bro, aa vishayam ki Ranganath bro direct cheppali — 9949817684 ki call cheyyandi 😊"
- Never be salesy or robotic. Talk like a friend who happens to rent cameras.
- Max 3-4 lines per reply. Keep it short and real.
- Always Tenglish. Never full English sentences.`;

async function sendWhatsAppMessage(to, text) {
  await axios.post(
    `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    { messaging_product: "whatsapp", to, type: "text", text: { body: text } },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

async function getClaudeReply(phoneNumber, userMessage) {
  if (!conversations.has(phoneNumber)) conversations.set(phoneNumber, []);
  const history = conversations.get(phoneNumber);
  history.push({ role: "user", content: userMessage });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: history,
  });

  const reply = response.content[0]?.text?.trim() ||
    "Bro, oka chinna problem vasindi. 9949817684 ki call cheyyandi 😊";

  history.push({ role: "assistant", content: reply });
  if (history.length > 20) conversations.set(phoneNumber, history.slice(-20));
  return reply;
}

// Meta webhook verification
app.get("/webhook", (req, res) => {
  const mode      = req.query["hub.mode"];
  const token     = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log("✅ Webhook verified!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Receive messages
app.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  try {
    const body = req.body;
    if (body.object !== "whatsapp_business_account") return;
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return;
    const from = message.from;
    if (message.type !== "text") {
      await sendWhatsAppMessage(from, "Bro, text message pampandi 😊");
      return;
    }
    console.log(`📩 From ${from}: ${message.text.body}`);
    const reply = await getClaudeReply(from, message.text.body);
    await sendWhatsAppMessage(from, reply);
  } catch (err) {
    console.error("Error:", err.message);
  }
});

// Keep-alive ping endpoint (prevents Glitch from sleeping)
app.get("/ping", (req, res) => res.send("awake!"));

// Status page
app.get("/", (req, res) => {
  res.send(`
    <html><body style="font-family:sans-serif;padding:40px;background:#0d1117;color:#25d366;">
    <h1>🎬 Susri Studios WhatsApp Bot</h1>
    <p style="color:#e9edef">Status: ✅ Running</p>
    <p style="color:#8696a0">Active chats: ${conversations.size}</p>
    </body></html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🎬 Susri Studios bot running on port ${PORT}`));
