/**
 * Repository index — single import surface for the service layer.
 * To migrate from Prisma/SQLite to Supabase/PostgreSQL:
 *   1. Replace implementations in /lib/repositories/*.ts with Supabase clients.
 *   2. Service & API layers stay untouched.
 */
export { BaseRepository } from "./base.repository";
export type {
  IBaseRepository,
  RepositoryQueryParams,
  RepositoryResult,
} from "./base.repository";

export { bookRepository } from "./book.repository";
export type { BookWithRelations, CreateBookInput, UpdateBookInput } from "./book.repository";

export { authorRepository } from "./author.repository";
export type { AuthorWithRelations, CreateAuthorInput, UpdateAuthorInput } from "./author.repository";

export { categoryRepository } from "./category.repository";
export type { CategoryWithRelations, CreateCategoryInput, UpdateCategoryInput } from "./category.repository";

export { pageRepository } from "./page.repository";
export type { CreatePageInput, UpdatePageInput } from "./page.repository";

export { userRepository } from "./user.repository";
export type { CreateUserInput, UpdateUserInput } from "./user.repository";

export { settingRepository, SETTING_KEYS } from "./setting.repository";

export { activityLogRepository } from "./activity-log.repository";
export type { CreateActivityLogInput } from "./activity-log.repository";

export { uploadRepository } from "./upload.repository";
export type { CreateUploadInput } from "./upload.repository";

export { bookFileRepository } from "./book-file.repository";
export type { CreateBookFileInput } from "./book-file.repository";

export { contactMessageRepository } from "./contact-message.repository";
export type { CreateContactMessageInput } from "./contact-message.repository";

export { tagRepository } from "./tag.repository";
export type { CreateTagInput } from "./tag.repository";

// V2 repositories
export { notificationRepository } from "./notification.repository";
export type { CreateNotificationInput } from "./notification.repository";

export { bookmarkRepository } from "./bookmark.repository";
export type { CreateBookmarkInput } from "./bookmark.repository";

export { readingProgressRepository } from "./reading-progress.repository";
export type { UpsertProgressInput } from "./reading-progress.repository";

export { analyticsEventRepository } from "./analytics-event.repository";
export type { CreateAnalyticsEventInput } from "./analytics-event.repository";

export { bookRevisionRepository } from "./book-revision.repository";
export type { CreateRevisionInput } from "./book-revision.repository";
