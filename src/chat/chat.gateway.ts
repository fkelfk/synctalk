import { CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Cache } from 'cache-manager';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway(3131, {
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  users: number = 0;
  private readonly logger: Logger = new Logger('ChatGateway');

  constructor(private readonly chatService: ChatService) {}

  
  
  //OnGatewayConnection를 오버라이딩
  async handleConnection() {
    this.users++; //사용자 증가
    this.server.emit('users', this.users);
    console.log(this.users);
  }

  //OnGatewayDisconnect를 오버라이딩
  async handleDisconnect() {
    this.users--; //사용자 감소
    this.server.emit('users', this.users);
    console.log(this.users);
  }

  @SubscribeMessage('chat')
  onChat(client: Socket, message){
    // try{
    //       // console.log(client.rooms)  //현재 클라이언트의 방
    // // this.server.on()
    // // console.log(this.server)    //메시지
    // // const createMessage = await this.
    // // console.log(client)
    // client.broadcast.emit('chat', message);
    // console.log(message);
    // // try{
    // // this.chatService.set(message.test,message.data,1000)}
    // // catch (err) {
    // //         this.logger.error(err)
    // //         throw new WsException(err)
    // //     }
    // // // this.chatService.set(message.test, message.data)
    // //전체에게 방송함
    // console.log('---------------------') 
    // const test = await this.chatService.setCache(message.test, message.data)
    // console.log(test)
    // console.log('---------------------') 
    // const test2 = await this.chatService.getCache(message.test)
    // console.log(test2)

    // // const cacheSet= await this.chatService.set(message.test, message.data);
    // console.log('---------------------')
    // // console.log(cacheSet)
    // }catch(err){
    //   console.error(err);
    // }
    console.log(client)
    this.chatService.getCache()
    client.emit('chat', message);
    console.log(message);
    console.log('---------------------')
    // await this.chatService.setCache(message.data,message.data)
    // this.chatService.getCache();
    // return message.data

    console.log('---------------------')
    // await this.chatService.getCache(message.data)
    // test.then(()=>{console.log('hi')})
    // console.log('---------------------', test)
    // this.cacheManager.get(message.test)
    // console.log('---------------------')

  }
  

}
