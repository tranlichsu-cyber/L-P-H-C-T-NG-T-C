export type AppErrorCode =
  | 'AUTH_FAILED'
  | 'PERMISSION_DENIED'
  | 'ROOM_NOT_FOUND'
  | 'ROOM_EXPIRED'
  | 'NETWORK_DISCONNECTED'
  | 'QUOTA_EXCEEDED'
  | 'DUPLICATE_SUBMISSION'
  | 'LAST_ADMIN_PROTECTED'
  | 'UNKNOWN_ERROR';

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly userMessage: string;
  public readonly technicalMessage?: string;
  public readonly retryable: boolean;

  constructor(
    code: AppErrorCode,
    userMessage: string,
    technicalMessage?: string,
    retryable: boolean = false
  ) {
    super(userMessage);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
    this.technicalMessage = technicalMessage;
    this.retryable = retryable;
  }

  public static mapFirebaseError(err: any): AppError {
    const errCode = err?.code || '';
    if (errCode === 'permission-denied') {
      return new AppError(
        'PERMISSION_DENIED',
        'Bạn không có quyền thực hiện thao tác này.',
        err.message
      );
    }
    if (errCode === 'unavailable' || errCode === 'resource-exhausted') {
      return new AppError(
        'QUOTA_EXCEEDED',
        'Hệ thống tạm thời đạt giới hạn truy cập. Vui lòng thử lại sau.',
        err.message,
        true
      );
    }
    if (errCode === 'not-found') {
      return new AppError('ROOM_NOT_FOUND', 'Không tìm thấy thông tin phòng học.', err.message);
    }
    return new AppError(
      'UNKNOWN_ERROR',
      err?.message || 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
      String(err)
    );
  }
}
