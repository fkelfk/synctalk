export type CreateRoomFields = {
    title: string
    description: string
}

export type JoinRoomFields = {
    roomId: string
}

export type RejoinRoomFields = {
    roomId: string
    userId: string
    name: string
}