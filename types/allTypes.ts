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