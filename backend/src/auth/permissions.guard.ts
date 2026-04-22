import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No specific permissions required
    }

    const request = context.switchToHttp().getRequest();
    const userRolePermissions = request.user?.permissions || [];

    // If the user has ALL_ACCESS, they pass automatically
    if (userRolePermissions.includes('ALL_ACCESS')) {
        return true;
    }

    // Check if user has ALL the required permissions (or ANY depending on your design, usually ALL)
    // We will do ANY for this case: if the user has any of the required permissions OR the required permission.
    const hasPermission = requiredPermissions.some((permission) =>
      userRolePermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('No tienes permisos suficientes para realizar esta acción');
    }

    return true;
  }
}
