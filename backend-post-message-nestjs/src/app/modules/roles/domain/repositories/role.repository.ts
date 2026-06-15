import { Role } from '../../schemas/role.schema';
import { CreateRoleDto } from '../../dto/create-role.dto';
import { UpdateRoleDto } from '../../dto/update-role.dto';

/**
 * Abstract repository for role operations.
 * Defines the contract for role-specific data access logic.
 */
export abstract class RoleRepository {
  /**
   * Create a new role.
   * @param createRoleDto - Data for creating a role
   * @returns The created role
   */
  abstract create(createRoleDto: CreateRoleDto): Promise<Role>;

  /**
   * Find all roles, optionally filtered by name.
   * @param name - Optional name filter (case-insensitive regex)
   * @returns Array of roles with permissions populated
   */
  abstract findAll(name?: string): Promise<Role[]>;

  /**
   * Find a role by ID.
   * @param id - The role ID
   * @returns The role with permissions populated, or null if not found
   */
  abstract findOne(id: string): Promise<Role | null>;

  /**
   * Update a role.
   * @param id - The role ID
   * @param updateRoleDto - Data to update
   * @returns The updated role or null if not found
   */
  abstract update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role | null>;

  /**
   * Delete a role.
   * @param id - The role ID
   * @returns The deleted role or null if not found
   */
  abstract remove(id: string): Promise<Role | null>;

  /**
   * Assign permissions to a role.
   * @param roleId - The role ID
   * @param permissionIds - Array of permission IDs to assign
   * @returns The updated role with permissions populated
   * @throws NotFoundException if role not found
   */
  abstract assignPermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<Role>;

  /**
   * Check if a role has a specific permission.
   * @param roleId - The role ID
   * @param permissionIdentifier - The permission identifier to check
   * @returns True if role has the permission, false otherwise
   */
  abstract hasPermission(
    roleId: string,
    permissionIdentifier: string,
  ): Promise<boolean>;

  /**
   * Check if a role has all specified permissions.
   * @param roleId - The role ID
   * @param permissionIdentifiers - Array of permission identifiers to check
   * @returns True if role has all permissions, false otherwise
   */
  abstract hasAllPermissions(
    roleId: string,
    permissionIdentifiers: string[],
  ): Promise<boolean>;
}
