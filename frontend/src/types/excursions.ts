export interface Excursion {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  meetingPoint?: string;
  meetingLatitude?: number;
  meetingLongitude?: number;
  capacity: number;
  reserve: number;
  guideId: string;
  guide: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  price?: number;
  duration?: number;
  difficulty: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  excursionCategories?: {
    id: string;
    category: {
      id: string;
      name: string;
      description?: string;
      color: string;
      icon?: string;
    };
  }[];
}

export interface CreateExcursionRequest {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  meetingPoint?: string;
  meetingLatitude?: number;
  meetingLongitude?: number;
  capacity: number;
  reserve?: number;
  guideId: string;
  price?: number;
  duration?: number;
  difficulty?: number;
  categoryIds?: string[];
}

export interface UpdateExcursionRequest {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  meetingPoint?: string;
  meetingLatitude?: number;
  meetingLongitude?: number;
  capacity?: number;
  reserve?: number;
  guideId?: string;
  price?: number;
  duration?: number;
  difficulty?: number;
  isActive?: boolean;
  categoryIds?: string[];
}
