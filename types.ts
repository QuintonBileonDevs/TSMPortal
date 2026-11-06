

export enum UserRole {
  TEACHER_AIDE = 'TEACHER_AIDE',
  TEACHER = 'TEACHER',
  SCHOOL_HEAD = 'SCHOOL_HEAD',
  SUB_REGIONAL_OFFICER = 'SUB_REGIONAL_OFFICER',
  REGIONAL_OFFICER = 'REGIONAL_OFFICER',
  // Fix: Added missing SUPER_ADMIN role to resolve type errors in constants, App, and components
  SUPER_ADMIN = 'SUPER_ADMIN',
 }

export enum AvailabilityStatus {
  ACTIVE = 'Active',
  STUDY_LEAVE = 'On Study Leave',
  MATERNITY_LEAVE = 'On Maternity Leave',
  SICK_LEAVE = 'Sick Leave'
}

export enum TransferStatus {
  PENDING = 'Pending',
  ENDORSED = 'Endorsed',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  PROCESSED = 'Processed'
}

export interface TeacherMovement {
  schoolName: string;
  startDate: string;
  endDate: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  gender?: 'Male' | 'Female';
  managedSchool?: string;
  managedRegion?: string;
  managedSubRegion?: string;
  profileComplete?: boolean;
  
  // Professional Fields
  botepcoAccreditation?: string;
  contact?: string;
  currentSchool?: string;
  dateIntoCurrentSchool?: string;
  dateIntoPost?: string;
  dateJoinedService?: string;
  designation?: string;
  idNumber?: string;
  physicalAddress?: string;
  postalAddress?: string;
  qualifications?: string[];
  region?: string;
  salaryScale?: string;
  status?: AvailabilityStatus | string;
  unionAffiliation?: string;
  
  // Movement History
  teacherMovement?: TeacherMovement[];
  
  // Emergency Contacts
  emergencyContactName?: string;
  emergencyContactNo?: string;
  emergencyContactRelation?: string;
}

export interface Teacher extends User {
  surname: string; // Legacy field for some components
}

export interface School {
  id: string;
  name: string;
  centreNumber: string;
  registrationNumber: string;
  phone: string;
  email: string;
  subRegion: string;
  region: string;
  location: string;
}

export interface Posting {
  id: string;
  teacherId: string;
  schoolName: string;
  startDate: string;
  endDate?: string;
  position: string;
}

export interface PerformanceRecord {
  year: number;
  score: number;
  comments: string;
}

export interface Vacancy {
  id: string;
  schoolName: string;
  region: string;
  subject: string;
  salaryScale: string;
  grade: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'TRANSFER' | 'VACANCY' | 'SYSTEM' | 'ACTION_REQUIRED';
}
