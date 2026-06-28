const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Resend } = require('resend');

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());

// Serve static assets from the root directory
app.use(express.static(path.join(__dirname)));

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Successfully initialized Supabase client.');
} else {
  console.warn('Warning: SUPABASE_URL or SUPABASE_KEY is missing in .env. Form submissions will fail.');
}

// Read the Dholera Knowledge Base on startup
const kbPath = path.join(__dirname, 'dholera_kb.txt');
let kbContent = '';
let kbChunks = [];

const geminiApiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (geminiApiKey && geminiApiKey !== "your_gemini_api_key_here") {
  genAI = new GoogleGenerativeAI(geminiApiKey);
}

// Cosine similarity helper function
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Load and embed Knowledge Base on startup
(async () => {
  try {
    if (fs.existsSync(kbPath)) {
      kbContent = fs.readFileSync(kbPath, 'utf8');
      console.log('Successfully loaded Dholera Knowledge Base file.');
      
      if (genAI) {
        console.log('Chunking and embedding Knowledge Base for RAG...');
        // Split text into meaningful paragraphs
        const rawChunks = kbContent.split(/\n\s*\n/).map(c => c.trim()).filter(c => c.length > 50);
        const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
        
        for (const chunk of rawChunks) {
          try {
            const result = await embedModel.embedContent(chunk);
            kbChunks.push({
              text: chunk,
              embedding: result.embedding.values
            });
          } catch (e) {
            console.error("Failed to embed chunk:", e);
          }
        }
        console.log(`Successfully embedded ${kbChunks.length} chunks. In-memory RAG Pipeline Ready.`);
      }
    } else {
      console.warn('Warning: dholera_kb.txt not found. Chatbot will run with empty context.');
    }
  } catch (err) {
    console.error('Error loading/embedding Dholera Knowledge Base:', err);
  }
})();

// Route for serving the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Secure API endpoint for chatbot communication
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message parameter is required." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.log("Gemini API key is not configured. Simulating mock response.");
    return res.json({
      reply: "We are currently preparing our secure investment terminal. Please configure the GEMINI_API_KEY environment variable to activate real-time AI consulting, or contact our team directly at +91 90000 00000."
    });
  }

  try {
    if (!genAI) {
      genAI = new GoogleGenerativeAI(apiKey);
    }
    
    // RAG Retrieval Step
    let retrievedContext = "";
    if (kbChunks.length > 0) {
      try {
        const embedModel = genAI.getGenerativeModel({ model: "embedding-001" });
        const queryEmbedding = await embedModel.embedContent(message);
        const qVec = queryEmbedding.embedding.values;
        
        // Calculate similarity for all chunks
        const scoredChunks = kbChunks.map(chunk => ({
          text: chunk.text,
          score: cosineSimilarity(qVec, chunk.embedding)
        }));
        
        // Sort by highest score first and pick top 5
        scoredChunks.sort((a, b) => b.score - a.score);
        const topChunks = scoredChunks.slice(0, 5).map(c => c.text);
        
        retrievedContext = topChunks.join('\n\n');
      } catch(e) {
        console.error("Retrieval error, falling back to full context:", e);
        retrievedContext = kbContent; 
      }
    } else {
      retrievedContext = kbContent; // Fallback if RAG didn't init correctly
    }

    const dynamicSystemInstruction = `
You are the Signature Investment Officer for LRK Developers, representing our flagship project LRK Vistara.
Your tone must be elegant, professional, calm, trustworthy, and consultative. Avoid slang, emojis (use extremely sparingly if at all), or hype.

Below is the most relevant retrieved context from the official knowledge base for LRK Developers, Dholera SIR, regional timelines, and news:
--------------------------------------------------------------------------------
${retrievedContext}
--------------------------------------------------------------------------------

GUARDRAILS & FOCUS POLICY:
1. ONLY answer questions about Dholera SIR, LRK Developers, and the LRK Vistara project.
2. If an investor asks about unrelated subjects (e.g., general coding, cooking, personal advice, unrelated cities like Mumbai, Delhi, or Dubai without comparative investment context), you MUST politely decline and steer them back to Dholera SIR and LRK Vistara signature plots.
   Example response: "As a Signature Investment Officer for LRK Developers, my expertise is focused exclusively on Dholera SIR and the LRK Vistara signature plots. May I provide you details on our Expressway proximity or the upcoming Tata chip fab timeline?"
3. Never fabricate figures. If the answer is not in the knowledge base, state that the data is undergoing legal review and offer to connect them with a Signature Investment Officer.
4. FORMATTING & BREVITY: Investors are busy. Keep your answers EXTREMELY short, punchy, and highly scannable (maximum 3-4 sentences). Use bullet points for lists. DO NOT write long paragraphs. Get straight to the value.
`;
    
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      systemInstruction: dynamicSystemInstruction
    });

    let chatSession;
    if (history && Array.isArray(history) && history.length > 0) {
      // Map frontend chat history format to the Gemini SDK format
      // Frontend: [{ text: "...", sender: "user" | "consultant" }]
      // Gemini: [{ role: "user" | "model", parts: [{ text: "..." }] }]
      const geminiHistory = history.map(h => ({
        role: h.sender === 'consultant' ? 'model' : 'user',
        parts: [{ text: h.text }]
      }));
      
      chatSession = model.startChat({
        history: geminiHistory
      });
    } else {
      chatSession = model.startChat();
    }

    const result = await chatSession.sendMessage(message);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: "Failed to communicate with AI model.",
      details: error.message
    });
  }
});

// Secure API endpoint for form submissions
app.post('/api/submit-lead', async (req, res) => {
  const { type, name, phone, email, interest, message, visit_date } = req.body;

  if (!type) {
    return res.status(400).json({ error: "Lead type is required." });
  }

  try {
    if (!supabase) {
      return res.status(500).json({ error: "Supabase client is not configured." });
    }

    const { data, error } = await supabase
      .from('leads')
      .insert([
        { type, name, phone, email, interest, message, visit_date }
      ])
      .select();

    if (error) throw error;

    console.log(`New lead submitted (Type: ${type})`);

    // Send Email Notification via Resend
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key_here') {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'LRK Developers <onboarding@resend.dev>',
          to: ['investment@lrkdevelopers.com', 'lalit.gupta1703@gmail.com'],
          subject: `New Lead: ${type.toUpperCase()} from ${name}`,
          html: `
            <h2>New Investor Lead Received</h2>
            <p><strong>Type:</strong> ${type}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Email:</strong> ${email || 'N/A'}</p>
            <p><strong>Interest:</strong> ${interest || 'N/A'}</p>
            <p><strong>Message/Date:</strong> ${message || visit_date || 'N/A'}</p>
          `
        });
        console.log('Notification email sent to sales team.');
      } catch (emailErr) {
        console.error('Failed to send email notification:', emailErr);
      }
    } else {
      console.log('RESEND_API_KEY missing. Skipping email notification.');
    }

    res.status(201).json({ success: true, id: data[0]?.id });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Failed to save lead.", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`LRK Vistara Platform Running on: http://localhost:${PORT}`);
    console.log(`================================================================`);
  });
}

// Export for Vercel Serverless
module.exports = app;
