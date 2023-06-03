
 import { Request } from 'express';

export interface Payload {
  id: number;
  username: string;
  authorities?: any[];
}

export interface ChatPayload1 {
  roomID: string;
  title: string;
  name: string;
}

export interface ChatPayload2 {
  subject: string;
}

export type ChatPayload = {
  userID: string;
  roomID: string;
  title: string;
  name: string
};

export type RequestWithAuth = Request & ChatPayload;