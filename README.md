# Sync Talk

````bash
yarn install
````

## Overview

![User Flow Design Flowchart Whiteboard in Blue Yellow Spaced Color Blocks Style1](https://github.com/fkelfk/synctalk/assets/96477657/097f354e-8ea8-4133-9c74-91ced4b8047b)

`NestJS`는 `Modular architecture`를 가지고 있어 재사용 가능한 Component로 쉽게 코드를 구성할 수 있습니다. 프로세스를 단순화하고 유지관리에 쉬워집니다.

일반적으로 `MySQL`과 `PostgreSQL` 모두에서에서 ACID 지원 제공하지만 `PostgreSQL`은 `Transactions`과 `Consistency`에서 강력한 지원을 제공하는 것으로 알려져 있으며, 이는 금융 시스템 또는 전자 상거래 사이트와 같은 특정 유형의 애플리케이션에 주요한 장점이 되어 사용하게 되었습니다.

---

## 구현 사항

### Config
#### Custom Repository
> Repository는 데이터 원본에 액세스하는 데 필요한 논리를 캡슐화하는 클래스 또는 구성 요소입니다. 공통 데이터 액세스 기능에 집중해 더 나은 유지관리를 제공하고 도메인 모델 계층에서 데이터베이스에 액세스하는 데 사용되는 기술이나 인프라를 분리합니다. Entity Framework와 같은 ORM(개체 관계 매핑)을 사용하는 경우 LINQ 및 강력한 형식화 덕분에 구현해야 할 코드가 간소화됩니다. 이렇게 하면 데이터 액세스 내부 작업보다 데이터 지속성 논리에 더 집중하게 합니다.

##### Process Flow
Repository가 없었다면 비즈니스 로직에서 직접 DB Context를 처리하여 데이터 원본에 액세스해 요청을 처리 합니다. 하지만 Repository가 존재하면  비즈니스 로직과 Repository간의 정해진 데이터 요청이 오가고 Repository는 해당 시점에 정해진 도메인에 대해 원본 데이터를 처리해 다시 비즈니스 로직에게 반환합니다.
##### Why?

`@nestjs/typeorm`의 버전이 8 로 넘어가며 `@EntityRepository`가 사라지고 기존 `Repository`를 상속하여 구현하는 것으로 변경되어 실제 구현에도 큰 차이가 있습니다. `Custom Repository`를 만들어 기존 `@EntityRepository` 를 대신하였습니다.

`TypeORM`을 사용하면서 데이터베이스의 테이블 값을 매핑하기 위해 `Entity`를 따로 만들어야합니다. 
`Entity`는 데이터베이스 영속성의 목적으로 사용 되는 객체입니다. 때문에 요청이나 응답 값을 전달하는 클래스로 사용하는 것은 좋지 않습니다. 대신 `DTO`를 사용해 로직단계에서 데이터를 나눠보내지 않고 객체에 담아 보내 효율적인 로직을 위해 사용했습니다.

### Setup

```tsx
import { SetMetadata } from "@nestjs/common";

export const TYPEORM_EX_CUSTOM_REPOSITORY = "TYPEORM_EX_CUSTOM_REPOSITORY";

export function CustomRepository(entity: Function): ClassDecorator {
  return SetMetadata(TYPEORM_EX_CUSTOM_REPOSITORY, entity);
}
```

`"TYPEORM_EX_CUSTOM_REPOSITORY"`가 `SetMetadata()`의 key값이 되고, `entity`가 value값이 됩니다.

기존엔 `@EntityRepository()`를 주입하였다면 `@CustomRepository`를 주입시켜 줍니다.

```tsx
import { Repository } from 'typeorm';
import { UserAuthority } from '../../domain/user-authority.entity';
import { CustomRepository } from '../../typeorm-ex.decorator';

@CustomRepository(UserAuthority)
export class UserAuthorityRepository extends Repository<UserAuthority> {}
```

`UserRepository` 에 적용시킵니다.

```tsx
import { Repository } from 'typeorm';
import { CustomRepository } from 'src/typeorm-ex.decorator';
import { UserEntity } from '../domain/user.entity';

@CustomRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {}
```

### Auth
#### JWT
> JSON Web Token(JWT)은 당사자 간의 정보를 JSON 객체로 안전하게 전송하기 위한 작고 독립적인 방법을 정의하는 개방형 표준입니다. JWT는 Secret(HMAC 알고리즘 사용) 또는 RSA 또는 ECDSA를 사용하여 공개/개인 키 쌍을 사용하여 서명할 수 있습니다.

##### Why?

JWT라는 기술이 있기전, 인증방식은 세션 / 세션&쿠키를 사용하여 사용자 인증을 했었습니다. 세션은 서버에서 payload와 같은 정보를 담고 있었고, 세션&쿠키는 클라이언트의 쿠키에서 고유값을 담고 있었습니다.

세션&쿠키방식을 선택했을때 서버의 성능을 늘리는 방식을 scale-out으로 할 경우 각 서버의 세션을 동기화 해야하는 비용이 추가적으로 발생 할 수 있습니다. 또한 사용자의 데이터를 서버의 메모리에 저장하기 때문에 메모리 용량에 대한 리스크가 있을 수 있습니다.

반대로 토큰은 Stateless 한 서버를 만드는 입장에서는 큰 강점입니다. Stateless는 상태(쿠키/세션 정보)를 저장하지 않아 서버를 확장하거나 유지/보수 하는데 유리합니다. 또한 확장성이 뛰어나 Google, Kakao와 같은 소셜계정을 이용한 로그인이 가능해집니다.

##### Process Flow
![Campaign Launch Brainstorm Whiteboard in Yellow Blue Purple Trendy Style4](https://github.com/fkelfk/synctalk/assets/96477657/7b27ac2f-2767-497a-b00f-5203424bbaa8)
1. 클라이언트가 로그인 정보를 Body에 실어서 (`@Body`를 이용) 서버에 보냅니다.
2. 서버는 DB에서 해당 로그인 정보를 확인합니다. (`AuthService`의 `validateUser()`)
3. 확인(검증)이 되면 JWT 토큰을 발급합니다. 컨트롤러의 `login()` 인자로 Response 객체를 받아옵니다.(`@Res`)
4. 발급된 JWT 토큰을 클라이언트가 받습니다.
5. 클라이언트는 인증이 필요한 요청마다 JWT 토큰을 헤더에 실어 보내게됩니다.

##### Setup

패키지 설치

```bash
yarn add @nestjs/jwt
```

JWT Module 등록

```tsx
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './security/passport.jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserAuthority]),
    TypeOrmExModule.forCustomRepository([
      UserRepository,
      UserAuthorityRepository,
    ]),
    JwtModule.register({
      secret: 'secret', //JWT Signature의 Secret 값 입력
      signOptions: { expiresIn: '3000s' }, // 토큰 만료 시간
    }),
  ],
  exports: [TypeOrmModule],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy],
})
export class AuthModule {}
```

Payload 생성

```tsx
export interface Payload {
  id: number;
  username: string;
}
```

validate이후 토큰 발급

```tsx
async validateUser(
    userDTO: UserDTO,
  ): Promise<{ accessToken: string } | undefined> {
    let userFind: UserEntity = await this.userService.findByFields({
      where: {
        username: userDTO.username,
      },
    });
    const validatePassword = await bcrypt.compare(
      userDTO.password,
      userFind.password,
    );
    if (!userFind || !validatePassword) {
      throw new UnauthorizedException();
    }
    this.convertInAuthorities(userFind);

    const payload: Payload = {
      id: userFind.id,
      username: userFind.username,
      authorities: userFind.authorities,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
```

controller에 등록
```ts
@Post('/login')
  async login(@Body() userDTO: UserDTO, @Res() res: Response): Promise<any> {
    const jwt = await this.authService.validateUser(userDTO);
    res.setHeader('Authorization', 'Bearer ' + jwt.accessToken);
    res.cookie('jwt', jwt.accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1day
    });
    return res.send({ message: 'success'});
```
#### Passport / Guard
##### Passport

> *Passport는 가장 널리 사용되는 node.js 인증 라이브러리이며 커뮤니티에서 잘 알려져 있으며 많은 프로덕션 응용 프로그램에서 성공적으로 사용됩니다. 또한 **다양한 인증 메커니즘을 구현하는 풍부한 전략생태계가 있습니다**. Passport는 이러한 다양한 단계를 표준 패턴으로 추상화하고, `@nestjs/passport` 모듈은 이 패턴을 친숙한 Nest 구성으로 랩핑하고 표준화합니다.*
> 

##### Guard

> *Guard는 단일 책임이 있습니다. 런타임에 존재하는 특정 조건 (권한, 역할, ACL 등)에 따라 지정된 요청이 라우트 핸들러에 의해 처리될 지 여부를 결정합니다. 인증은 일반적으로 기존 Express 응용 프로그램의 미들웨어에 의해 처리되었습니다. 그러나 미들웨어는 본질적으로 멍청합니다. `next()`함수를 호출한 후 어떤 핸들러가 실행될지 알 수 없습니다. 반면에 Guard는 `ExecutionContext` 인스턴스에 액세스할 수 있으므로 다음에 무엇이 실행 될지 정확히 알 수 있습니다. 요청/응답 주기의 정확한 시점에 처리 로직을 삽입하고 선언적으로 처리할 수 있도록 예외 필터, 파이프 및 인터셉터와 같이 설계되었습니다. 이렇게 하면 코드를 건조하고 선언적으로 유지할 수 있습니다.*
>


##### Why?

Passport를 이용해 카카오, 구글, 네이버 등 각각의 소셜 인증방법을 어느 정도 통일화 시킬수 있습니다. 또한 팀 작업시 생산성과 유지보수가 쉬워집니다. Passport의 약속된 규칙과 잘 만들어진 문서가 존재해 기능에 대한 협의시간을 줄일 수 있습니다.


##### Process Flow
![Campaign Launch Brainstorm Whiteboard in Yellow Blue Purple Trendy Style1](https://github.com/fkelfk/synctalk/assets/96477657/326eaf3f-67b9-4f56-b084-298d3c9a822a)
1. 사용자 이름/암호, JWT 또는 ID 제공자의 ID 토큰과 같은 "자격 증명"을 확인하여 사용자 인증합니다.
2. Route Handlers에서 사용하도록 인증된 사용자에 대한 정보를 요청 객체에 첨부합니다.

##### Setup

```tsx
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Payload } from './payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: 'secret'
    });
  }

  async validate(payload: Payload, done: VerifiedCallback): Promise<any> {
    const user = await this.authService.tokenValidateUser(payload);
    if (!user) {
      return done(
        new UnauthorizedException({ message: 'user does not exist' }),
        false,
      );
    }

    return done(null, user);
  }
}
```

Passport Strategy엔 `validate()`메서드를 사용하고 파라미터로는 `Payload`와 `VerifiedCallback`을 받아옵니다.

`AuthService`의 `tokenValidateUser(payload)`를 통해 유효한 유저 객체를 받아오고, 해당 유저가 존재하지 않을 시 `PassportStrategy`에서 정의되어 있는 `VerifiedCallback`을 사용하여 에러반환과 `false`를 인자로 담아줍니다.

만약 유저 객체가 있다면 마찬가지로 `VerifiedCallback`을 반환하는데 이땐 에러를 나타내는 첫 번째 인자에 `null`을, 두 번째엔 `user`를 반환해 줍니다.

```tsx
import { Module } from '@nestjs/common';
.
.
.

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmExModule.forCustomRepository([UserRepository]),
    JwtModule.register({
      secret: 'SECRET_KEY',
      signOptions: {expiresIn: '300s'},
    }),
    PassportModule,
  ],
  exports: [TypeOrmModule, TypeOrmExModule],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy],
})
export class AuthModule {}
```

`AppModule`에 `PassportModule`을 import하고 `JwtStrategy`를 프로바이더로 등록해줍니다.

```tsx
export interface Payload {
  id: number;
  username: string;
  authorities?: any[];
}
```

기존 페이로드 인터페이스에 authorities를 추가해줍니다. (`UserEntity`에 authorities추가 선행필요)

```tsx
export enum RoleType {
  USER = 'ROLE_USER',
  ADMIN = 'ROLE_ADMIN',
}
```

`RoleType`을 `enum` 객체를 사용하여 생성합니다.

```tsx
import { SetMetadata } from '@nestjs/common';
import { RoleType} from '../role-type'

export const Roles = (...roles: RoleType[]): any => SetMetadata('roles', roles);
```

`RoleType`을 읽어올 수 있는 데코레이터를 생성합니다.

```tsx
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserEntity } from '../../domain/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as UserEntity;

    return (
      user &&
      user.authorities &&
      user.authorities.some((role) => roles.includes(role))
    );
  }
}
```

`RoleGuard`를 생성합니다.

```tsx
@Post('/create')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.USER)
  async createRoom(@Req() req, @Body() room: RoomDTO): Promise<RoomEntity> {
    const user = req.user;
    return await this.roomsService.createRoom(room, user.id);
  }
```

`Controller`에 적용해줍니다.

#### OAuth 
> *OAuth는 인터넷 사용자들이 비밀번호를 제공하지 않고 다른 웹사이트 상의 자신들의 정보에 대해 웹사이트나 애플리케이션의 접근 권한을 부여할 수 있는 공통적인 수단으로서 사용되는, 접근 위임을 위한 개방형 표준이다.*
> 

##### Why?

특정 앱이나 웹에서 개인정보를 제공하지 않고 신뢰되는 기업을 통해서 서비스를 이용하기 위해 사용합니다. 클릭 한 번으로 간편하게 로그인할 수 있을 뿐만 아니라, 연동되는 외부 웹 어플리케이션에서 기업에서 제공하는 기능을 간편하게 사용할 수 있다는 장점이 있습니다.

##### Process Flow
![ouath112](https://github.com/fkelfk/synctalk/assets/96477657/f10495fc-eb21-41f3-8fcd-21525b4af44b)

1. 클라이언트가 카카오 로그인 요청을 하면 서버는 카카오 서버에게 클라이언트의 요청을 보냅니다.
2. 클라이언트는 사용의 동의를 응답하고 카카오서버에서 클라이언트에게 인증코드를 발급합니다.
3. 인증코드와 서버에있는 클라이언트 아이디로 카카오서버에 토큰을 요청합니다.
4. 토큰받으면 다시 카카오서버에 유저데이터를 요청하고 받은 유저데이터를 토대로 JWT토큰을 발급합니다.

##### Setting up

```tsx
@Post('/kakao')
  async kakao(@Body() body: any, @Res() res: Response): Promise<any> {
      try {
      // 카카오 토큰 조회 후 계정 정보 가져오기
      const { code, domain } = body;
      if (!code || !domain) {
          throw new BadRequestException('카카오 정보가 없습니다.');
      }
      const kakao = await this.authService.kakaoLogin({ code, domain });

      console.log(`kakaoUserInfo : ${JSON.stringify(kakao)}`);
      if (!kakao.id) {
          throw new BadRequestException('카카오 로그인 실패.');
      }

      const jwt = await this.authService.login(kakao);

      res.send({
          accessToken: jwt.accessToken,
          message: 'success',
      });
      } catch (e) {
          console.log(e);
          throw new UnauthorizedException();
      }
  }
```

`Controller`에 `kakao` 를 추가해주었습니다.

```tsx
async kakaoLogin(options: { code: string; domain: string }): Promise<any> {
    const { code, domain } = options;
    const kakaoKey = process.env.KAKAO_KEY;
    const kakaoTokenUrl = 'https://kauth.kakao.com/oauth/token';
    const kakaoUserInfoUrl = 'https://kapi.kakao.com/v2/user/me';
    const body = {
      grant_type: 'authorization_code',
      client_id: kakaoKey,
      redirect_uri: `${domain}/kakao-callback`,
      code,
    };
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    try {
      const response = await axios({
        method: 'POST',
        url: kakaoTokenUrl,
        timeout: 30000,
        headers,
        data: qs.stringify(body),
      });
      const headerUserInfo = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        Authorization: 'Bearer ' + response.data.access_token,
      };
      const responseUserInfo = await axios({
        method: 'GET',
        url: kakaoUserInfoUrl,
        timeout: 30000,
        headers: headerUserInfo,
      });
      console.log(responseUserInfo);
      if (responseUserInfo.status === 200) {
        return responseUserInfo.data;
      } else {
        throw new UnauthorizedException();
      }
    } catch (error) {
      console.log(error);
    }
  }
```

`authService`에 `kakaologin`추가합니다.

```tsx
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<string>('server.port');
  app.use(cookieParser());
  const whitelist = ['http://localhost:3000'];
  app.enableCors({
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    allowedHeaders: '*',
    methods: 'GET,PUT,PATCH,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
  });
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();
```

`CORS`를 해결하기 위해 `main.ts`에 설정을 추가합니다.

### Chat
#### Redis Cluster
##### Redis

> Redis는 Remote Dictionary Server의 약자로, 오픈소스인 인메모리 데이터 구조 저장소입니다.
> 

##### Why?

기존 `DB`로 `Postgresql`를 사용하고 있었고 채팅로그를 저장하기 위해 `Disk Storage`인 `Postgresql`을 사용하기엔 너무 많은 `DB I/O`가 발생하지 않을까란 생각에 `In-memory DB`를 사용하게 되었다.

`In-memory DB`를 선택하는 과정에서 `Redis`와 `Memcached`를 비교하게 되는데 `Redis`는 다양한 데이터 타입, 확장성, 활발한 커뮤니티와 생태계 등 다양한 부분에서 우위를 가지고 있다.

실제로 알아본 `Redis`는 자주 액세스하는 데이터를 메모리에 저장할 수 있으므로 디스크 기반 스토리지보다 훨씬 빠르게 액세스하여 걸리는 시간을 줄이고 백엔드 데이터베이스의 부하를 줄인다. 이는 `Chat App`에서 실시간으로 대화를 주고받는 데 매우 중요한 요소이다.

또한 `Redis`에서는 데이터를 캐싱함으로써 백엔드 데이터베이스의 로드를 줄여 데이터베이스 과부하 위험을 줄일 수 있다. 또한 동일한 양의 트래픽을 처리하는 데 더 적은 리소스가 필요로 한다.

`Redis`는 데이터를 쉽게 `scale out`할 수 있어 `Chat App`에서 대규모 트래픽을 처리하는 데 적합하다.

##### Redis Cluster

> 하나의 테이블에 저장되는 데이터를 2개 이상의 서버로 동시에 분산 저장 하는 방법을 샤딩이라고 합니다. 샤딩을 통해 데이터를 분산 저장하다보면 장애가 생겨되어 데이터 유실이 발생할 수 있는데 이를 방지하기 위해 분산 서버마다 복제 서버를 함께 구축해서 운영하게 됩니다. 이와 같이 데이터 분산 처리를 위한 샤딩과 안정성 확보를 위한 복제 시스템은 함께 사용될 수 밖에 없는데 이를 Redis 클러스터 라고 표현합니다.
> 

##### Why?

`Redis`를 공부하던 중 `Redis Cluster`를 알게 되었고 좋아 보이는 것은 써봐야지 하는 호기심으로 Cluster를 구성하게 되었다.

`Redis Custer`를 사용하여 위에서 나열한 `Redis`의 이점을 활용하는 동시에 영속성과 확장성을 보장한다.

먼저 `Redis cluster`는 `Master-Slave`구조를 통해 영속성을 보장한다. `slave`는 `master`의 데이터를 복제하고 `master` 장애 발생 시 `slave`가 `master`로 승격하여 `cluster`를 유지한다.

`Redis cluster`는 데이터를 여러 `Redis node`로 분할할 수 있도록 하여 수평으로 확장하는 방법을 제공한다. 서버의 자원을 업그레이드 하는 `Scale-up` 방식과 별도의 서버를 추가하는 `Scale-out` 방식이 있다. `Scale-up`의 경우 서버의 조건에 따라 매우 제한적이므로 보통 `Scale-out`을 을 사용한다.

##### Set Up

##### Step.1

로컬에서 클러스터 구성에 성공하고 컨테이너화 하기 위해 로컬의 설정 그대로 `.yaml`파일로 만들고 클러스터를 구성해 주는 과정에서 `Connection refused`오류가 발생했다.

컨테이너에서 컨테이너로 연결이 되어 있지 않다라는 것을 확인했고 network를 따로 설정해 주었다.

```yaml
docker-compose.yaml

version: '3.7'
services:
  node01:
    image: redis:7.0.4
    container_name: redis01
    restart: always
    ports:
      - 7001:7001
    volumes:
      - ./cluster/node01.conf:/etc/redis/redis.conf
    command:
      redis-server /etc/redis/redis.conf
    networks:
      redis_cluster:
        ipv4_address: 173.17.0.2

  node02:
    image: redis:7.0.4
    .
    .
    .

  node06:
    image: redis:7.0.4
    container_name: redis06
    restart: always
    ports:
      - 7006:7006
    volumes:
      - ./cluster/node06.conf:/etc/redis/redis.conf
    command:
      redis-server /etc/redis/redis.conf
    networks:
      redis_cluster:
        ipv4_address: 173.17.0.7

  redis_cluster:
    image: redis:7.0.4
    container_name: redis_cluster
    platform: linux/arm64/v8
    command: redis-cli --cluster create 173.17.0.2:7001 173.17.0.3:7002 173.17.0.4:7003 173.17.0.5:7004 173.17.0.6:7005 173.17.0.7:7006 --cluster-yes --cluster-replicas 1
    depends_on:
      - node01
      - node02
      - node03
      - node04
      - node05
      - node06
    networks:
      redis_cluster:
        ipv4_address: 173.17.0.8
networks:
  redis_cluster:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 173.17.0.0/24
```

기본적으로 각 `Docker Container`들은 `Bridge Network`를 공유 한다. 위의 설정을 통해 `network`를 따로 설정해 주었고 정상적으로 `Cluster`를 구성 했다. 컨테이너간 연결도 확인 됐다.

- 각 레디스 노드들이 하나의 네트워크를 공유하고 있습니다.
- 레디스 클러스터는 현재 네트워크 주소 변환(Network Address Transport, NAT)된 환경 또는 IP주소 / TCP 포트를 재맵핑하는 환경을 지원하지 않습니다.
- 도커는 컨테이너 내부에서 실행되는 프로그램을 특정 외부 포트로 노출할 수 있는 “포트 매핑” 기술을 사용하고 있으며, 이는 여러 컨테이너가 동일한 포트를 가지는 상황을 해결하는 데에 유용하게 사용되고 있습니다.
- 도커 상에서 실행하는 레디스 컨테이너들이 레디스 클러스터에 호환하도록 하기 위해서는 “host” 네트워크 모드를 사용하는 것을 필요로 합니다.
- host 네트워크모드는 포트 매핑을 통해 주소를 변환하지 않고, 컨테이너가 호스트 네트워크를 곧바로 사용하도록 합니다.
- 하지만 리눅스 호스트 환경이 아닌 경우에는 host 네트워크 모드는 지원되지 않습니다. ex) Docker Desktop for Mac, Docker Desktop for Windows
- host 모드를 켜지 않고, 각 레디스 노드에 대한 포트가 한번에 매핑된 하나의 **동일한 네트워크를 각 노드가 공유**하도록 구성하였습니다.


##### Step.2

`ioredis`공식문서와 `stackoverflow`를 전전하던 중 비슷한 경험을 한 [질문](https://stackoverflow.com/questions/75047758/ioredis-cannot-connect-to-redis-cluster-running-in-docker)을 발견하고 `natmap`설정을 맞춰주었다

```tsx
 ClusterModule.forRoot({
      readyLog: true,
      errorLog: true,
      config: {
        scaleReads: 'slave',
        nodes: [
          { host: '127.0.0.1', port: 7001 },
          { host: '127.0.0.1', port: 7002 },
          { host: '127.0.0.1', port: 7003 },
        ],
        natMap: {
          '173.17.0.2:7001': {
            host: '127.0.0.1',
            port: 7001,
          },
          '173.17.0.3:7002': {
            host: '127.0.0.1',
            port: 7002,
          },
          '173.17.0.4:7003': {
            host: '127.0.0.1',
            port: 7003,
          },
          '173.17.0.5:7004': {
            host: '127.0.0.1',
            port: 7004,
          },
          '173.17.0.6:7005': {
            host: '127.0.0.1',
            port: 7005,
          },
          '173.17.0.7:7006': {
            host: '127.0.0.1',
            port: 7006,
          },
        },
      },
    }),
```

> ioredis의 natMap 옵션을 사용하면 클러스터의 각 Redis 서버에 대한 퍼블릭 및 프라이빗 IP 주소와 포트 간의 매핑을 지정. ioredis를 사용하여 Redis 클러스터에 연결하면 클라이언트는 natMap을 사용하여 공용 IP 주소 및 포트를 개인 IP 주소 및 포트로 변환한 다음 개인 주소 및 포트를 사용하여 Redis 서버에 연결.
> 

설정을 완료하고 로그를 찍어 `Cluster`를 확인해보니 상태는 `ready`로 나왔다. 정상적으로 메소드가 실행되는 것을 확인했다.

추가 설명 
https://velog.io/@atesi/Nestjs-Redis-Dynamic-Module

### Socket.IO
> Socket.IO는 클라이언트와 서버 간의 대기 시간, 양방향 및 이벤트 기반 통신을 가능하게하는 라이브러리입니다. WebSocket 프로토콜 위에 구축되었으며 HTTP long-polling 또는 자동 재연결에 대한 폴백과 같은 추가적인 보장을 제공한다.

##### Why?

채팅 응용 프로그램은 사용자 간의 실시간 통신이 필요하며 `Socket.IO`는 `WebSocket`과 기타 기술의 조합을 사용하여 클라이언트와 서버가 메시지를 교환하는 빠르고 안정적인 방법을 제공합니다.

안정성 측면에서는 네트워크 문제나 기타 문제가 있는 경우에도 메시지가 안정적으로 전달되도록 ****`Heartbeat`라는 기술을 사용하여 클라이언트와 서버 간의 연결을 정기적으로 확인하고 열린 상태로 유지되고 응답하는지 확인합니다.

`WebSocket`은 전이중 통신을 허용합니다. 즉, 메시지를 양방향으로 동시에 보낼 수 있습니다. 이를 통해 클라이언트와 서버는 큰 지연 없이 실시간으로 메시지를 교환할 수 있습니다.

##### Process Flow
![Copy of Campaign Launch Brainstorm Whiteboard in Yellow Blue Purple Trendy Style5123](https://github.com/fkelfk/synctalk/assets/96477657/72075602-6222-4db9-a42c-82a1c789b55a)

##### Set Up

```tsx
chat.gateway.ts

import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, WsException } from '@nestjs/websockets';
import { throws } from 'assert';
import { Socket, Server } from '[socket.io](http://socket.io/)';
import { ChatService } from './chat.service';
@WebSocketGateway(3131, {
	cors: { origin: '*' }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{
	@WebSocketServer()
	server: Server;
	users: number = 0;
	private readonly logger: Logger = new Logger('ChatGateway')

	constructor(private readonly chatService: ChatService) {}
	async handleConnection() {
		this.users++;  
		this.server.emit('users', this.users);
		console.log(this.users);
	}

	async handleDisconnect() {
		this.users--;  
		this.server.emit('users', this.users);
		console.log(this.users);
	}

	@SubscribeMessage('chat')
	async onChat(client : Socket, message) {
		client.broadcast.emit('chat', message);
		await this.chatService.set(message.test, message.data)
	}
}
```

```tsx
chat.service.ts

import { ClusterService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { Cluster } from 'ioredis';

@Injectable()
export class ChatService {
  private readonly cluster: Cluster;
  constructor(private readonly clusterService: ClusterService) {
    this.cluster = this.clusterService.getClient();
  }

  async get(key: string) {
    return await this.cluster.get(key);
  }

  async set(key: string, value: string, expire?: number) {
    return await this.cluster.set(key, value, 'EX', 100);
  }
}
```
### Room
#### Covering index
> PostgreSQL는 Index-Only Scan 기능을 통해 커버링 인덱스를 처리합니다. 요구 사항은 대부분의 RDBMS와 유사합니다. 인덱스 유형이 중요하고(현재 btree 또는 gist 인덱스에서만 지원됨) 인덱스는 쿼리에서 요청한 열을 완전히 포함해야 합니다.


##### `setup`
```typescript
async paginationCoveringIndex(offset?: number, limit?: number):Promise<[RoomEntity[], number]> {
    const coveringIndexQueryBuilder = this.roomRepository
      .createQueryBuilder('cover')
      .select(`cover.id`)
      .orderBy('cover.id')
      .offset(offset)
      .limit(limit)
    
    const count = await coveringIndexQueryBuilder.getCount();

    const rooms = await this.roomRepository
      .createQueryBuilder('rooms')
      .innerJoin(`(${coveringIndexQueryBuilder.getQuery()})`, 'cover','rooms.id = cover_id')
      .innerJoinAndSelect('rooms.user', 'user')
      .select(['rooms', 'user'] )
      .getMany();
    
      return [rooms, count];
}
```
저의 경우에는 `id` 열만 가진 `cover`라는 테이블을 만들고 `room` 테이블의 데이터 수에 맞춰 백만개의 데이터를 생성해주었습니다.

```sql
SELECT "cover"."id" AS "cover_id" FROM "rooms" "cover" ORDER BY "cover"."id" ASC LIMIT 10 OFFSET 900000
```
`LIMIT 10` `OFFSET 900000` 을 설정해 탐색한 `coveringIndexQueryBuilder`의 쿼리를 추출 했습니다. 
![](https://velog.velcdn.com/images/atesi/post/2781675e-c9f1-4a50-a57b-3d7bf212d068/image.png)`Index-Only Scan`을 사용하여 검색한 모습입니다. `PostgreSQL`의 `scan`방식을 알아보시려면 [이전 포스팅](https://velog.io/@atesi/PostgreSQL-Table-Scan)을 방문해 주세요 

이렇게 생성한 `Sub Query`를 `Main Query`와 `innerjoin`을 해줍니다. 

`innerJoin`의 첫 번째 인수는 조인할 `Sub Query` 문자열입니다. 두 번째 인수는 하위 쿼리에 사용할 별칭을 나타내는 문자열인 `cover`입니다. 세 번째는 조인 조건을 나타내는 문자열입니다. 이 경우 `'rooms.id = cover_id'`인데, 이는 `rooms` 테이블의 `id`와 `Sub Query`의 `cover_id` 에 대해 조인을 수행해야 함을 의미합니다.

그다음 `innerJoinAndSelect`를 사용하여 `RoomEntity`의 `user` 속성을 `Main query`에 조인하고 결과의 각 `RoomEntity` 객체에 대해 연결된 `UserEntity` 객체를 로드합니다. 

```sql
SELECT "rooms"."id" AS "rooms_id", "rooms"."title" AS "rooms_title", "rooms"."description" AS "rooms_description", "rooms"."roomCode" AS "rooms_roomCode", "rooms"."created_at" AS "rooms_created_at", "rooms"."updated_at" AS "rooms_updated_at", "rooms"."user_id" AS "rooms_user_id", "user"."id" AS "user_id", "user"."username" AS "user_username", "user"."password" AS "user_password", "user"."kakao_id" AS "user_kakao_id", "user"."email" AS "user_email", "user"."name" AS "user_name", "user"."gender" AS "user_gender", "user"."phone" AS "user_phone", "user"."birth" AS "user_birth", "user"."profile_image" AS "user_profile_image", "user"."created_at" AS "user_created_at", "user"."updated_at" AS "user_updated_at" FROM "rooms" "rooms" INNER JOIN (SELECT "cover"."id" AS "cover_id" FROM "rooms" "cover" ORDER BY "cover"."id" ASC LIMIT 10 OFFSET 900000) "cover" ON "rooms"."id" = cover_id  INNER JOIN "user" "user" ON "user"."id"="rooms"."user_id"
```

![](https://velog.velcdn.com/images/atesi/post/d784d9cb-50dd-4c5f-be0f-71a42eb0d43f/image.png)

```typescript
 async getAllRoom(offset?: number, limit?: number) {
    const [items, count] = await this.roomRepository.findAndCount({
      skip: offset,
      take: limit,
    });
    return { items, count };
  }

```
위는 `Typeorm`의 레포지토리를 이용해 만든 기존의 방법입니다.
![](https://velog.velcdn.com/images/atesi/post/841135a6-6da3-4a36-9c67-0f8408538d39/image.png)같은 결과를 보여주지만 쿼리 수와 실행 시간이 차이 나는 것을 확인할 수 있습니다.

##### `Test`
`Offset`이 `9000`, `90000`, `900000`인 상황을 가정하고 소요 시간을 측정해 보겠습니다. 20명의 사용자로 100번의 동시요청을 `ApacheBench`를 이용해 진행했습니다.

|offset|findAndCount|covering index|
|---|---|---|
|9000|10.805 seconds|1.576 seconds|
|90000| 11.405 seconds|1.656 seconds|
|900000|15.195 seconds|2.065 seconds|

##### `Conclusion`

커버링 인덱스를 적용하기 위해 인덱스의 개념, 구조, 타입을 알아보았고 기존 페이지네이션 방식과의 성능 비교를 통해 효율성을 확인할 수 있었습니다. 커버링 인덱스를 사용하는 것은 유용한 최적화 기술이 될 수 있습니다. 

그러나 커버링 인덱스의 효율성은 특정 데이터베이스의 특정 쿼리 패턴 및 데이터 분포에 따라 달라진다는 점은 주의해 두어야 합니다. 경우에 따라 더 큰 인덱스 구조를 유지 관리하는 오버헤드로 인해 기존 인덱스보다 느릴 수 있습니다.




