import { Injectable } from '@nestjs/common';
import { Role } from '../schemas/role.schema';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RoleRepository } from '../domain/repositories/role.repository';

/**
 * RolesService acts as an orchestrator that delegates to the repository.
 * All business logic is handled by the repository layer.
 */
@Injectable()
export class RolesService {
  constructor(private readonly roleRepository: RoleRepository) {}

  /**
   * Create a new role.
   * @param createRoleDto - Data for creating the role
   * @returns The created role
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    return this.roleRepository.create(createRoleDto);
  }

  /**
   * Find all roles, optionally filtered by name.
   * @param name - Optional name filter
   * @returns Array of roles with permissions
   */
  async findAll(name?: string): Promise<Role[]> {
    return this.roleRepository.findAll(name);
  }

  /**
   * Find a role by ID.
   * @param id - The role ID
   * @returns The role with permissions
   */
  async findOne(id: string): Promise<Role | null> {
    return this.roleRepository.findOne(id);
  }

  /**
   * Update a role.
   * @param id - The role ID
   * @param updateRoleDto - Data to update
   * @returns The updated role
   */
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role | null> {
    return this.roleRepository.update(id, updateRoleDto);
  }

  /**
   * Delete a role.
   * @param id - The role ID
   * @returns The deleted role
   */
  async remove(id: string): Promise<Role | null> {
    return this.roleRepository.remove(id);
  }

  /**
   * Assign permissions to a role.
   * @param roleId - The role ID
   * @param permissionIds - Array of permission IDs
   * @returns The updated role with permissions
   */
  async assignPermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    return this.roleRepository.assignPermissions(roleId, permissionIds);
  }

  /**
   * Check if a role has a specific permission.
   * @param roleId - The role ID
   * @param permissionIdentifier - The permission identifier
   * @returns True if role has the permission
   */
  async hasPermission(
    roleId: string,
    permissionIdentifier: string,
  ): Promise<boolean> {
    return this.roleRepository.hasPermission(roleId, permissionIdentifier);
  }

  /**
   * Check if a role has all specified permissions.
   * @param roleId - The role ID
   * @param permissionIdentifiers - Array of permission identifiers
   * @returns True if role has all permissions
   */
  async hasAllPermissions(
    roleId: string,
    permissionIdentifiers: string[],
  ): Promise<boolean> {
    return this.roleRepository.hasAllPermissions(
      roleId,
      permissionIdentifiers,
    );
  }
}
