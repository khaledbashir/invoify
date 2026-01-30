// import dotenv from 'dotenv';
// dotenv.config();

import { DrawingService } from '../services/vision/drawing-service';

console.log("Testing Vision Service Configuration...");

const service = new DrawingService();
// We can't easily access private properties in TS without suppressing checks or using 'any' cast
const clientConfig = (service as any).visionClient.config;

console.log("API Key present:", !!clientConfig.apiKey);
console.log("Base URL:", clientConfig.baseUrl);

if (clientConfig.baseUrl === "https://api.z.ai/api/coding/paas/v4") {
    console.log("✅ Base URL matches Z AI endpoint.");
} else {
    console.error("❌ Base URL mismatch.");
}

if (clientConfig.apiKey && clientConfig.apiKey.startsWith("06ed")) {
     console.log("✅ API Key loaded correctly.");
} else {
    console.error("❌ API Key mismatch or missing.");
}
