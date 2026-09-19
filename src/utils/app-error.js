class AppError extends Error {
  constructor(status, payload) {
    super(payload?.message || "Request failed");

    this.status = status;
    this.payload = payload || {
      message: this.message,
    };
  }
}

export default AppError;