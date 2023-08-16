import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    if (context.getType() === 'rpc') {
      return context.switchToRpc().getData().user;
    } else if (context.getType() === 'http') {
      return context.switchToHttp().getRequest<Request>().user;
    }
  },
);
