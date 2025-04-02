import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Check, X } from "lucide-react";

// Define the profile type
export interface Profile {
  id: string;
  anubandhId: string;
  name: string;
  mobileNumber: string;
  gender: string;
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
  gender?: string;
}

interface ApprovedProfileRowProps {
  profile: Profile;
}

const ApprovedProfileRow: React.FC<ApprovedProfileRowProps> = ({ profile }) => {
  return (
    <TableRow key={profile.id}>
      <TableCell>{profile.anubandhId}</TableCell>
      <TableCell className="font-medium whitespace-nowrap">
        {profile.name}
      </TableCell>
      <TableCell>{profile.gender}</TableCell>
      <TableCell>{profile.mobileNumber}</TableCell>
      <TableCell className="font-medium whitespace-nowrap">
        {profile.birthPlace || "N/A"}
      </TableCell>
      <TableCell>{profile.education || "N/A"}</TableCell>
      <TableCell>{profile.email}</TableCell>
      <TableCell className="items-center justify-center">
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
