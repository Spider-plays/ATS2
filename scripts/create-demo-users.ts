import { hashPassword } from "../server/auth";
import { db } from "../server/db";
import { users } from "../shared/schema";

async function createDemoUsers() {
  try {
    // Admin user
    const adminPassword = await hashPassword("admin123");
    await db.insert(users).values({
      username: "admin",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      role: "admin",
      isActive: true
    }).onConflictDoNothing();

    // Hiring manager user
    const hmPassword = await hashPassword("manager123");
    await db.insert(users).values({
      username: "manager",
      password: hmPassword,
      firstName: "Hiring",
      lastName: "Manager",
      email: "manager@example.com",
      role: "hiring_manager",
      isActive: true
    }).onConflictDoNothing();

    // Recruiter user
    const recruiterPassword = await hashPassword("recruiter123");
    await db.insert(users).values({
      username: "recruiter",
      password: recruiterPassword,
      firstName: "Recruiter",
      lastName: "User",
      email: "recruiter@example.com",
      role: "recruiter",
      isActive: true
    }).onConflictDoNothing();

    console.log("Demo users created successfully");
    
    // List the users
    const allUsers = await db.select().from(users);
    console.log("All users in database:");
    allUsers.forEach(user => {
      const { password, ...userWithoutPassword } = user;
      console.log(userWithoutPassword);
    });
    
  } catch (error) {
    console.error("Error creating demo users:", error);
  } finally {
    process.exit(0);
  }
}

createDemoUsers();