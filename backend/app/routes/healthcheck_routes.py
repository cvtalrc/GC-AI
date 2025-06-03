from flask import Blueprint, jsonify
from app.utils.custom_error import CustomError
from app.config import get_db_connection
from app.config import model
import logging

logger = logging.getLogger(__name__)
logger.propagate = True

healthcheck_blueprint = Blueprint('healthcheck', __name__)

@healthcheck_blueprint.route('/', methods=['GET'])
def healthcheck():
  """
  Healthcheck endpoint to ensure the application and services are running correctly.
  """
  logger.info("Healthcheck endpoint called")
  
  try:
    if model is None:
      logger.error("Healthcheck failed: Model not loaded")
      raise CustomError("Model not loaded", 500)
    logger.info("Model is loaded successfully")

    connection = get_db_connection()
    try:
      with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        logger.info("Database connection is active")
    finally:
      connection.close()

    logger.info("Healthcheck passed successfully")
    return jsonify({"status": "healthy", "message": "Application is running correctly"}), 200
  
  except Exception as e:
    logger.error(f"Healthcheck failed: {e}", exc_info=True)
    raise CustomError(f"Healthcheck failed: {e}", 500)
