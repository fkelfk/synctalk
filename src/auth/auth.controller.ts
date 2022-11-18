import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Roles } from 'src/decorator/role.decorator';
import { RoleType } from 'src/role-type';
import { AuthService } from './auth.service';
import { UserDTO } from './dto/user.dto';
import { AuthGuard } from './security/auth.guard';
import { RolesGuard } from './security/role.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  @UsePipes(ValidationPipe)
  async registerAccount(
    @Req() req: Request,
    @Body() userDTO: UserDTO,
  ): Promise<any> {
    return await this.authService.registerNewUser(userDTO);
  }
  @Post('/login')
  async login(@Body() userDTO: UserDTO, @Res() res: Response): Promise<any> {
    const jwt = await this.authService.validateUser(userDTO);
    res.setHeader('Authorization', 'Bearer ' + jwt.accessToken);
    res.cookie('jwt', jwt.accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1day
    });
    return res.send({ message: 'success' });
  }

  @Post('/logout')
  logout(@Req() req: Request, @Res() res: Response): any {
    res.cookie('jwt', '', {
      maxAge: 0,
    });
    return res.send({
      message: 'success',
    });
  }

  @Get('/authenticate')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  isAuthenticated(@Req() req: Request): any {
    const user: any = req.user;
    return user;
  }
  @Get('/cookies')
  getCookies(@Req() req: Request, @Res() res: Response): any {
    const jwt = req.cookies['jwt'];
    return res.send(jwt);
  }
}
