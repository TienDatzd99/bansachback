import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export type CurrentUserPayload = {
  sub: number;
  email: string;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (request as Request & { user: CurrentUserPayload }).user;
  },
);