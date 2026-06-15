/**
 * Shows a confirmation dialog before a delete action.
 * @param type - The entity type being deleted (e.g. 'post', 'comment').
 */
export async function confirmDeleteDialog(type: string): Promise<boolean> {
  return confirm(`¿Estás seguro de que deseas eliminar este ${type}?`);
}

/**
 * Shows a generic confirmation dialog with a custom message.
 */
export async function confirmDialog(message: string): Promise<boolean> {
  return confirm(message);
}
