export type BookingStatus = 'CONFIRMED' | 'RESERVE' | 'CANCELLED';

export interface Booking {
  id: string;
  peopleCount: number;
  binocularNeeded: boolean;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  excursion: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
  };
}

export interface CreateBookingRequest {
  peopleCount: number;
  binocularNeeded?: boolean;
  notes?: string;
}

export interface UpdateBookingRequest {
  peopleCount?: number;
  binocularNeeded?: boolean;
  status?: BookingStatus;
  notes?: string;
}

export interface BookingStats {
  totalBookings: number;
  confirmedPeople: number;
  reservePeople: number;
  availableSpots: number;
}



