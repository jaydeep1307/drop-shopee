export interface JwtPayload {
  id: number;
  userId: string;
  email: string;
}

export interface JwtTokenInterface {
  _id: string;
  email: string;
}

export interface BidSlot {
  slotPrice: number;
  slotUnits: number;
  remainingUnits: number;
}

export interface BidUser {
  userId: string;
  investedAmount: number;
}

export interface WinnerUser {
  _id: string;
  name: string;
}
