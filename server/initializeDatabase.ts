import { db } from "./db";
import { teams, users, plants } from "@shared/schema";

export async function initializeDatabase() {
  try {
    // Check if teams already exist
    const existingTeams = await db.select().from(teams);
    
    if (existingTeams.length === 0) {
      // Create default teams
      const defaultTeams = [
        { name: "Squadra A", leader: "Mario Bianchi", status: "available", currentLocation: "Base Operativa", nextAvailable: "Libera ora" },
        { name: "Squadra B", leader: "Luca Verdi", status: "available", currentLocation: "Base Operativa", nextAvailable: "Libera ora" },
        { name: "Squadra C", leader: "Giuseppe Rossi", status: "available", currentLocation: "Base Operativa", nextAvailable: "Libera ora" },
      ];

      await db.insert(teams).values(defaultTeams);
      console.log("Default teams created");
    }

    // Check if users already exist
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length === 0) {
      // Create default users
      const defaultUsers = [
        {
          username: "gestore",
          password: "admin123",
          role: "gestore",
          teamId: null
        },
        {
          username: "mario.bianchi",
          password: "squadra123",
          role: "operatore",
          teamId: 1
        },
        {
          username: "luca.verdi",
          password: "squadra123",
          role: "operatore",
          teamId: 2
        },
        {
          username: "giuseppe.rossi",
          password: "squadra123",
          role: "operatore",
          teamId: 3
        }
      ];

      await db.insert(users).values(defaultUsers);
      console.log("Default users created");
    }

    // Check if plants already exist
    const existingPlants = await db.select().from(plants);
    
    if (existingPlants.length === 0) {
      // Create default plants
      const defaultPlants = [
        { name: "Impianto Solare Nord", location: "Via Roma 123, Milano", capacity: "50 kW", installationDate: "2020-03-15", status: "active" },
        { name: "Impianto Fotovoltaico Sud", location: "Via Verdi 456, Roma", capacity: "100 kW", installationDate: "2019-07-22", status: "active" },
        { name: "Parco Solare Est", location: "Via Dante 789, Napoli", capacity: "200 kW", installationDate: "2021-01-10", status: "active" },
        { name: "Centrale Fotovoltaica Ovest", location: "Via Manzoni 321, Torino", capacity: "150 kW", installationDate: "2020-11-05", status: "active" },
        { name: "Impianto Residenziale Centro", location: "Via Garibaldi 654, Firenze", capacity: "25 kW", installationDate: "2022-02-28", status: "active" },
        { name: "Complesso Solare Industriale", location: "Via Leonardo 987, Bologna", capacity: "300 kW", installationDate: "2018-09-14", status: "maintenance" },
      ];

      await db.insert(plants).values(defaultPlants);
      console.log("Default plants created");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}