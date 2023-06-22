export type CreateRoomFields = {
  title: string;
  description: string;
  name: string
};

export type JoinRoomFields = {
  roomID: string;
  name: string
};

export type RejoinRoomFields = {
  userID: string;
  roomID: string;
  title: string;
  name: string
};
export type CreateRoomData = {
  roomID: string;
  title: string;
  userID: string;
  name: string
};

export interface AddParticipantFields {
  roomID: string;
  userID: string;
  title: string;
  name: string
};

export type AddParticipantData = {
  roomID: string;
  userID: string;
  name: string;
};

export interface RemoveParticipantData {
  roomID: string;
  userID: string;
}