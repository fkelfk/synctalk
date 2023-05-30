export type CreateRoomFields = {
  title: string;
  description: string;
  topic: string
};

export type JoinRoomFields = {
  roomID: string;
};

export type RejoinRoomFields = {
  roomID: string;
  userID: string;
  name: string;
};
export type CreateRoomData = {
  roomID: string;
  topic: string;
  userID: string;
};

export type AddParticipantFields = {
  roomID: string;
  userID: string;
  name: string;
};

export type AddParticipantData = {
  roomID: string;
  userID: string;
  name: string;
};

