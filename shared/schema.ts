import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Role enum
export const userRoleEnum = pgEnum('user_role', ['admin', 'hiring_manager', 'recruiter']);

// Job status enum
export const jobStatusEnum = pgEnum('job_status', ['draft', 'active', 'on_hold', 'filled', 'closed']);

// Applicant status enum
export const applicantStatusEnum = pgEnum('applicant_status', [
  'new', 
  'screening', 
  'screening_selected',
  'screening_rejected',
  'technical_round', 
  'technical_selected',
  'technical_rejected',
  'hr_round', 
  'hr_selected',
  'hr_rejected',
  'final_round',
  'hired', 
  'rejected', 
  'on_hold'
]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  minSalary: integer("min_salary"),
  maxSalary: integer("max_salary"),
  employmentType: text("employment_type").notNull(),
  status: jobStatusEnum("status").notNull().default("active"),
  hiringManagerId: integer("hiring_manager_id").notNull().references(() => users.id),
  recruiterId: integer("recruiter_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Applicants table
export const applicants = pgTable("applicants", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number"),
  currentCompany: text("current_company"),
  noticePeriod: text("notice_period"),
  totalExperience: text("total_experience"),
  relevantExperience: text("relevant_experience"),
  currentCtc: text("current_ctc"),
  expectedCtc: text("expected_ctc"),
  resume: text("resume"),
  status: applicantStatusEnum("status").notNull().default("new"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  managedJobs: many(jobs, { relationName: "hiringManager" }),
  assignedJobs: many(jobs, { relationName: "recruiter" })
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  hiringManager: one(users, {
    fields: [jobs.hiringManagerId],
    references: [users.id],
    relationName: "hiringManager"
  }),
  recruiter: one(users, {
    fields: [jobs.recruiterId],
    references: [users.id],
    relationName: "recruiter"
  }),
  applicants: many(applicants)
}));

export const applicantsRelations = relations(applicants, ({ one }) => ({
  job: one(jobs, {
    fields: [applicants.jobId],
    references: [jobs.id]
  })
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertApplicantSchema = createInsertSchema(applicants).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" })
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export type InsertApplicant = z.infer<typeof insertApplicantSchema>;
export type Applicant = typeof applicants.$inferSelect;

export type LoginData = z.infer<typeof loginSchema>;
