import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { ZodError } from "zod";
import { insertUserSchema, insertJobSchema, insertApplicantSchema } from "@shared/schema";
import { WebSocketServer, WebSocket } from 'ws';
import { fromZodError } from "zod-validation-error";
import { hashPassword } from "./auth";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user has required role
const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user!.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Error handler for Zod validation errors
  const handleZodError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ message: validationError.message });
    }
    throw err;
  };

  // User management routes (Admin only)
  app.get("/api/users", isAuthenticated, hasRole(["admin", "hiring_manager"]), async (req, res, next) => {
    try {
      let users;
      if (req.user!.role === "admin") {
        users = await storage.getAllUsers();
      } else if (req.user!.role === "hiring_manager") {
        // Get users created by recruiters
        users = await storage.getUsersByRole("recruiter");
      }

      // Remove password hashes
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      res.json(sanitizedUsers);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/users", isAuthenticated, hasRole(["admin"]), async (req, res, next) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);

      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Ensure password is properly hashed before storing
      const { password: plainPassword, ...otherData } = userData;
      const hashedPassword = await hashPassword(plainPassword);
      const user = await storage.createUser({
        ...otherData,
        password: hashedPassword
      });
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      next(error);
    }
  });

  app.put("/api/users/:id", isAuthenticated, hasRole(["admin"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      // Allow partial updates
      const userData = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(id, userData);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      next(error);
    }
  });

  app.delete("/api/users/:id", isAuthenticated, hasRole(["admin"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);

      if (id === req.user!.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      const success = await storage.deleteUser(id);

      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Job management routes
  app.get("/api/jobs", isAuthenticated, async (req, res, next) => {
    try {
      let jobs;
      // Filter jobs based on user role
      if (req.user!.role === "admin") {
        jobs = await storage.getAllJobs();
      } else if (req.user!.role === "hiring_manager") {
        jobs = await storage.getJobsByHiringManager(req.user!.id);
      } else if (req.user!.role === "recruiter") {
        jobs = await storage.getJobsByRecruiter(req.user!.id);
      } else {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(jobs);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/jobs", isAuthenticated, hasRole(["hiring_manager"]), async (req, res, next) => {
    try {
      const jobData = insertJobSchema.parse({
        ...req.body,
        hiringManagerId: req.user!.id // Set current user as hiring manager
      });

      const job = await storage.createJob(jobData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      next(error);
    }
  });

  app.get("/api/jobs/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Check permissions based on role
      if (req.user!.role === "hiring_manager" && job.hiringManagerId !== req.user!.id) {
        return res.status(403).json({ message: "You can only view your own jobs" });
      }

      if (req.user!.role === "recruiter" && job.recruiterId !== req.user!.id) {
        return res.status(403).json({ message: "You can only view jobs assigned to you" });
      }

      res.json(job);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/jobs/:id", isAuthenticated, hasRole(["hiring_manager"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Only allow hiring manager who created the job to update it
      if (job.hiringManagerId !== req.user!.id) {
        return res.status(403).json({ message: "You can only update your own jobs" });
      }

      // Allow partial updates
      const jobData = insertJobSchema.partial().parse(req.body);
      const updatedJob = await storage.updateJob(id, jobData);

      res.json(updatedJob);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      next(error);
    }
  });

  app.delete("/api/jobs/:id", isAuthenticated, hasRole(["hiring_manager"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Only allow hiring manager who created the job to delete it
      if (job.hiringManagerId !== req.user!.id) {
        return res.status(403).json({ message: "You can only delete your own jobs" });
      }

      const success = await storage.deleteJob(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Assign recruiter to job
  app.post("/api/jobs/:id/assign", isAuthenticated, hasRole(["hiring_manager"]), async (req, res, next) => {
    try {
      const jobId = parseInt(req.params.id);
      const { recruiterId } = z.object({ recruiterId: z.number() }).parse(req.body);

      const job = await storage.getJob(jobId);

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Only allow hiring manager who created the job to assign recruiters
      if (job.hiringManagerId !== req.user!.id) {
        return res.status(403).json({ message: "You can only assign recruiters to your own jobs" });
      }

      // Check if recruiter exists and has recruiter role
      const recruiter = await storage.getUser(recruiterId);

      if (!recruiter) {
        return res.status(404).json({ message: "Recruiter not found" });
      }

      if (recruiter.role !== "recruiter") {
        return res.status(400).json({ message: "User is not a recruiter" });
      }

      const updatedJob = await storage.assignRecruiter(jobId, recruiterId);
      res.json(updatedJob);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      next(error);
    }
  });

  // Applicant management routes
  app.get("/api/jobs/:id/applicants", isAuthenticated, async (req, res, next) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Check permissions based on role
      if (req.user!.role === "hiring_manager" && job.hiringManagerId !== req.user!.id) {
        return res.status(403).json({ message: "You can only view applicants for your own jobs" });
      }

      if (req.user!.role === "recruiter" && job.recruiterId !== req.user!.id) {
        return res.status(403).json({ message: "You can only view applicants for jobs assigned to you" });
      }

      const applicants = await storage.getApplicantsByJob(jobId);
      res.json(applicants);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/jobs/:id/applicants", isAuthenticated, hasRole(["recruiter"]), async (req, res, next) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Only allow assigned recruiter to add applicants
      if (job.recruiterId !== req.user!.id) {
        return res.status(403).json({ message: "You can only add applicants to jobs assigned to you" });
      }

      const applicantData = insertApplicantSchema.parse({
        ...req.body,
        jobId
      });

      const applicant = await storage.createApplicant(applicantData);
      res.status(201).json(applicant);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      next(error);
    }
  });

  app.put("/api/applicants/:id", isAuthenticated, hasRole(["recruiter"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const applicant = await storage.getApplicant(id);

      if (!applicant) {
        return res.status(404).json({ message: "Applicant not found" });
      }

      // Check if the job is assigned to this recruiter
      const job = await storage.getJob(applicant.jobId);

      if (!job || job.recruiterId !== req.user!.id) {
        return res.status(403).json({ message: "You can only update applicants for jobs assigned to you" });
      }

      // Allow partial updates
      const applicantData = insertApplicantSchema.partial().parse(req.body);
      const updatedApplicant = await storage.updateApplicant(id, applicantData);

      res.json(updatedApplicant);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      next(error);
    }
  });

  app.delete("/api/applicants/:id", isAuthenticated, hasRole(["recruiter"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const applicant = await storage.getApplicant(id);

      if (!applicant) {
        return res.status(404).json({ message: "Applicant not found" });
      }

      // Check if the job is assigned to this recruiter
      const job = await storage.getJob(applicant.jobId);

      if (!job || job.recruiterId !== req.user!.id) {
        return res.status(403).json({ message: "You can only delete applicants for jobs assigned to you" });
      }

      const success = await storage.deleteApplicant(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Stats routes
  app.get("/api/stats", isAuthenticated, async (req, res, next) => {
    try {
      let stats;

      if (req.user!.role === "admin") {
        stats = await storage.getUserStats();
      } else if (req.user!.role === "hiring_manager") {
        stats = await storage.getHiringManagerStats(req.user!.id);
      } else if (req.user!.role === "recruiter") {
        stats = await storage.getRecruiterStats(req.user!.id);
      } else {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  // Recent applicants for recruiter
  app.get("/api/recruiter/recent-applicants", isAuthenticated, hasRole(["recruiter"]), async (req, res, next) => {
    try {
      const applicants = await storage.getRecentApplicantsByRecruiter(req.user!.id);
      res.json(applicants);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Keep track of connected clients with their user info
  const clients = new Map<WebSocket, { 
    userId?: number; 
    role?: string; 
    isAlive: boolean;
  }>();

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    clients.set(ws, { isAlive: true });

    // Send initial connection confirmation
    ws.send(JSON.stringify({ type: 'connection', message: 'Connected to ATS WebSocket server' }));

    // Handle messages from clients
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());

        // Handle authentication
        if (data.type === 'auth' && data.userId && data.role) {
          clients.set(ws, { 
            userId: data.userId, 
            role: data.role,
            isAlive: true 
          });
          console.log(`User authenticated: ${data.userId}, role: ${data.role}`);

          // Notify client of successful authentication
          ws.send(JSON.stringify({ 
            type: 'auth_success', 
            userId: data.userId,
            role: data.role
          }));
        }

        // Handle presence updates
        if (data.type === 'presence') {
          broadcastPresence(ws, data);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    // Setup ping-pong to keep connection alive and detect disconnected clients
    ws.on('pong', () => {
      const client = clients.get(ws);
      if (client) {
        client.isAlive = true;
        clients.set(ws, client);
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      const client = clients.get(ws);
      if (client && client.userId) {
        broadcastToAll({ 
          type: 'user_offline', 
          userId: client.userId 
        });
      }
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });
  });

  // Broadcast to all connected clients
  function broadcastToAll(data: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Broadcast presence updates to relevant users based on role
  function broadcastPresence(sender: WebSocket, data: any) {
    const senderInfo = clients.get(sender);
    if (!senderInfo || !senderInfo.userId || !senderInfo.role) return;

    const presenceData = {
      type: 'presence_update',
      userId: senderInfo.userId,
      role: senderInfo.role,
      status: data.status,
      timestamp: new Date().toISOString(),
      action: data.action
    };

    wss.clients.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(presenceData));
      }
    });
  }

  // Set up interval to check for connections that have timed out
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const client = clients.get(ws);
      if (!client) return;

      if (client.isAlive === false) {
        if (client.userId) {
          broadcastToAll({ 
            type: 'user_offline', 
            userId: client.userId 
          });
        }
        clients.delete(ws);
        return ws.terminate();
      }

      client.isAlive = false;
      clients.set(ws, client);
      ws.ping();
    });
  }, 30000);

  // Listen for server shutdown to clean up interval
  httpServer.on('close', () => {
    clearInterval(interval);
  });

  // Setup event handlers for real-time updates

  // Hook into user creation/updates to notify admins
  const originalCreateUser = storage.createUser;
  storage.createUser = async (user) => {
    const newUser = await originalCreateUser(user);
    const { password, ...userWithoutPassword } = newUser;

    broadcastToAll({
      type: 'user_created',
      user: userWithoutPassword
    });

    return newUser;
  };

  // Hook into job creation/updates to notify relevant users
  const originalCreateJob = storage.createJob;
  storage.createJob = async (job) => {
    const newJob = await originalCreateJob(job);

    // Notify all users about the new job
    broadcastToAll({
      type: 'job_created',
      job: newJob
    });

    return newJob;
  };

  // Hook into applicant creation to notify relevant users
  const originalCreateApplicant = storage.createApplicant;
  storage.createApplicant = async (applicant) => {
    const newApplicant = await originalCreateApplicant(applicant);

    // Get the job details to determine who should be notified
    const job = await storage.getJob(newApplicant.jobId);
    if (job) {
      // Broadcast to specific users based on job association
      wss.clients.forEach((client) => {
        const clientInfo = clients.get(client);
        if (!clientInfo || !clientInfo.userId || !clientInfo.role) return;

        const shouldNotify = 
          clientInfo.role === 'admin' || 
          (clientInfo.role === 'hiring_manager' && job.hiringManagerId === clientInfo.userId) ||
          (clientInfo.role === 'recruiter' && job.recruiterId === clientInfo.userId);

        if (shouldNotify && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'applicant_created',
            applicant: newApplicant,
            jobId: job.id,
            jobTitle: job.title
          }));
        }
      });
    }

    return newApplicant;
  };

  return httpServer;
}