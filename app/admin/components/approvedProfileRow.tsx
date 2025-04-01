import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Check, X } from "lucide-react";

// Define the profile type
export interface Profile {
  id: string;
  anuBandhId: string;
  name: string;
  mobileNumber: string;
  email: string;
  dateOfBirth?: string;
  birthTime?: string;
  birthPlace?: string;
  education?: string;
  photo?: string;
  approvalStatus: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile1 {
  id: string;
  anubandhId: string;
  attendeeCount: number;
  name: string;
  mobileNumber: string;
  email: string;
  dateOfBirth?: string;
  birthTime?: string;
  birthPlace?: string;
  education?: string;
  photo?: string;
  permanentAddress?: string;
  currentAddress?: string;
  approvalStatus: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApprovedProfileRowProps {
  profile: Profile;
}

const ApprovedProfileRow: React.FC<ApprovedProfileRowProps> = ({ profile }) => {
  return (
    <TableRow key={profile.id}>
      <TableCell className="font-medium">{profile.name}</TableCell>
      <TableCell>{profile.anuBandhId}</TableCell>
      <TableCell>{profile.email}</TableCell>
      <TableCell>{profile.mobileNumber}</TableCell>
      <TableCell>{profile.birthPlace || "N/A"}</TableCell>
      <TableCell>{profile.education || "N/A"}</TableCell>
      <TableCell>
        {profile.approvalStatus === true ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : (
          <X className="h-5 w-5 text-red-500" />
        )}
      </TableCell>
    </TableRow>
  );
};

export default ApprovedProfileRow;
