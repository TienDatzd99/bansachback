import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authUser = (request as Request & { user?: { sub: number } }).user;

    if (!authUser?.sub) {
      throw new ForbiddenException('Unable to resolve authenticated user');
    }

    const user = await this.dataSource.getRepository(User).findOne({
      where: { id: authUser.sub },
      relations: ['roles'],
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const roleSet = new Set((user.roles || []).map((role) => role.role_name));
    const hasAnyRole = requiredRoles.some((role) => roleSet.has(role));

    if (!hasAnyRole) {
      throw new ForbiddenException('You do not have permission for this action');
    }

    return true;
  }
}