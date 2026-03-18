import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from '../user/entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

type SafeUser = Omit<User, 'password'>;

type AuthPayload = {
  sub: number;
  email: string;
};

type AuthResponse = {
  user: SafeUser;
  access_token: string;
  refresh_token: string;
};

type AuthMeResponse = {
  id: number;
  email: string;
  full_name?: string;
  image_url?: string;
  address?: string;
  phone?: string;
  dob?: Date;
  roles: string[];
};

@Injectable()
export class AuthService {
  private readonly resetTokens = new Map<
    string,
    { userId: number; expiresAt: number }
  >();
  private readonly googleClient = new OAuth2Client();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<AuthResponse> {
    const email = registerUserDto.email.toLowerCase().trim();
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.hashPassword(registerUserDto.password);
    const fullName = `${registerUserDto.first_name} ${registerUserDto.last_name}`.trim();
    const user = this.userRepository.create({
      full_name: fullName || undefined,
      email,
      password: hashedPassword,
    });
    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return {
      user: this.toSafeUser(user),
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  async login(loginUserDto: LoginUserDto): Promise<AuthResponse> {
    const email = loginUserDto.email.toLowerCase().trim();
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatched = await bcrypt.compare(loginUserDto.password, user.password);
    if (!passwordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);

    return {
      user: this.toSafeUser(user),
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  async googleLogin(googleLoginDto: GoogleLoginDto): Promise<AuthResponse> {
    const payload = await this.verifyGoogleToken(googleLoginDto.id_token);
    if (!payload) {
      throw new UnauthorizedException('Invalid Google token payload');
    }

    const email = payload.email?.toLowerCase().trim();
    if (!email) {
      throw new BadRequestException('Google token does not include email');
    }

    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      user = this.userRepository.create({
        full_name: `${payload.given_name ?? ''} ${payload.family_name ?? ''}`.trim() ||
          'Google User',
        email,
        password: await this.hashPassword(payload.sub ?? Math.random().toString(36)),
        image_url: payload.picture,
      });
    } else {
      if (!user.full_name) {
        user.full_name =
          `${payload.given_name ?? ''} ${payload.family_name ?? ''}`.trim() ||
          user.full_name;
      }
      if (!user.image_url && payload.picture) {
        user.image_url = payload.picture;
      }
    }

    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return {
      user: this.toSafeUser(user),
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
    message: string;
    reset_token?: string;
  }> {
    const email = forgotPasswordDto.email.toLowerCase().trim();
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return {
        message:
          'If this email exists, a reset link has been generated (demo mode).',
      };
    }

    const resetToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        type: 'reset-password',
      },
      {
        secret: this.getJwtSecret(),
        expiresIn: this.getResetExpiresInSeconds(),
      },
    );

    this.resetTokens.set(resetToken, {
      userId: user.id,
      expiresAt: Date.now() + this.getResetExpiresInSeconds() * 1000,
    });

    return {
      message:
        'Reset token generated successfully (demo mode, replace by email sender).',
      reset_token: resetToken,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenData = this.resetTokens.get(resetPasswordDto.token);
    if (!tokenData || tokenData.expiresAt < Date.now()) {
      throw new BadRequestException('Reset token is invalid or expired');
    }

    const payload = await this.jwtService.verifyAsync<{
      sub: number;
      email: string;
      type: string;
    }>(resetPasswordDto.token, {
      secret: this.getJwtSecret(),
    });

    if (payload.type !== 'reset-password') {
      throw new BadRequestException('Invalid reset token type');
    }

    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.password = await this.hashPassword(resetPasswordDto.new_password);
    await this.userRepository.save(user);
    this.resetTokens.delete(resetPasswordDto.token);

    return { message: 'Password reset successfully' };
  }

  async me(userId: number): Promise<AuthMeResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      image_url: user.image_url,
      address: user.address,
      phone: user.phone,
      dob: user.dob,
      roles: (user.roles || []).map((role) => role.role_name),
    };
  }

  private async generateTokens(user: User): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const payload: AuthPayload = {
      sub: user.id,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.getJwtSecret(),
        expiresIn: this.getAccessExpiresInSeconds(),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.getRefreshSecret(),
        expiresIn: this.getRefreshExpiresInSeconds(),
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async verifyGoogleToken(idToken: string) {
    try {
      const audience = this.configService.get<string>('GOOGLE_CLIENT_ID');
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: audience || undefined,
      });
      return ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google id_token');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = Number(this.configService.get<string>('BCRYPT_ROUNDS', '10'));
    return bcrypt.hash(password, saltRounds);
  }

  private toSafeUser(user: User): SafeUser {
    // Strip sensitive values before sending user data to clients.
    const { password, ...safeUser } = user;
    void password;
    return safeUser;
  }

  private getJwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET', 'dev_secret_key');
  }

  private getRefreshSecret(): string {
    return this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'dev_refresh_secret_key',
    );
  }

  private getAccessExpiresInSeconds(): number {
    return Number(this.configService.get<string>('JWT_EXPIRES_IN_SECONDS', '900'));
  }

  private getRefreshExpiresInSeconds(): number {
    return Number(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN_SECONDS', '604800'),
    );
  }

  private getResetExpiresInSeconds(): number {
    return Number(
      this.configService.get<string>('JWT_RESET_EXPIRES_IN_SECONDS', '900'),
    );
  }
}
