import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AUTH_IS_PUBLIC_KEY } from "src/common/constants/common.constants";
import { ROLES_KEY } from "src/common/decorators/roles.decorator";
import { UserRoles } from "src/common/enums";
import { AuthExceptions } from "src/common/exceptions";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      AUTH_IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (isPublic) {
      return true;
    }

    const requiredRole = this.reflector.getAllAndOverride<UserRoles>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    console.log("requiredRole: ", requiredRole);
    const { user } = context.switchToHttp().getRequest();

    if (!user) throw AuthExceptions.ForbiddenException();

    return requiredRole == user.role;
  }
}
