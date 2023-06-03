export interface Participants {
    [participantID: string]: string;
}

export interface Chat {
    roomid: string
    title: string
    adminID: string
    name: string
}

export interface ClusterNodes{
    host:string;
    port:number;
  }