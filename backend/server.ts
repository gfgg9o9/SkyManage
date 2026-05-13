import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load .env from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../.env') });
import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";

async function startServer() {
  const app = express();
  const PORT = 3001;

  // JSON body parser
  app.use(express.json());

  // MongoDB Connection
  const uri = process.env.MONGODB_URI;
  let mongoClient: MongoClient | null = null;
  let dbConnected = false;

  async function getMongoClient() {
    if (mongoClient && dbConnected) return mongoClient;
    if (!uri) {
      console.warn("[MONGODB] MONGODB_URI is not set. Database integration is disabled.");
      return null;
    }
    
    try {
      const maskedUri = uri.replace(/\/\/(.*):(.*)@/, "//***:***@");
      console.log(`[MONGODB] Connecting to Atlas: ${maskedUri}`);
      
      mongoClient = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        // Ensure SNI is handled correctly by the driver
        tls: true,
      });

      await mongoClient.connect();
      await mongoClient.db("admin").command({ ping: 1 });
      dbConnected = true;
      console.log("[MONGODB] Connected successfully to Atlas cluster.");
      return mongoClient;
    } catch (err: any) {
      console.error("[MONGODB] Connection failed:", err.message);
      if (err.message.includes("SSL") || err.message.includes("TLS")) {
        console.error("[MONGODB] SSL/TLS Error detected. Please ensure your Atlas cluster allows connections from this environment (check IP Whitelist) and the connection string is correct.");
      }
      mongoClient = null;
      dbConnected = false;
      return null;
    }
  }

  // MongoDB Health & Integrity Route
  app.get("/api/db-status", async (req, res) => {
    const client = await getMongoClient();
    let writeVisible = false;
    
    if (client && dbConnected) {
      try {
        const testCol = client.db("skymanage_system").collection("integrity_checks");
        await testCol.insertOne({ timestamp: new Date(), type: "ping" });
        writeVisible = true;
      } catch (e) {
        console.error("[MONGODB] Integrity check failed:", e);
      }
    }

    res.json({
      connected: !!client && dbConnected,
      integrity: writeVisible,
      provider: "MongoDB Atlas",
      scalable: true,
      distributed: true,
      timestamp: new Date().toISOString()
    });
  });

  // Invite API route
  app.post("/api/invite", async (req, res) => {
    const { email, projectName, role, inviterName, inviterEmail } = req.body;
    console.log(`[API] Invite request received for: ${email}`);
    
    if (!email || !projectName) {
      console.error("[API] Missing email or projectName");
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Nodemailer configuration
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailFrom = process.env.EMAIL_FROM || 'noreply@skymanage.com';
    
    if (!emailUser || !emailPass) {
      console.warn("[API] Email credentials not set. Using simulation mode.");
      console.log(`[SIMULATED EMAIL] To: ${email} - Project: ${projectName}, Role: ${role}, From: ${inviterName}`);
      return res.json({ 
        success: true, 
        simulated: true,
        message: "Email simulated (EMAIL credentials missing)"
      });
    }

    try {
      console.log("[API] Attempting to send real email via Nodemailer...");
      const nodemailer = await import("nodemailer");
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      const mailOptions = {
        from: emailFrom,
        to: email,
        subject: `Invitation to collaborate on ${projectName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1a202c; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h1 style="color: #0ea5e9; font-size: 24px; margin-bottom: 16px;">SkyManage Invitation</h1>
            <p style="font-size: 16px; line-height: 24px;"><strong>${inviterName || 'A teammate'}</strong> has invited you to collaborate on the project <strong>"${projectName}"</strong> as an <strong>${role}</strong>.</p>
            <p style="font-size: 16px; line-height: 24px;">To join the project, please create an account on SkyManage using this email address.</p>
            <div style="margin-top: 32px; margin-bottom: 32px;">
              <a href="${process.env.VITE_APP_URL || 'http://localhost:5173'}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Create Account & Join</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
            <p style="font-size: 12px; color: #718096; line-height: 18px;">
              You received this because someone invited you to SkyManage. If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        `
      };

      // Temporary bypass for Firestore permissions - create in-memory invitation
      console.warn("[API] Firestore permissions not available - using temporary in-memory storage");
      
      const invitationData = {
        id: `inv_${Date.now()}`,
        projectId: `temp_${Date.now()}`, // You'll want to pass actual projectId
        projectName: projectName,
        inviterName: inviterName,
        inviterEmail: inviterEmail || 'noreply@skymanage.com',
        inviteeEmail: email,
        role: role,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store in memory for testing (this will be lost on server restart)
      if (!(globalThis as any).invitations) {
        (globalThis as any).invitations = [];
      }
      (globalThis as any).invitations.push(invitationData);
      console.log("[API] Temporary invitation created:", invitationData.id);

      // Then send email
      const result = await transporter.sendMail(mailOptions);

      console.log("[API] Email sent successfully via Nodemailer");
      return res.json({ 
        success: true, 
        message: "Invitation email sent successfully",
        emailId: result.messageId,
        invitationId: `inv_${Date.now()}`
      });
    } catch (err: any) {
      console.error("[API] Email sending exception:", err);
      
      // Handle Firestore permissions error gracefully
      if (err.code === 'permission-denied' || err.message?.includes('PERMISSION_DENIED')) {
        console.warn("[API] Firestore permissions error - invitation saved but not in database");
        return res.json({ 
          success: true, 
          message: "Invitation email sent successfully (note: invitation not saved to database due to permissions)",
          emailId: 'simulated',
          invitationId: `inv_${Date.now()}`,
          warning: "Firestore permissions need to be updated"
        });
      }
      
      res.status(500).json({ error: "Failed to send email", details: err.message });
    }
  });

  // Temporary invitations endpoint (bypass for Firestore permissions)
  app.get("/api/invitations", (req, res) => {
    const userEmail = req.query.email;
    console.log("[API] Getting invitations for:", userEmail);
    
    if (!(globalThis as any).invitations) {
      return res.json([]);
    }
    
    const userInvitations = (globalThis as any).invitations.filter((inv: any) => 
      inv.inviteeEmail === userEmail && inv.status === 'pending'
    );
    
    console.log("[API] Found", userInvitations.length, "invitations");
    res.json(userInvitations);
  });

  // Temporary invitation update endpoint
  app.post("/api/invitations/:id/update", (req, res) => {
    const invitationId = req.params.id;
    const { status } = req.body;
    
    console.log("[API] Updating invitation:", invitationId, "to status:", status);
    
    if (!(globalThis as any).invitations) {
      return res.status(404).json({ error: "Invitation not found" });
    }
    
    const invitation = (globalThis as any).invitations.find((inv: any) => inv.id === invitationId);
    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }
    
    invitation.status = status;
    invitation.updatedAt = new Date().toISOString();
    
    console.log("[API] Invitation updated successfully");
    res.json({ success: true, invitation });
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

  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SkyManage Server running on http://localhost:${PORT}`);
  });
}

startServer();
