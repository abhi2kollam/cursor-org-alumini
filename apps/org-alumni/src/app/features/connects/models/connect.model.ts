import { User } from '../../../core/services/user.service';

export interface AlumniProfile extends User {
  // Additional profile fields can be added here
  // These would be specific to the alumni network functionality
  skills?: string[];
  bio?: string;
  currentCompany?: string;
  currentPosition?: string;
  yearsAtOrganization?: number;
  graduationYear?: number;
} 