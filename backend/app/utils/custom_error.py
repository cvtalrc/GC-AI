class CustomError(Exception):
  """
  Custom exception class for expected errors in the application.

  Args:
    message (str): The error message to be displayed.
    status_code (int): The HTTP status code for the error. Defaults to 400 (Bad Request).
  """
  def __init__(self, message, status_code=400):
    super().__init__(message)
    self.message = message
    self.status_code = status_code
