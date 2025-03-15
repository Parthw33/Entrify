export interface UserProfile {
    id: string;
    anuBandhId: string;
    name: string;
    mobileNumber: string;
    email: string;
    dateOfBirth?: string;
    birthTime?: string;
    birthPlace?: string;
    education?: string;
    aboutYourself?: string;
    photo?: string;
    approvalStatus: boolean;
    createdAt: string;
    updatedAt: string;
  }

  export interface Profile {
    id: string;
    anuBandhId: string;
    name: string;
    mobileNumber: string;
    email: string;
    dateOfBirth: string; // ISO date format
    birthTime: string;
    birthPlace: string;
    education: string;
    photo: string; // URL of the photo
    createdAt: string; // ISO timestamp
    updatedAt: string; // ISO timestamp
    approvalStatus: boolean;
  }
  