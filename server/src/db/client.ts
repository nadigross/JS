import "dotenv/config";
import { users, User, UserInsert, UserUpdate } from "./schema.js";
import { eq } from "drizzle-orm";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export class UserRepository {
  private db: PostgresJsDatabase;

  constructor(dbURL: string = process.env.DATABASE_URL!) {
    this.db = drizzle(postgres(dbURL));
  }

  async create(userData: UserInsert): Promise<User> {
    const result = await this.db.insert(users).values(userData).returning();
    return result[0];
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return result[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] || null;
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] || null;
  }

  async update(id: number, updates: UserUpdate): Promise<User | null> {
    if (Object.keys(updates).length === 0) {
      return this.findById(id);
    }

    const result = await this.db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    return result.length > 0;
  }

  async list(limit = 10, offset = 0): Promise<User[]> {
    return await this.db.select().from(users).limit(limit).offset(offset);
  }

  async count(): Promise<number> {
    const result = await this.db
      .select({ count: eq(users.id, users.id) })
      .from(users);
    return result.length;
  }
}
