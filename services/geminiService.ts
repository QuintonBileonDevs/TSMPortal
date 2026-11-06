import { GoogleGenAI } from "@google/genai";
import { Teacher, School } from "../types";

// Helper to safely get the Gemini client using environment variables
const getGeminiClient = (): GoogleGenAI | null => {
  const apiKey =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_API_KEY) ||
    (typeof process !== "undefined" && (process.env?.VITE_GEMINI_API_KEY || process.env?.API_KEY || process.env?.GEMINI_API_KEY)) ||
    "";

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return null;
  }

  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn("Could not initialize GoogleGenAI client:", err);
    return null;
  }
};

const buildFallbackTransferLetter = (teacher: Teacher, reason: string, targetSchool: string): string => {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return `REPUBLIC OF BOTSWANA
MINISTRY OF BASIC EDUCATION
DEPARTMENT OF TEACHING SERVICE MANAGEMENT

Date: ${today}
Ref: TSM/TRF/${teacher.employeeNumber || teacher.idNumber || '2026/01'}

To: The Director
Department of Teaching Service Management
Ministry of Basic Education
Private Bag 00206
Gaborone, Botswana

UFS: The School Head, ${teacher.currentSchool}

Dear Sir/Madam,

APPLICATION FOR LATERAL TRANSFER: ${teacher.name.toUpperCase()} ${teacher.surname.toUpperCase()}
POST: ${teacher.designation.toUpperCase()} (SALARY SCALE: ${teacher.salaryScale})

1. The above matter refers.

2. I am writing to formally submit my request for a lateral transfer from my current posting at ${teacher.currentSchool} to ${targetSchool}.

3. Ground and Justification:
${reason}

4. I remain deeply committed to the service and the highest standards of education in Botswana. I believe this transfer will allow for optimal professional contribution while accommodating personal welfare.

5. Attached please find copies of my qualifications, appraisals, and service record.

Yours faithfully,

_______________________
${teacher.name} ${teacher.surname}
Omang / ID: ${teacher.idNumber || 'On Record'}
Station: ${teacher.currentSchool}`;
};

const buildFallbackAdministrativeLetter = (school: School, topic: string, context: string): string => {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return `REPUBLIC OF BOTSWANA
MINISTRY OF BASIC EDUCATION
${school.name.toUpperCase()}
Centre Number: ${school.centreNumber}
Region: ${school.region}

Date: ${today}
Savingram Ref: BE/${school.centreNumber || 'SCH'}/ADM/2026

To: The Director
Department of Teaching Service Management
Private Bag 00206, Gaborone

UFS: Regional Director, Education Operations (${school.region} Region)

Dear Sir/Madam,

RE: ${topic.toUpperCase()}

1. The above-captioned subject matter refers.

2. This correspondence serves to officially submit an administrative requisition regarding educational staffing operations at ${school.name}.

3. Requisition Context & Needs:
${context}

4. We respectfully solicit your favorable intervention and necessary administrative guidance on this matter at your earliest convenience to maintain curriculum delivery standards.

Yours in Education Service,

_______________________
School Head
${school.name}
${school.region} Region, Botswana`;
};

export const generateTransferLetter = async (teacher: Teacher, reason: string, targetSchool: string) => {
  const ai = getGeminiClient();

  if (!ai) {
    return buildFallbackTransferLetter(teacher, reason, targetSchool);
  }

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
    Use a formal tone suitable for government correspondence in Botswana. 
    Include placeholders for [Date] and [Signature].
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    return response.text || buildFallbackTransferLetter(teacher, reason, targetSchool);
  } catch (error) {
    console.warn("Gemini generation fallback used:", error);
    return buildFallbackTransferLetter(teacher, reason, targetSchool);
  }
};

export const generateAdministrativeLetter = async (school: School, topic: string, context: string) => {
  const ai = getGeminiClient();

  if (!ai) {
    return buildFallbackAdministrativeLetter(school, topic, context);
  }

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
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    return response.text || buildFallbackAdministrativeLetter(school, topic, context);
  } catch (error) {
    console.warn("Gemini generation fallback used:", error);
    return buildFallbackAdministrativeLetter(school, topic, context);
  }
};
