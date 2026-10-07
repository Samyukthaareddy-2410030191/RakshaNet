import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'rakshanet-ai-sovereign-national-secret-key-2026';

app.use(express.json({ limit: '10mb' }));

// Base64Url helpers for standard RFC 7519 JWT
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

function generateJwt(payload: Record<string, any>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 3600, // 24 hours validity
      iss: 'rakshanet-auth-service',
    })
  );
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJwt(token: string): { valid: boolean; payload?: any; error?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false, error: 'Malformed token structure' };
    const [header, payload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    if (signature !== expectedSig) return { valid: false, error: 'Invalid cryptographic signature' };
    const parsedPayload = JSON.parse(base64UrlDecode(payload));
    if (parsedPayload.exp && parsedPayload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, error: 'Token expired' };
    }
    return { valid: true, payload: parsedPayload };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Verification failure' };
  }
}

// In-memory Volunteer & Helper Intercom Messages
const LIVE_INTERCOM_MESSAGES = [
  {
    id: 'msg-01',
    channel: '#volunteers-and-helpers',
    senderId: 'vol-01',
    senderName: 'Kiran Kumar (NDRF Wing)',
    senderRole: 'VOLUNTEER',
    senderBadge: 'NDRF-VOL-HYD-409',
    text: 'Sector 4 Nadeem Colony: 4 rubber rafts deployed. Reached rooftop at Plot 44. Rescued family of 6.',
    timestamp: '10:42 AM',
    isUrgent: false,
    location: { lat: 17.3985, lng: 78.4068 },
  },
  {
    id: 'msg-02',
    channel: '#volunteers-and-helpers',
    senderId: 'disp-01',
    senderName: 'Insp. Anita Rao (Central Dispatch)',
    senderRole: 'COORDINATOR',
    senderBadge: 'HYD-DISP-08',
    text: 'Copy that Kiran. 108-ALS-Delta 01 is staging on PVNR exit 4 to receive elderly casualty. Do not route through Chaderghat causeway.',
    timestamp: '10:44 AM',
    isUrgent: true,
  },
  {
    id: 'msg-03',
    channel: '#hospital-triage',
    senderId: 'hosp-sup-01',
    senderName: 'Dr. S. K. Narayana (Osmania Hospital)',
    senderRole: 'HOSPITAL',
    senderBadge: 'OGH-TRAUMA-DIR',
    text: 'ATTENTION DISPATCH: Osmania Trauma ER has reached 94% occupancy. Requesting immediate automated diversion of all incoming P1 trauma to Gandhi Hospital!',
    timestamp: '10:46 AM',
    isUrgent: true,
  },
  {
    id: 'msg-04',
    channel: '#volunteers-and-helpers',
    senderId: 'vol-02',
    senderName: 'Priya Sharma (St. John Ambulance)',
    senderRole: 'VOLUNTEER',
    senderBadge: 'SJA-EMT-882',
    text: 'Masab Tank Relief Hub setup completed. 1,200 drinking water packets and 50 ORS boxes ready for field distribution.',
    timestamp: '10:48 AM',
    isUrgent: false,
  },
];

// Initialize Gemini if key is provided
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// -------------------------------------------------------------
// Authentication & RBAC Service (JWT HS256)
// -------------------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, role, demoUser } = req.body;

  // Pre-configured role profiles for testing & operations
  const roleProfiles: Record<string, any> = {
    ADMIN: {
      id: 'usr-admin-01',
      name: 'Dr. Rajesh Varma',
      email: 'rajesh.varma@ndrf.gov.in',
      role: 'ADMIN',
      badgeId: 'NDRF-NAT-DIR-001',
      department: 'National Disaster Response Force (NDRF) Command HQ',
      phone: '+91 94401 22334',
    },
    COORDINATOR: {
      id: 'usr-coord-01',
      name: 'Inspector Anita Rao',
      email: 'anita.rao@ghmc.gov.in',
      role: 'COORDINATOR',
      badgeId: 'GHMC-DISP-CENTRAL-08',
      department: 'GHMC HYDRAA Disaster Dispatch Operations',
      phone: '+91 98490 11223',
    },
    HOSPITAL: {
      id: 'usr-hosp-01',
      name: 'Dr. S. K. Narayana',
      email: 'sk.narayana@osmania.telangana.gov.in',
      role: 'HOSPITAL',
      badgeId: 'OGH-MED-SUPT-410',
      department: 'Osmania General Hospital Trauma Command',
      phone: '+91 94405 88990',
    },
    VOLUNTEER: {
      id: 'usr-vol-01',
      name: 'Kiran Kumar',
      email: 'kiran.k@redcross.org.in',
      role: 'VOLUNTEER',
      badgeId: 'NDRF-VOL-HYD-409',
      department: 'Indian Red Cross & SDRF Quick Action Volunteer Wing',
      phone: '+91 99887 66554',
    },
    CITIZEN: {
      id: 'usr-cit-01',
      name: 'Venkat Reddy',
      email: 'venkat.reddy@gmail.com',
      role: 'CITIZEN',
      badgeId: 'CIT-HYD-9982',
      department: 'Civilian Emergency User (Tolichowki Resident)',
      phone: '+91 91234 56789',
    },
  };

  const selectedRole = (role || 'ADMIN').toUpperCase();
  const profile = roleProfiles[selectedRole] || roleProfiles.ADMIN;

  if (demoUser && demoUser.name) {
    profile.name = demoUser.name;
    profile.badgeId = demoUser.badgeId || profile.badgeId;
  }

  const token = generateJwt({
    sub: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    badgeId: profile.badgeId,
    department: profile.department,
  });

  return res.json({
    success: true,
    token,
    user: profile,
    tokenType: 'Bearer',
    expiresInSeconds: 86400,
  });
});

app.get('/api/auth/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authorization header missing or invalid' });
  }
  const token = authHeader.split(' ')[1];
  const result = verifyJwt(token);
  if (!result.valid) {
    return res.status(401).json({ success: false, error: result.error });
  }
  return res.json({ success: true, user: result.payload });
});

// -------------------------------------------------------------
// Volunteer & Helper Intercom & Comms API Layer
// -------------------------------------------------------------
app.get('/api/messages', (_req: Request, res: Response) => {
  res.json({ success: true, messages: LIVE_INTERCOM_MESSAGES });
});

app.post('/api/messages', (req: Request, res: Response) => {
  const { channel, senderId, senderName, senderRole, senderBadge, text, isUrgent, location } = req.body;
  if (!text || !senderName) {
    return res.status(400).json({ success: false, error: 'Text and sender name required' });
  }

  const newMsg = {
    id: `msg-${Date.now()}`,
    channel: channel || '#volunteers-and-helpers',
    senderId: senderId || 'user-anon',
    senderName,
    senderRole: senderRole || 'VOLUNTEER',
    senderBadge: senderBadge || 'VOL-FIELD',
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isUrgent: !!isUrgent,
    location,
  };

  LIVE_INTERCOM_MESSAGES.unshift(newMsg);
  res.json({ success: true, message: newMsg });
});

// -------------------------------------------------------------
// SOA Microservices API Layer
// -------------------------------------------------------------

// 1. Health & SOA Service Directory Status
app.get('/api/soa/directory', (_req: Request, res: Response) => {
  const services = [
    { name: 'Identity Service', version: '2.1.0', status: 'HEALTHY', latencyMs: 14, type: 'CORE' },
    { name: 'Authentication & RBAC Service', version: '1.4.0', status: 'HEALTHY', latencyMs: 19, type: 'SECURITY' },
    { name: 'Citizen SOS Service', version: '3.0.2', status: 'HEALTHY', latencyMs: 8, type: 'DISPATCH' },
    { name: 'Volunteer & Trust Engine', version: '2.4.1', status: 'HEALTHY', latencyMs: 22, type: 'TRUST' },
    { name: 'Fraud Detection Service', version: '1.9.0', status: 'HEALTHY', latencyMs: 31, type: 'TRUST' },
    { name: 'Disaster State Service', version: '3.1.0', status: 'HEALTHY', latencyMs: 11, type: 'CORE' },
    { name: 'Geospatial & GIS Service', version: '2.0.4', status: 'HEALTHY', latencyMs: 27, type: 'GIS' },
    { name: 'Road & Network Routing Service', version: '2.2.0', status: 'HEALTHY', latencyMs: 18, type: 'ROUTING' },
    { name: 'Hospital Resource Service', version: '2.3.0', status: 'HEALTHY', latencyMs: 12, type: 'LOGISTICS' },
    { name: 'Ambulance Telemetry Service', version: '2.1.0', status: 'HEALTHY', latencyMs: 9, type: 'LOGISTICS' },
    { name: 'AI Risk Prediction Engine (Random Forest)', version: '1.8.2', status: 'HEALTHY', latencyMs: 45, type: 'AI' },
    { name: 'Dynamic Resource Optimizer (OR-Tools)', version: '3.2.0', status: 'HEALTHY', latencyMs: 38, type: 'OPTIMIZATION' },
    { name: 'Computer Vision Analysis Service', version: '2.0.1', status: 'HEALTHY', latencyMs: 82, type: 'CV' },
    { name: 'Multilingual Voice SOS Service', version: '1.5.0', status: 'HEALTHY', latencyMs: 64, type: 'NLP' },
    { name: 'Disaster Digital Twin Engine', version: '2.5.0', status: 'HEALTHY', latencyMs: 29, type: 'SIMULATION' },
    { name: 'Edge Synchronization Gateway', version: '1.3.0', status: 'HEALTHY', latencyMs: 16, type: 'EDGE' },
    { name: 'Cryptographic Audit Service', version: '1.1.0', status: 'HEALTHY', latencyMs: 12, type: 'SECURITY' },
  ];
  res.json({ success: true, timestamp: new Date().toISOString(), services });
});

// 2. Raksha Copilot endpoint (Gemini Powered)
app.post('/api/copilot/query', async (req: Request, res: Response) => {
  const { query, context } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  // If Gemini client is active, query real Gemini 3.8 Flash
  if (aiClient) {
    try {
      const systemInstruction = `You are "Raksha Copilot", an AI emergency disaster response specialist assisting the Chief Disaster Operations Coordinator for India (National Disaster Response Force - NDRF, SDRF, and GHMC HYDRAA).
Context: Urban flooding in Hyderabad, Telangana, India. Focus areas include Moosi River basin, Tolichowki, Nadeem Colony, Alwal, Begumpet, and Malakpet.
Available facilities: Gandhi Hospital, Osmania General Hospital, NIMS Punjagutta, Apollo Jubilee Hills.
Operational Constraints: Narrow streets, flooded causeways, saturated government hospitals, power disruptions, and communication bottlenecks.
Formatting: Provide crisp, high-urgency, professional, structured assessments. Always include:
1. Executive Situation Assessment
2. Key Operational Recommendation (Ambulance diversion, boat deployment, or shelter routing)
3. Confidence Level & Primary Risk Factors
Keep responses concise, explainable, and actionable. Do not use generic filler.`;

      const prompt = `Context data: ${JSON.stringify(context || {})}\n\nCoordinator Question: ${query}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
          maxOutputTokens: 800,
        },
      });

      return res.json({
        success: true,
        source: 'gemini-3.8-flash',
        answer: response.text,
        confidence: 0.94,
      });
    } catch (err: any) {
      console.error('Gemini Copilot Error:', err?.message || err);
      // Fallback gracefully to disaster heuristic intelligence
    }
  }

  // Expert Heuristic Knowledge Base Fallback
  const qLower = query.toLowerCase();
  let answer = '';
  let actionsProposed: string[] = [];

  if (qLower.includes('hospital') || qLower.includes('capacity') || qLower.includes('osmania')) {
    answer = `**HOSPITAL CAPACITY ALERT & DIVERSION ADVISORY:**
- **Osmania General Hospital** is currently at **93% capacity** (Critical saturation in ICU & Trauma).
- **Gandhi Hospital, Secunderabad** has **48% occupancy** with 34 active trauma beds and 12 ventilator units available.
- **NIMS Punjagutta** is at **67% capacity**.

**AI Recommendation:**
Redirect upcoming critical casualty flows from Tolichowki & Chaderghat towards Gandhi Hospital via Outer Ring Road or PVNR Elevated Expressway to avoid Moosi causeway gridlock. Estimated transit time: 14 mins.`;
    actionsProposed = ['Reroute 4 en-route ambulances to Gandhi Hospital', 'Deploy Emergency Medical Supply Kit #4 to Osmania'];
  } else if (qLower.includes('road') || qLower.includes('blocked') || qLower.includes('route')) {
    answer = `**ROAD NETWORK ACCESSIBILITY STATUS:**
- **Moosi River Embankment Road (Chaderghat to Amberpet):** SUBMERGED (Water depth: 3.8 ft). Unusable for standard ambulances.
- **Tolichowki Flyover Underpass:** SEVERELY WATERLOGGED (2.4 ft). Light vehicles stalled.
- **PVNR Expressway:** OPEN & USABLE (High ground).
- **Inner Ring Road via Mehdipatnam:** CONGESTED but navigable by SDRF High-Clearance Rescue Trucks.

**AI Recommendation:** Activate Alternate Route Bravo (via Masab Tank - Banjara Hills Road #12) for all emergency dispatches to Jubilee Hills / NIMS.`;
    actionsProposed = ['Mark Chaderghat Causeway as P1 BLOCKED', 'Update OSRM routing matrix to avoid Low-Lying Tolichowki'];
  } else if (qLower.includes('priority') || qLower.includes('zone') || qLower.includes('highest')) {
    answer = `**HIGHEST PRIORITY DISASTER ZONES (RANKED):**
1. **Nadeem Colony (Tolichowki):** Risk 94% | 18 stranded rooftop families (6 elderly, 4 infants). Water level rising at 8 cm/hr.
2. **Alwal Lake Catchment:** Risk 86% | Electrical substation breach reported, power cut to 420 households.
3. **Chaderghat Low-Lying Slum:** Risk 82% | Moosi backflow causing localized flooding.

**AI Recommendation:** Deploy NDRF 10th Battalion Inflatable Motor Boats (IRB-04 & IRB-07) immediately to Nadeem Colony with life jackets and satellite comms.`;
    actionsProposed = ['Deploy NDRF Boat Unit 4 to Nadeem Colony', 'Issue Cell Broadcast Evacuation to Alwal Ward 134'];
  } else {
    answer = `**RAKSHANET COMMAND INTELLIGENCE BRIEFING:**
- **Overall Disaster Risk:** SEVERE (88% composite flood index).
- **Active SOS Incidents:** 42 Total (14 Critical P1, 19 P2, 9 P3).
- **Active Responders:** 24 Ambulances deployed, 14 SDRF/NDRF Boat units active, 68 Verified Volunteers operational.
- **Resource Constraints:** Clean drinking water deficit in Sector 4 (3,500 L required); Osmania blood bank requesting O-negative units.

What specific sector or resource re-allocation would you like me to model?`;
    actionsProposed = ['Run Dynamic Resource Allocation (OR-Tools)', 'Inspect Disaster Digital Twin'];
  }

  return res.json({
    success: true,
    source: 'raksha-expert-engine',
    answer,
    confidence: 0.92,
    actionsProposed,
  });
});

// 3. Multilingual Voice SOS Parser (Simulated / Gemini Supported)
app.post('/api/sos/parse-voice', async (req: Request, res: Response) => {
  const { transcript, language, audioBase64 } = req.body;

  if (!transcript && !audioBase64) {
    return res.status(400).json({ error: 'Audio transcript or recording required' });
  }

  // If Gemini client is active and we have transcript, let Gemini extract structured disaster JSON
  if (aiClient && transcript) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an Indian Disaster NLP parser. Analyze this distress transcript from a citizen in ${language || 'Indian regional language'}:
"${transcript}"
Extract structured disaster incident details in valid JSON with:
{
  "detectedLanguage": "${language || 'Telugu'}",
  "disasterType": "Flood" | "Landslide" | "Building Collapse" | "Medical Emergency" | "Fire",
  "urgency": "P1_CRITICAL" | "P2_HIGH" | "P3_MODERATE",
  "victimCount": number,
  "trappedPeople": boolean,
  "medicalNeed": boolean,
  "locationHint": string,
  "summaryEnglish": string,
  "recommendedAction": string
}
Return ONLY valid JSON.`,
      });

      let parsedJson: any = null;
      try {
        const text = response.text || '';
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedJson = JSON.parse(cleaned);
      } catch {
        // fallback below
      }
      if (parsedJson) {
        return res.json({ success: true, structuredSos: parsedJson });
      }
    } catch (err) {
      console.warn('Gemini NLP parse fallback:', err);
    }
  }

  // Pre-configured multilingual extraction for Indian dialects
  const t = (transcript || '').toLowerCase();
  let result = {
    detectedLanguage: language || 'Telugu',
    disasterType: 'Flood',
    urgency: 'P1_CRITICAL',
    victimCount: 6,
    trappedPeople: true,
    medicalNeed: true,
    locationHint: 'Nadeem Colony, Tolichowki, Hyderabad',
    summaryEnglish: '6 people trapped on rooftop due to 5ft flood water inundation. Elderly patient requires urgent medical attention.',
    recommendedAction: 'Dispatch SDRF Inflatable Boat Unit & Paramedic',
  };

  if (t.includes('ఆక్సిజన్') || t.includes('హాస్పిటల్') || t.includes('గుండె') || t.includes('రక్తం') || t.includes('oxygen') || t.includes('hospital')) {
    result.medicalNeed = true;
    result.urgency = 'P1_CRITICAL';
  }

  res.json({ success: true, structuredSos: result });
});

// Start Express + Vite in Dev Mode
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RakshaNet AI] Command Center backend online at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
});
