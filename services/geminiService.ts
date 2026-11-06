
import { GoogleGenAI } from "@google/genai";
import { Teacher, School } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTransferLetter = async (teacher: Teacher, reason: string, targetSchool: string) => {
  const prompt = `
    Generate a formal professional transfer request letter for a teacher in Botswana.
    Details:
    - Teacher Name: ${teacher.name} ${teacher.surname}
    - Current Post: ${teacher.designation} at ${teacher.currentSchool}
    - Salary Scale: ${teacher.salaryScale}
    - Target School: ${targetSchool}
    - Reason: ${reason}
    
    The letter should be addressed to the Director of Teaching Service Management. 
    IMPORTANT: For the routing channel, you MUST use "UFS" (Under Flying Seal) instead of "Through" or "Thru" (e.g., UFS: School Head, [School Name]).
    Use a formal tone suitable for government correspondence. 
    Include placeholders for [Date] and [Signature].
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating letter:", error);
    return "Failed to generate letter automatically. Please use the manual template.";
  }
};

export const generateAdministrativeLetter = async (school: School, topic: string, context: string) => {
  const prompt = `
    Generate a formal professional administrative letter from a School Head in Botswana.
    School Details:
    - School: ${school.name}
    - Centre Number: ${school.centreNumber}
    - Region: ${school.region}
    
    Topic: ${topic}
    Context/Details: ${context}
    
    The letter should follow standard Botswana government correspondence formatting. 
    Address it appropriately based on the topic (e.g., to Regional Director or Director of TSM).
    IMPORTANT: Use "UFS" routing if applicable.
    Include standard salutations, a concise subject line, and formal closing.
    Include placeholders for [Date] and [Ref Number].
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating letter:", error);
    return "Failed to generate administrative letter. Error in AI synthesis.";
  }
};
