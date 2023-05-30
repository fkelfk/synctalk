export interface Participants {
    [participantID: string]: string;
}

export interface Chat {
    id: string
    topic: string
    adminID: string
}

export interface ClusterNodes{
    host:string;
    port:number;
  }