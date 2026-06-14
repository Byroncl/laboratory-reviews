// Post statuses
export const POST_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type PostStatusType = typeof POST_STATUSES[keyof typeof POST_STATUSES];

// Post actions for table/list interactions
export const POST_ACTIONS = {
  VIEW: 'view',
  EDIT: 'edit',
  DELETE: 'delete',
  PUBLISH: 'publish',
  ARCHIVE: 'archive',
  RESTORE: 'restore',
} as const;

// Status labels for display
export const STATUS_DISPLAY_LABELS = {
  [POST_STATUSES.DRAFT]: 'Draft',
  [POST_STATUSES.PUBLISHED]: 'Published',
  [POST_STATUSES.ARCHIVED]: 'Archived',
} as const;

// Status filter options for dropdowns
export const STATUS_FILTER_OPTIONS = [
  { value: POST_STATUSES.DRAFT, label: STATUS_DISPLAY_LABELS.draft },
  { value: POST_STATUSES.PUBLISHED, label: STATUS_DISPLAY_LABELS.published },
  { value: POST_STATUSES.ARCHIVED, label: STATUS_DISPLAY_LABELS.archived },
] as const;
