export interface Participants {
    [participantID: string]: string;
}

export interface Chat {
    roomid: string
    topic: string
    adminID: string
    name: string
}

export interface ClusterNodes{
    host:string;
    port:number;
  }