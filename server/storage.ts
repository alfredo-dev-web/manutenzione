import { tasks, teams, users, plants, type Task, type Team, type User, type Plant, type InsertTask, type InsertTeam, type InsertUser, type InsertPlant } from "@shared/schema";
import { db } from "./db";
import { eq, ilike } from "drizzle-orm";

export interface IStorage {
  // Task operations
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Team operations
  getTeams(): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, updates: Partial<Team>): Promise<Team | undefined>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Plant operations
  getPlants(): Promise<Plant[]>;
  getPlant(id: number): Promise<Plant | undefined>;
  createPlant(plant: InsertPlant): Promise<Plant>;
  updatePlant(id: number, updates: Partial<Plant>): Promise<Plant | undefined>;
  searchPlants(query: string): Promise<Plant[]>;
}

export class DatabaseStorage implements IStorage {
  // Task operations
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        ...insertTask,
        status: "available",
        assignedTeamId: null,
        createdAt: new Date(),
        startedAt: null,
        completedAt: null,
      })
      .returning();
    return task;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Team operations
  async getTeams(): Promise<Team[]> {
    return await db.select().from(teams);
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const [team] = await db
      .insert(teams)
      .values({
        ...insertTeam,
        status: insertTeam.status || 'available',
        currentLocation: insertTeam.currentLocation || 'Base Operativa',
        nextAvailable: insertTeam.nextAvailable || 'Libera ora'
      })
      .returning();
    return team;
  }

  async updateTeam(id: number, updates: Partial<Team>): Promise<Team | undefined> {
    const [team] = await db
      .update(teams)
      .set(updates)
      .where(eq(teams.id, id))
      .returning();
    return team || undefined;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        role: insertUser.role || 'team'
      })
      .returning();
    return user;
  }

  // Plant operations
  async getPlants(): Promise<Plant[]> {
    return await db.select().from(plants);
  }

  async getPlant(id: number): Promise<Plant | undefined> {
    const [plant] = await db.select().from(plants).where(eq(plants.id, id));
    return plant || undefined;
  }

  async createPlant(insertPlant: InsertPlant): Promise<Plant> {
    const [plant] = await db
      .insert(plants)
      .values({
        ...insertPlant,
        status: insertPlant.status || 'active'
      })
      .returning();
    return plant;
  }

  async updatePlant(id: number, updates: Partial<Plant>): Promise<Plant | undefined> {
    const [plant] = await db
      .update(plants)
      .set(updates)
      .where(eq(plants.id, id))
      .returning();
    return plant || undefined;
  }

  async searchPlants(query: string): Promise<Plant[]> {
    return await db.select().from(plants).where(ilike(plants.name, `%${query}%`));
  }
}

export const storage = new DatabaseStorage();
