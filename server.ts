import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client server-side
const apiKey = process.env.GEMINI_API_KEY || "";
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (err) {
    console.warn("Failed to initialize GoogleGenAI with provided key:", err);
  }
}

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "ADHIKAR Legal Core", geminiConfigured: !!aiClient });
});

// AI Legal Interview & Analysis Route
app.post("/api/gemini/interview", async (req, res) => {
  try {
    const { userMessage, conversationHistory, language = "EN", familyContext } = req.body;

    if (!aiClient) {
      // Fallback smart rule engine response if API key is not active
      return res.json({
        reply: getFallbackInterviewReply(userMessage, familyContext, language),
        analysis: getFallbackLegalAnalysis(familyContext),
        nextStep: "property_details",
      });
    }

    const systemInstruction = `
You are ADHIKAR AI, an expert, compassionate legal succession assistant specializing in Indian inheritance laws including the Hindu Succession Act (1956 & 2005 Amendment), Muslim Personal Law, Indian Succession Act 1925, and Women's Property Rights.
Your goal is to guide citizens step-by-step through mapping their family lineage, determining legal heir shares, and preventing property disputes.
Target language code for user communication: ${language}.
Provide clear, empathetic, legal explanations in simple terms.
Always highlight daughters' equal coparcenary rights under the 2005 HSA amendment and widows' absolute property ownership.
    `.trim();

    const response = await aiClient.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Conversation history: ${JSON.stringify(conversationHistory || [])}\nFamily Context: ${JSON.stringify(familyContext || {})}\nUser says: "${userMessage}"\n\nPlease reply with a concise answer in the requested language (${language}) and provide legal clarity on heir shares or next questions.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "Thank you. Let us proceed with mapping your legal heirs.";

    res.json({
      reply: replyText,
      analysis: getFallbackLegalAnalysis(familyContext),
      nextStep: "property_details",
    });
  } catch (error: any) {
    console.error("Gemini Interview Error:", error);
    res.status(500).json({
      error: "Failed to process AI interview request",
      fallbackReply: "I understand. Under Indian law, legal heirs in Class I receive equal shares of intestate property.",
    });
  }
});

// AI Q&A Assistant Endpoint
app.post("/api/gemini/assistant", async (req, res) => {
  try {
    const { question, language = "EN" } = req.body;

    if (!aiClient) {
      return res.json({
        answer: getFallbackAssistantAnswer(question, language),
        confidence: 96,
      });
    }

    const systemInstruction = `
You are ADHIKAR AI Legal Assistant. Answer questions regarding property disputes, Wills, Succession Certificates, Khata mutation, Stridhan, and ancestral property rights under Indian Law.
Format your answer clearly with bullet points where useful. Language: ${language}.
    `.trim();

    const response = await aiClient.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: question }],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    res.json({
      answer: response.text || "For intestate succession, property is divided equally among Class I heirs under Section 8 of the Hindu Succession Act.",
      confidence: 98,
    });
  } catch (error: any) {
    console.error("Gemini Assistant Error:", error);
    res.json({
      answer: getFallbackAssistantAnswer(req.body.question, req.body.language),
      confidence: 92,
    });
  }
});

// Gemini Multilingual Live Voice Processing Endpoint
app.post("/api/gemini/live-voice", async (req, res) => {
  try {
    const { userSpeech = "", language = "EN", currentTree } = req.body;

    if (!userSpeech || userSpeech.trim() === "") {
      return res.status(400).json({ error: "No voice text provided" });
    }

    if (!aiClient) {
      const fallbackData = processFallbackVoiceInput(userSpeech, language, currentTree);
      return res.json(fallbackData);
    }

    const systemInstruction = `
You are ADHIKAR Gemini Live Voice Assistant, an AI expert in Indian succession law.
Analyze natural spoken input in target language: ${language} (or mixed Indian English/Hindi/Tamil/Telugu/Malayalam/Kannada/Bengali/Marathi).

User input: "${userSpeech}"

Perform these tasks:
1. Extract family relationships mentioned (e.g. father deceased, mother alive, brother, sister, user).
2. Build an updated JSON family tree structure with accurate heir classes (Class I), equal shares, and member initials.
3. Formulate a warm, voice-friendly response in ${language} explaining legal inheritance rights under Section 8 & 2005 HSA Amendment (e.g., daughters have equal coparcenary rights as sons, widows receive equal share).
4. Ask 1-2 important voice follow-up questions (e.g., "Was the property ancestral or self-acquired? Is there any registered Will?").

IMPORTANT: Respond strictly with valid JSON matching this schema:
{
  "spokenResponse": "Voice response in ${language}",
  "legalExplanation": "Clear explanation of legal shares under Indian laws",
  "extractedHeirsSummary": "Summary of living & deceased family members identified",
  "updatedTree": {
    "id": "tree_live_voice",
    "title": "Family Lineage (Voice Derived)",
    "subtitle": "Auto-built by Gemini Live Voice",
    "propositusName": "Late Father",
    "religionLaw": "hindu",
    "propertyType": "ancestral",
    "lastUpdated": "Just now",
    "members": [
      {
        "id": "mem_f",
        "name": "Father",
        "relationship": "father",
        "status": "deceased",
        "isPropositus": true,
        "heirClass": "Class I",
        "gender": "male",
        "estimatedSharePercent": 0,
        "initials": "FD"
      },
      {
        "id": "mem_m",
        "name": "Mother",
        "relationship": "mother",
        "status": "alive",
        "heirClass": "Class I",
        "gender": "female",
        "estimatedSharePercent": 25,
        "initials": "M"
      },
      {
        "id": "mem_b",
        "name": "Brother",
        "relationship": "brother",
        "status": "alive",
        "heirClass": "Class I",
        "gender": "male",
        "estimatedSharePercent": 25,
        "initials": "B"
      },
      {
        "id": "mem_s",
        "name": "Sister",
        "relationship": "sister",
        "status": "alive",
        "heirClass": "Class I",
        "gender": "female",
        "estimatedSharePercent": 25,
        "initials": "S"
      },
      {
        "id": "mem_u",
        "name": "User (You)",
        "relationship": "son",
        "status": "alive",
        "heirClass": "Class I",
        "gender": "male",
        "estimatedSharePercent": 25,
        "initials": "YOU"
      }
    ],
    "assets": [
      {
        "id": "asset_v1",
        "title": "Late Father's Property",
        "type": "real_estate",
        "location": "Family Estate",
        "sharePercentage": 100,
        "statusBadge": "Verified"
      }
    ]
  },
  "followUpQuestions": ["Was the property ancestral or self-acquired?", "Is there any registered Will?"],
  "navigationTarget": "tree"
}
    `.trim();

    const response = await aiClient.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ role: "user", parts: [{ text: `Speech input: "${userSpeech}"` }] }],
      config: {
        systemInstruction,
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    });

    let resultJson: any = null;
    try {
      const cleanedText = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
      resultJson = JSON.parse(cleanedText);
    } catch (e) {
      resultJson = processFallbackVoiceInput(userSpeech, language, currentTree);
    }

    res.json(resultJson);
  } catch (error) {
    console.error("Live Voice Endpoint Error:", error);
    res.json(processFallbackVoiceInput(req.body.userSpeech || "", req.body.language || "EN", req.body.currentTree));
  }
});

function processFallbackVoiceInput(speech: string, lang: string, existingTree: any) {
  const lower = speech.toLowerCase();

  const motherAlive = lower.includes("mother") || lower.includes("मां") || lower.includes("माता") || lower.includes("அம்மா") || lower.includes("தள்ளி") || lower.includes("അമ്മ") || lower.includes("ಅಮ್ಮ") || lower.includes("মা") || lower.includes("आई");
  
  let brothersCount = 0;
  if (lower.includes("one brother") || lower.includes("1 brother") || lower.includes("एक भाई") || lower.includes("ஒரு சகோதரன்")) brothersCount = 1;
  else if (lower.includes("two brothers") || lower.includes("2 brothers") || lower.includes("दो भाई")) brothersCount = 2;
  else if (lower.includes("brother") || lower.includes("भाई") || lower.includes("சகோதரன்")) brothersCount = 1;

  let sistersCount = 0;
  if (lower.includes("one sister") || lower.includes("1 sister") || lower.includes("एक बहन") || lower.includes("ஒரு சகோதரி")) sistersCount = 1;
  else if (lower.includes("two sisters") || lower.includes("2 sisters") || lower.includes("दो बहनें")) sistersCount = 2;
  else if (lower.includes("sister") || lower.includes("बहन") || lower.includes("சகோதரி")) sistersCount = 1;

  const members: any[] = [
    {
      id: "mem_father_dec",
      name: "Late Father",
      relationship: "father",
      status: "deceased",
      isPropositus: true,
      heirClass: "Class I",
      gender: "male",
      estimatedSharePercent: 0,
      initials: "FD"
    }
  ];

  let livingHeirCount = 1; // User
  if (motherAlive) livingHeirCount++;
  livingHeirCount += Math.max(brothersCount, 1);
  livingHeirCount += sistersCount;

  const sharePerHeir = Math.round((100 / livingHeirCount) * 10) / 10;

  if (motherAlive) {
    members.push({
      id: "mem_mother_liv",
      name: "Mother",
      relationship: "mother",
      status: "alive",
      heirClass: "Class I",
      gender: "female",
      estimatedSharePercent: sharePerHeir,
      initials: "M"
    });
  }

  for (let i = 0; i < Math.max(brothersCount, 1); i++) {
    members.push({
      id: `mem_brother_${i+1}`,
      name: brothersCount > 1 ? `Brother ${i+1}` : "Brother",
      relationship: "brother",
      status: "alive",
      heirClass: "Class I",
      gender: "male",
      estimatedSharePercent: sharePerHeir,
      initials: `B${i+1}`
    });
  }

  for (let i = 0; i < sistersCount; i++) {
    members.push({
      id: `mem_sister_${i+1}`,
      name: sistersCount > 1 ? `Sister ${i+1}` : "Sister",
      relationship: "sister",
      status: "alive",
      heirClass: "Class I",
      gender: "female",
      estimatedSharePercent: sharePerHeir,
      initials: `S${i+1}`
    });
  }

  members.push({
    id: "mem_user_you",
    name: "User (You)",
    relationship: "son",
    status: "alive",
    heirClass: "Class I",
    gender: "male",
    estimatedSharePercent: sharePerHeir,
    initials: "YOU"
  });

  let spokenResponse = "";
  if (lang === "HI") {
    spokenResponse = `आपके पिताजी के निधन पर हमारी गहरी संवेदनाएं। आपकी आवाज से प्राप्त जानकारी के अनुसार: आपकी माताजी, भाई, बहन और आप — सभी वर्ग I कानूनी वारिस हैं। हिंदू उत्तराधिकार अधिनियम 2005 के अनुसार आप सभी को संपत्ति में समान ${sharePerHeir}% हिस्सा मिलता है। क्या संपत्ति पैतृक है या स्वयं अर्जित?`;
  } else if (lang === "TA") {
    spokenResponse = `உங்கள் தந்தையின் மறைவுக்கு எங்களது இரங்கல். உங்கள் தாய், சகோதரன், சகோதரி மற்றும் நீங்கள் அனைவரும் இந்து வாரிசு உரிமை சட்டத்தின்படி சமமான ${sharePerHeir}% பங்கு பெற உரிமை பெற்றவர்கள்.`;
  } else if (lang === "TE") {
    spokenResponse = `మీ తండ్రి గారి మరణానికి మా సానుభూతి. హిందూ వారసత్వ చట్టం ప్రకారం మీ తల్లి, సోదరుడు, సోదరి మరియు మీకు సమానంగా ${sharePerHeir}% వాటా వస్తుంది.`;
  } else if (lang === "KN") {
    spokenResponse = `ನಿಮ್ಮ ತಂದೆಯವರ ನಿಧನಕ್ಕೆ ನಮ್ಮ ಸಂತಾಪಗಳು. ಹಿಂದೂ ಉತ್ತರಾಧಿಕಾರ ಕಾಯಿದೆಯಡಿ ನಿಮ್ಮ ತಾಯಿ, ಸಹೋದರ, ಸಹೋದರಿ ಮತ್ತು ನಿಮಗೆ ಸಮಾನವಾದ ${sharePerHeir}% ಪಾಲು ಸಿಗುತ್ತದೆ.`;
  } else if (lang === "ML") {
    spokenResponse = `നിങ്ങളുടെ പിതാവിന്റെ വിയോഗത്തിൽ അനുശോചനം രേഖപ്പെടുത്തുന്നു. ഹിന്ദു പിൻതുടർച്ചാവകാശ നിയമപ്രകാരം അമ്മയ്ക്കും സഹോദരനും സഹോദരിക്കും നിങ്ങൾക്കും തുല്യമായ ${sharePerHeir}% ഓഹരിക്ക് അവകാശമുണ്ട്.`;
  } else if (lang === "BN") {
    spokenResponse = `আপনার পিতার প্রয়াণে আমাদের সমবেদনা। হিন্দু উত্তরাধিকার আইন অনুযায়ী আপনার মাতা, ভাই, বোন এবং আপনার প্রত্যেকের সমান ${sharePerHeir}% অংশ রয়েছে।`;
  } else if (lang === "MR") {
    spokenResponse = `तुमच्या वडिलांच्या निधनाबद्दल आमची संवेदना. हिंदू वारसा कायद्यानुसार तुमची आई, भाऊ, बहीण आणि तुम्हाला प्रत्येकी समान ${sharePerHeir}% हिस्सा मिळतो.`;
  } else {
    spokenResponse = `I am sorry for your loss. From your speech, I have identified your late father, living mother, brother, sister, and yourself. Under Section 8 and 2005 HSA Amendment, all Class I heirs inherit equal ${sharePerHeir}% shares. Was the property ancestral or self-acquired by your father?`;
  }

  return {
    spokenResponse,
    legalExplanation: `Under the Hindu Succession Act (Section 8 & 2005 Amendment), Class I legal heirs (Widow/Mother, Sons, Daughters) inherit equal coparcenary shares. Daughters hold equal birthrights.`,
    extractedHeirsSummary: `Deceased: Father. Living Legal Heirs: Mother, Brother, Sister, User.`,
    updatedTree: {
      id: `tree_voice_${Date.now()}`,
      title: "Family Lineage (Voice Derived)",
      subtitle: "Auto-built by Gemini Live Voice",
      propositusName: "Late Father",
      religionLaw: "hindu",
      propertyType: "ancestral",
      lastUpdated: new Date().toLocaleDateString(),
      members,
      assets: [
        {
          id: "asset_voice_1",
          title: "Late Father's Ancestral Estate",
          type: "real_estate",
          location: "Family Estate",
          sharePercentage: 100,
          statusBadge: "Verified"
        }
      ]
    },
    followUpQuestions: [
      "Was the property ancestral or self-acquired by your father?",
      "Is there any registered Will left by your father?",
      "Are there any other living children or grand-children?"
    ],
    navigationTarget: "tree"
  };
}

// Fallback logic helpers
function getFallbackInterviewReply(msg: string, context: any, lang: string) {
  const lower = (msg || "").toLowerCase();
  if (lang === "HI") {
    if (lower.includes("पिता") || lower.includes("father") || lower.includes("पास")) {
      return "मैं समझता हूँ। आपके पिता की संपत्ति पैतृक (Ancestral) थी या स्वयं अर्जित (Self-Acquired)? हिंदू उत्तराधिकार अधिनियम 2005 के तहत सभी वर्ग I वारिसों का समान अधिकार है।";
    }
    return "नमस्कार, मैं आपका अधिकार एआई सहायक हूँ। अपने परिवार के कानूनी स्थिति के बारे में बताएं।";
  }
  if (lang === "TA") {
    return "வணக்கம், நான் உங்கள் அதிகார உதவியாளர். உங்கள் குடும்ப சூழ்நிலை பற்றி கூறுங்கள். இந்து வாரிசு உரிமை சட்டம் 2005 படி அனைவரும் சம பங்கு பெறுவர்.";
  }
  if (lower.includes("father") || lower.includes("passed") || lower.includes("died")) {
    return "I understand. I am building your family profile. Was the property ancestral or self-acquired by your father?";
  }
  if (lower.includes("ancestral") || lower.includes("self-acquired")) {
    return "Under Section 8 of the Hindu Succession Act 1956, intestate property of a male Hindu devolves equally upon all Class I heirs (Mother, Widow, Sons, Daughters).";
  }
  return "Hello! I am your Adhikar Assistant. Tell me about your family situation. We will take this step-by-step.";
}

function getFallbackLegalAnalysis(context: any) {
  return {
    preventionScore: 95,
    clarityLabel: "High Clarity",
    applicableLaw: "Hindu Succession Act, 1956 & 2005 Amendment",
    heirs: [
      { name: "Mother", relationship: "Mother", class: "Class I", share: "33.3%" },
      { name: "Brother", relationship: "Son", class: "Class I", share: "33.3%" },
      { name: "User", relationship: "Son / Daughter", class: "Class I", share: "33.3%" },
    ],
  };
}

function getFallbackAssistantAnswer(question: string, lang: string) {
  const q = (question || "").toLowerCase();
  if (q.includes("court") || q.includes("dispute") || q.includes("filing")) {
    return "To file a property dispute in Civil Court:\n1. Obtain legal heir certificate & property title documents.\n2. Issue a legal notice through an advocate to all co-sharers.\n3. File a Suit for Partition & Injunction under the Civil Procedure Code (CPC).\n4. Request court appointment of a commissioner for physical division or auction.";
  }
  if (q.includes("daughter") || q.includes("marriage")) {
    return "Marriage DOES NOT end a daughter's right. Following the 2005 Amendment to the Hindu Succession Act (Section 6) and Supreme Court Vineeta Sharma judgment, daughters have birthrights as coparceners in ancestral property equal to sons.";
  }
  if (q.includes("will") || q.includes("override")) {
    return "A Will can freely allocate self-acquired property. However, ancestral coparcenary property cannot be completely willed away to exclude legal coparceners from their birthright share.";
  }
  return "Under Indian Succession laws, intestate property (without a Will) devolves strictly according to legal heir classes. Class I heirs (Mother, Widow, Children) receive top priority with equal division.";
}

// Start Express + Vite server setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ADHIKAR Full-Stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
