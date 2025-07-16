import { 
  users, type User, type InsertUser,
  jobs, type Job, type InsertJob,
  applicants, type Applicant, type InsertApplicant
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, inArray, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getUsersByRole(role: string): Promise<User[]>; // Added method

  // Job operations
  createJob(job: InsertJob): Promise<Job>;
  getJob(id: number): Promise<Job | undefined>;
  updateJob(id: number, data: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: number): Promise<boolean>;
  getAllJobs(): Promise<Job[]>;
  getJobsByHiringManager(hiringManagerId: number): Promise<Job[]>;
  getJobsByRecruiter(recruiterId: number): Promise<Job[]>;
  assignRecruiter(jobId: number, recruiterId: number): Promise<Job | undefined>;

  // Applicant operations
  createApplicant(applicant: InsertApplicant): Promise<Applicant>;
  getApplicant(id: number): Promise<Applicant | undefined>;
  updateApplicant(id: number, data: Partial<InsertApplicant>): Promise<Applicant | undefined>;
  deleteApplicant(id: number): Promise<boolean>;
  getApplicantsByJob(jobId: number): Promise<Applicant[]>;
  getRecentApplicantsByRecruiter(recruiterId: number): Promise<Applicant[]>;

  // Dashboard stats
  getUserStats(): Promise<{
    totalUsers: number;
    openJobs: number;
    activeRecruiters: number;
    totalApplicants: number;
  }>;
  getHiringManagerStats(hiringManagerId: number): Promise<{
    myJobPostings: number;
    assignedRecruiters: number;
    totalApplicants: number;
  }>;
  getRecruiterStats(recruiterId: number): Promise<{
    assignedJobs: number;
    activeApplicants: number;
    interviewsScheduled: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.firstName);
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, role));
  }

  // Job operations
  async createJob(job: InsertJob): Promise<Job> {
    const [createdJob] = await db.insert(jobs).values(job).returning();
    return createdJob;
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async updateJob(id: number, data: Partial<InsertJob>): Promise<Job | undefined> {
    const [updatedJob] = await db
      .update(jobs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return updatedJob;
  }

  async deleteJob(id: number): Promise<boolean> {
    try {
      // First delete all applicants for this job
      await db.delete(applicants).where(eq(applicants.jobId, id));
      // Then delete the job
      await db.delete(jobs).where(eq(jobs.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting job:", error);
      return false;
    }
  }

  async getAllJobs(): Promise<Job[]> {
    return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async getJobsByHiringManager(hiringManagerId: number): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.hiringManagerId, hiringManagerId))
      .orderBy(desc(jobs.createdAt));
  }

  async getJobsByRecruiter(recruiterId: number): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.recruiterId, recruiterId))
      .orderBy(desc(jobs.createdAt));
  }

  async assignRecruiter(jobId: number, recruiterId: number): Promise<Job | undefined> {
    const [updatedJob] = await db
      .update(jobs)
      .set({ 
        recruiterId, 
        updatedAt: new Date() 
      })
      .where(eq(jobs.id, jobId))
      .returning();
    return updatedJob;
  }

  // Applicant operations
  async createApplicant(applicant: InsertApplicant): Promise<Applicant> {
    const [createdApplicant] = await db.insert(applicants).values(applicant).returning();
    return createdApplicant;
  }

  async getApplicant(id: number): Promise<Applicant | undefined> {
    const [applicant] = await db.select().from(applicants).where(eq(applicants.id, id));
    return applicant;
  }

  async updateApplicant(id: number, data: Partial<InsertApplicant>): Promise<Applicant | undefined> {
    const [updatedApplicant] = await db
      .update(applicants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(applicants.id, id))
      .returning();
    return updatedApplicant;
  }

  async deleteApplicant(id: number): Promise<boolean> {
    await db.delete(applicants).where(eq(applicants.id, id));
    return true;
  }

  async getApplicantsByJob(jobId: number): Promise<Applicant[]> {
    return await db
      .select()
      .from(applicants)
      .where(eq(applicants.jobId, jobId))
      .orderBy(desc(applicants.createdAt));
  }

  async getRecentApplicantsByRecruiter(recruiterId: number): Promise<Applicant[]> {
    // Get applicants for jobs assigned to this recruiter
    const recruiterJobs = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(eq(jobs.recruiterId, recruiterId));

    const jobIds = recruiterJobs.map(job => job.id);

    if (jobIds.length === 0) {
      return [];
    }

    return await db
      .select()
      .from(applicants)
      .where(inArray(applicants.jobId, jobIds))
      .orderBy(desc(applicants.createdAt))
      .limit(10);
  }

  // Dashboard stats
  async getUserStats(): Promise<{
    totalUsers: number;
    openJobs: number;
    activeRecruiters: number;
    totalApplicants: number;
  }> {
    const [{ count: totalUsers }] = await db
      .select({ count: sql`count(*)` })
      .from(users);

    const [{ count: openJobs }] = await db
      .select({ count: sql`count(*)` })
      .from(jobs)
      .where(eq(jobs.status, 'active'));

    const [{ count: activeRecruiters }] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(
        and(
          eq(users.role, 'recruiter'),
          eq(users.isActive, true)
        )
      );

    const [{ count: totalApplicants }] = await db
      .select({ count: sql`count(*)` })
      .from(applicants);

    return {
      totalUsers: Number(totalUsers),
      openJobs: Number(openJobs),
      activeRecruiters: Number(activeRecruiters),
      totalApplicants: Number(totalApplicants)
    };
  }

  async getHiringManagerStats(hiringManagerId: number): Promise<{
    myJobPostings: number;
    assignedRecruiters: number;
    totalApplicants: number;
  }> {
    const [{ count: myJobPostings }] = await db
      .select({ count: sql`count(*)` })
      .from(jobs)
      .where(eq(jobs.hiringManagerId, hiringManagerId));

    // Count distinct recruiters assigned to this hiring manager's jobs
    const [{ count: assignedRecruiters }] = await db
      .select({ count: sql`count(distinct recruiter_id)` })
      .from(jobs)
      .where(
        and(
          eq(jobs.hiringManagerId, hiringManagerId),
          sql`recruiter_id is not null`
        )
      );

    // Count applicants for all jobs created by this hiring manager
    const jobsCreated = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(eq(jobs.hiringManagerId, hiringManagerId));

    const jobIds = jobsCreated.map(job => job.id);

    let totalApplicants = 0;
    if (jobIds.length > 0) {
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(applicants)
        .where(sql`job_id IN (${jobIds.join(',')})`);

      totalApplicants = Number(count);
    }

    return {
      myJobPostings: Number(myJobPostings),
      assignedRecruiters: Number(assignedRecruiters),
      totalApplicants
    };
  }

  async getRecruiterStats(recruiterId: number): Promise<{
    assignedJobs: number;
    activeApplicants: number;
    interviewsScheduled: number;
  }> {
    const [{ count: assignedJobs }] = await db
      .select({ count: sql`count(*)` })
      .from(jobs)
      .where(eq(jobs.recruiterId, recruiterId));

    // Get all jobs assigned to this recruiter
    const recruiterJobs = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(eq(jobs.recruiterId, recruiterId));

    const jobIds = recruiterJobs.map(job => job.id);

    let activeApplicants = 0;
    let interviewsScheduled = 0;

    if (jobIds.length > 0) {
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(applicants)
        .where(
          and(
            inArray(applicants.jobId, jobIds),
            sql`status != 'rejected' AND status != 'hired'`
          )
        );

      activeApplicants = Number(count);

      const [{ count: interviews }] = await db
        .select({ count: sql`count(*)` })
        .from(applicants)
        .where(
          and(
            inArray(applicants.jobId, jobIds),
            or(
              eq(applicants.status, 'technical_round'),
              eq(applicants.status, 'hr_round'),
              eq(applicants.status, 'final_round')
            )
          )
        );

      interviewsScheduled = Number(interviews);
    }

    return {
      assignedJobs: Number(assignedJobs),
      activeApplicants,
      interviewsScheduled
    };
  }
}

export const storage = new DatabaseStorage();