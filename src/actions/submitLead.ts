"use server";

import { promises as fs } from 'fs';
import path from 'path';

export async function submitLead(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;

  if (!name || !email || !phone) {
    return { success: false, message: "Missing required fields" };
  }

  const leadData = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    name,
    email,
    phone,
  };

  try {
    // 1. Log to the terminal console
    console.log("====== NEW LEAD RECEIVED ======");
    console.log(leadData);
    console.log("===============================");

    // 2. Save to a local JSON file
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'leads.json');

    // Ensure the data directory exists
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    let existingLeads = [];
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      existingLeads = JSON.parse(fileContent);
    } catch (e) {
      // File doesn't exist or is empty/invalid, start with empty array
    }

    existingLeads.push(leadData);
    await fs.writeFile(filePath, JSON.stringify(existingLeads, null, 2));

    return { 
      success: true, 
      message: "Consultation requested successfully!" 
    };
  } catch (error) {
    console.error("Failed to save lead:", error);
    return { 
      success: false, 
      message: "There was an error submitting your request. Please try again." 
    };
  }
}
