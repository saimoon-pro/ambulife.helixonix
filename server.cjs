var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
var ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new import_genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
var bookingsStore = /* @__PURE__ */ new Map();
var SAMPLE_DRIVERS = [
  { name: "Rafiqul Islam", phone: "+880 1711-890234", vehicleNo: "Dhaka Metro-HA 12-4091", rating: 4.9, avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80" },
  { name: "Tariqul Alam", phone: "+880 1819-452109", vehicleNo: "Dhaka Metro-HA 14-8832", rating: 4.8, avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80" },
  { name: "Anwar Hossain", phone: "+880 1912-774301", vehicleNo: "Dhaka Metro-HA 11-0921", rating: 5, avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=150&q=80" }
];
var HOSPITALS = [
  {
    id: "h1",
    name: "Square Hospital Dhaka",
    address: "18/F, West Panthapath, Bir Uttam Qazi Nuruzzaman Sarak, Dhaka",
    phone: "10616",
    emergencyPhone: "+880 1713-333333",
    specialties: ["ICU & CCU", "Trauma Center", "Cardiology", "Stroke Care"],
    rating: 4.8,
    lat: 23.7531,
    lng: 90.3807,
    icuAvailable: 4,
    generalBeds: 28
  },
  {
    id: "h2",
    name: "Evercare Hospital Dhaka",
    address: "Plot 81, Block E, Bashundhara R/A, Dhaka",
    phone: "10678",
    emergencyPhone: "+880 1711-555555",
    specialties: ["24/7 ER", "Emergency Cardiac", "Pediatric ICU", "Neuro Emergency"],
    rating: 4.9,
    lat: 23.8103,
    lng: 90.4312,
    icuAvailable: 7,
    generalBeds: 42
  },
  {
    id: "h3",
    name: "United Hospital Gulshan",
    address: "Plot 15, Road 71, Gulshan 2, Dhaka",
    phone: "10666",
    emergencyPhone: "+880 1914-001234",
    specialties: ["Burn Unit", "Emergency Surgery", "Neonatal ICU", "Chest Emergency"],
    rating: 4.7,
    lat: 23.7981,
    lng: 90.4189,
    icuAvailable: 2,
    generalBeds: 19
  },
  {
    id: "h4",
    name: "Dhaka Medical College Hospital (DMCH)",
    address: "Secretariat Road, Ramna, Dhaka",
    phone: "02-55165088",
    emergencyPhone: "+880 2-9669340",
    specialties: ["Government Tertiary Care", "Burn & Plastic Institute", "Mass Casualty"],
    rating: 4.5,
    lat: 23.7259,
    lng: 90.3976,
    icuAvailable: 1,
    generalBeds: 120
  },
  {
    id: "h5",
    name: "Labaid Specialized Hospital",
    address: "House 06, Road 04, Dhanmondi, Dhaka",
    phone: "10606",
    emergencyPhone: "+880 1713-043198",
    specialties: ["Cardiac Care", "Neurology", "Kidney Emergency"],
    rating: 4.6,
    lat: 23.7425,
    lng: 90.3828,
    icuAvailable: 5,
    generalBeds: 35
  }
];
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Ambulife Emergency Dispatch Engine" });
});
app.get("/api/hospitals", (req, res) => {
  const query = (req.query.q || "").toLowerCase();
  if (!query) {
    return res.json(HOSPITALS);
  }
  const filtered = HOSPITALS.filter(
    (h) => h.name.toLowerCase().includes(query) || h.address.toLowerCase().includes(query) || h.specialties.some((s) => s.toLowerCase().includes(query))
  );
  res.json(filtered);
});
app.post("/api/bookings", (req, res) => {
  const { pickupLocation, destinationHospital, ambulanceType, patientCondition, contactNumber, userCoords } = req.body;
  if (!pickupLocation || !destinationHospital) {
    return res.status(400).json({ error: "Pickup location and destination hospital are required." });
  }
  const randomDriver = SAMPLE_DRIVERS[Math.floor(Math.random() * SAMPLE_DRIVERS.length)];
  const id = "AMB-" + Math.floor(1e5 + Math.random() * 9e5);
  const pickup = userCoords || { lat: 23.7508 + (Math.random() - 0.5) * 0.04, lng: 90.3925 + (Math.random() - 0.5) * 0.04 };
  const matchedHosp = HOSPITALS.find((h) => h.name.toLowerCase().includes(destinationHospital.toLowerCase())) || HOSPITALS[0];
  const destCoords = { lat: matchedHosp.lat, lng: matchedHosp.lng };
  const driverLat = pickup.lat + (Math.random() - 0.5) * 0.015;
  const driverLng = pickup.lng + (Math.random() - 0.5) * 0.015;
  const fares = { basic: 1500, icu: 4500, ac: 2200, freezer: 3500, air: 35e3 };
  const typeKey = ambulanceType || "basic";
  const newBooking = {
    id,
    pickupLocation,
    destinationHospital: matchedHosp.name,
    ambulanceType: typeKey,
    patientCondition: patientCondition || "Emergency Triage",
    contactNumber: contactNumber || "+880 1700-000000",
    status: "dispatched",
    driver: {
      ...randomDriver,
      latitude: driverLat,
      longitude: driverLng
    },
    pickupCoords: pickup,
    hospitalCoords: destCoords,
    etaMinutes: Math.floor(4 + Math.random() * 6),
    fareEstimate: fares[typeKey] || 2e3,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  bookingsStore.set(id, newBooking);
  res.status(201).json(newBooking);
});
app.get("/api/bookings/:id", (req, res) => {
  const booking = bookingsStore.get(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  const timeDiffSec = (Date.now() - new Date(booking.createdAt).getTime()) / 1e3;
  if (booking.status === "dispatched" && timeDiffSec > 10) {
    booking.status = "en_route";
  }
  if (booking.status === "en_route" && timeDiffSec > 90) {
    booking.status = "arrived";
  }
  if (booking.status === "dispatched" || booking.status === "en_route") {
    const factor = Math.min(1, timeDiffSec / 90);
    booking.driver.latitude = booking.driver.latitude + (booking.pickupCoords.lat - booking.driver.latitude) * 0.1;
    booking.driver.longitude = booking.driver.longitude + (booking.pickupCoords.lng - booking.driver.longitude) * 0.1;
    booking.etaMinutes = Math.max(1, Math.ceil(6 * (1 - factor)));
  }
  res.json(booking);
});
app.post("/api/bookings/:id/cancel", (req, res) => {
  const booking = bookingsStore.get(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  booking.status = "cancelled";
  bookingsStore.set(booking.id, booking);
  res.json({ message: "Booking cancelled successfully", booking });
});
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }
  if (!ai) {
    return res.json({
      reply: "I am the Ambulife Emergency Assistant. I can help you triage symptoms, give first aid instructions, and book an ambulance. Please provide your current location and hospital of choice to proceed.",
      suggestedAction: "REQUEST_LOCATION",
      firstAidAdvice: "Keep the patient calm, ensure open airways, and do not move them if spinal injury is suspected.",
      bookingRecommendation: null
    });
  }
  try {
    const systemPrompt = `You are Ambulife AI - a 24/7 medical triage and emergency dispatch chatbot for Ambulife Bangladesh.
Your core mission:
1. Provide concise, lifesaving first-aid tips (CPR, choking, severe bleeding, cardiac arrest, stroke, fall injury, high fever, unconsciousness).
2. Assess user intent immediately. Support both BANGLA and ENGLISH seamlessly. If the user writes in Bangla or Banglish, answer in supportive Bangla/English.
3. Detect if the user needs an ambulance immediately. If they mention locations (e.g. "Dhanmondi", "Mirpur", "Square Hospital", "Urgent ICU", "father collapsed"), recommend booking an ambulance with vehicle type (Basic, ICU, AC, Freezer, Air).
4. Maintain a calm, empathetic, clear, emergency-first tone.

CRITICAL INSTRUCTION:
Return your response strictly in valid JSON format matching this schema:
{
  "reply": "Empathetic, reassuring text advice including emergency instructions in English or Bangla.",
  "firstAidSteps": ["Step 1...", "Step 2...", "Step 3..."],
  "isEmergency": true/false,
  "bookingRecommendation": {
    "recommendedType": "icu" | "basic" | "ac" | "freezer" | "air",
    "pickup": "Extracted pickup location if mentioned or null",
    "hospital": "Extracted hospital name if mentioned or null"
  }
}`;
    const contentsPayload = [];
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        contentsPayload.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        });
      }
    }
    contentsPayload.push({
      role: "user",
      parts: [{ text: message }]
    });
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contentsPayload,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    });
    const textOutput = response.text || "{}";
    try {
      const parsed = JSON.parse(textOutput);
      return res.json(parsed);
    } catch {
      return res.json({
        reply: textOutput,
        firstAidSteps: [
          "1. Check for responsiveness and breathing.",
          "2. Call emergency hotline 999 or 10616.",
          "3. Keep patient in a safe recovery position."
        ],
        isEmergency: true,
        bookingRecommendation: null
      });
    }
  } catch (error) {
    console.error("Gemini AI API Error:", error);
    res.status(500).json({
      error: "AI Triage temporary system error",
      reply: "Ambulife AI is currently maintaining line connections. For immediate dispatch, press the yellow 'Book Ambulance Now' button or call hotline 10616 / 999.",
      isEmergency: true
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ambulife Emergency Engine running at http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
