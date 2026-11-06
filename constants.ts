
import { UserRole, AvailabilityStatus, Teacher, User, TransferStatus, School } from './types';

export const MOCK_USERS: User[] = [
  { id: 'T1001', name: 'Boipelo Molefe', email: 'boipelo.molefe@gov.bw', role: UserRole.TEACHER },
  { id: 'H2002', name: 'Mr. Segwagwa', email: 'head.seg@gov.bw', role: UserRole.SCHOOL_HEAD, managedSchool: 'Gaborone Secondary School' },
  { id: 'S2003', name: 'Officer Masenya', email: 'sub.masenya@gov.bw', role: UserRole.SUB_REGIONAL_OFFICER, managedSubRegion: 'Gaborone South' },
  { id: 'R3003', name: 'Director Tlou', email: 'reg.tlou@gov.bw', role: UserRole.REGIONAL_OFFICER, managedRegion: 'South East' },
  { id: 'A4004', name: 'Admin One', email: 'admin@gov.bw', role: UserRole.SUPER_ADMIN }
];

export const MOCK_TEACHER: Teacher = {
  id: 'T1001',
  name: 'Boipelo Molefe',
  surname: 'Molefe',
  role: UserRole.TEACHER, // Fix: Add missing role property
  idNumber: '123456789',
  email: 'boipelo.molefe@gov.bw',
  contact: '+267 71000000',
  salaryScale: 'C3',
  designation: 'Senior Teacher I',
  qualifications: ['Bachelor of Education (Science)', 'Postgraduate Diploma in Admin'],
  status: AvailabilityStatus.ACTIVE,
  currentSchool: 'Gaborone Secondary School',
  region: 'South East',
  dateJoinedService: '2015-01-15',
  dateIntoPost: '2020-02-01',
  dateIntoCurrentSchool: '2020-02-01',
  botepcoAccreditation: 'BPC-2024-8821',
  unionAffiliation: 'BTU',
  postalAddress: 'P.O. Box 101, Gaborone',
  physicalAddress: 'Plot 442, Phase 2, Gaborone'
};

export const MOCK_SCHOOL: School = {
  id: 'S001',
  name: 'Gaborone Secondary School',
  centreNumber: 'GS-102',
  registrationNumber: 'MOE/REG/772',
  phone: '+267 395 1234',
  email: 'gaborone.sec@gov.bw',
  subRegion: 'Gaborone South',
  region: 'South East',
  location: 'Gaborone West Phase 1'
};

export const MOCK_POSTINGS = [
  { id: 'P1', teacherId: 'T1001', schoolName: 'Molepolole Secondary', startDate: '2015-01-15', endDate: '2017-12-31', position: 'Assistant Teacher' },
  { id: 'P2', teacherId: 'T1001', schoolName: 'Lobatse High', startDate: '2018-01-01', endDate: '2020-01-31', position: 'Teacher' },
  { id: 'P3', teacherId: 'T1001', schoolName: 'Gaborone Secondary School', startDate: '2020-02-01', position: 'Senior Teacher I' }
];

export const MOCK_PERFORMANCE = [
  { year: 2021, score: 85 },
  { year: 2022, score: 88 },
  { year: 2023, score: 92 }
];

export const MOCK_VACANCIES = [
  { id: 'V1', schoolName: 'Maun Secondary', region: 'North West', subject: 'Mathematics', salaryScale: 'C3', grade: 'Senior' },
  { id: 'V2', schoolName: 'Francistown High', region: 'North East', subject: 'Physics', salaryScale: 'C3', grade: 'Senior' },
  { id: 'V3', schoolName: 'Kanye Senior', region: 'Southern', subject: 'Chemistry', salaryScale: 'C3', grade: 'Senior' }
];

export const MOCK_TRANSFER_REQUESTS = [
  { 
    id: 'TR-001', 
    teacherName: 'Kabo Segwagwa', 
    targetSchool: 'Maun Secondary', 
    subject: 'History', 
    status: TransferStatus.PENDING, 
    date: '2024-05-18', 
    reason: 'Family reunification. Spouse relocated to Maun for a government position.' 
  },
  { 
    id: 'TR-002', 
    teacherName: 'Lesedi Phiri', 
    targetSchool: 'Francistown High', 
    subject: 'English', 
    status: TransferStatus.PENDING, 
    date: '2024-05-20', 
    reason: 'Medical support requirements for child undergoing specialized treatment in Francistown.' 
  }
];
