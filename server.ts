import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON body parser
  app.use(express.json());

  // Invite API route
  app.post("/api/invite", async (req, res) => {
    const { email, projectName, role, inviterName } = req.body;
    console.log(`[API] Invite request received for: ${email}`);
    
    if (!email || !projectName) {
      console.error("[API] Missing email or projectName");
      return res.status(400).json({ error: "Missing required fields" });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[API] RESEND_API_KEY is not set. Using simulation mode.");
      console.log(`[SIMULATED EMAIL] To: ${email} - Project: ${projectName}, Role: ${role}, From: ${inviterName}`);
      return res.json({ 
        success: true, 
        simulated: true,
        message: "Email simulated (RESEND_API_KEY missing)"
      });
    }

    try {
      console.log("[API] Attempting to send real email via Resend...");
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: [email],
        subject: `Invitation to collaborate on ${projectName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1a202c; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h1 style="color: #0ea5e9; font-size: 24px; margin-bottom: 16px;">SkyManage Invitation</h1>
            <p style="font-size: 16px; line-height: 24px;"><strong>${inviterName || 'A teammate'}</strong> has invited you to collaborate on the project <strong>"${projectName}"</strong> as an <strong>${role}</strong>.</p>
            <p style="font-size: 16px; line-height: 24px;">To join the project, please create an account on SkyManage using this email address.</p>
            <div style="margin-top: 32px; margin-bottom: 32px;">
              <a href="${process.env.VITE_APP_URL || 'https://skymanage.app'}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Create Account & Join</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
            <p style="font-size: 12px; color: #718096; line-height: 18px;">
              You received this because someone invited you to SkyManage. If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        `
      });

      if (error) {
        console.error("[API] Resend error details:", JSON.stringify(error, null, 2));
        
        let errorMessage = error.message;
        if (error.name === 'validation_error') {
          errorMessage = `Resend Validation Error: ${error.message}. This usually means you are using a trial Resend account and trying to send to an unverified email address. You must verify your domain in Resend or send only to your own account email during testing.`;
        }
        
        return res.status(error.name === 'validation_error' ? 400 : 500).json({ 
          error: errorMessage,
          code: error.name
        });
      }

      console.log("[API] Email sent successfully:", data?.id);
      res.json({ success: true, id: data?.id });
    } catch (err: any) {
      console.error("[API] Email sending exception:", err);
      res.status(500).json({ error: "Failed to send email", details: err.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      message: "SkyManage API is operational",
      timestamp: new Date().toISOString()
    });
  });

  // AWS S3 Presigned URL generation
  app.post("/api/upload-url", async (req, res) => {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: "fileName and fileType are required" });
    }

    const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME } = process.env;

    if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_BUCKET_NAME) {
      console.warn("[S3] AWS configuration missing. Using simulated upload link.");
      return res.json({
        uploadUrl: "https://example.com/simulated-upload",
        fileUrl: `https://${AWS_BUCKET_NAME || 'simulated'}.s3.amazonaws.com/${fileName}`,
        simulated: true
      });
    }

    try {
      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

      const s3Client = new S3Client({
        region: AWS_REGION,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
      });

      const key = `uploads/${Date.now()}-${fileName}`;
      const command = new PutObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      const fileUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;

      res.json({ uploadUrl, fileUrl });
    } catch (err: any) {
      console.error("[S3] Error generating signed URL:", err);
      res.status(500).json({ error: "Failed to generate upload URL", details: err.message });
    }
  });

  // Example API route for notifications (can be expanded)
  app.post("/api/notify", (req, res) => {
    const { userId, type, message } = req.body;
    console.log(`Notification request for ${userId}: [${type}] ${message}`);
    // In a real serverless env, this might trigger an email via SES or similar
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SkyManage Server running on http://localhost:${PORT}`);
  });
}

startServer();
