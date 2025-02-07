from flask import Blueprint, request, jsonify
from app.utils.custom_error import CustomError
from app.models.inference import process_image
import numpy as np
from app.config import model
import cv2
import base64
import logging

logger = logging.getLogger(__name__)
logger.propagate = True

inference_blueprint = Blueprint('inference', __name__)

@inference_blueprint.route('/', methods=['POST'])
def inference():
  """
  Processes an image for object detection and returns the results.
  """
  logger.info("Received request for image inference")
  try:
    if 'image' not in request.files:
      logger.warning("No file provided in request")
      raise CustomError('No file provided', 400)

    file = request.files['image']
    if file.filename == '':
      logger.warning("No file selected")
      raise CustomError('No file selected', 400)
    
    logger.info(f"Processing image: {file.filename}")
    image_input = file.read()
    
    result_image, draw_boxes, pred_classes = process_image(image_input, model)

    _, img_encoded = cv2.imencode('.png', result_image)
    img_base64 = base64.b64encode(img_encoded).decode('utf-8')
    has_predictions = draw_boxes.size > 0 if isinstance(draw_boxes, np.ndarray) else len(draw_boxes) > 0

    if not has_predictions:
      logger.info("No predictions made by the model")
      return jsonify({
        'status': 'success',
        'message': 'No predictions made by the model.',
        'result_image': img_base64,
        'draw_boxes': [],  
        'pred_classes': [], 
        'has_predictions': False  
      })

    logger.info(f"Returning {len(draw_boxes)} predictions")
    return jsonify({
      'status': 'success',
      'result_image': img_base64,
      'draw_boxes': draw_boxes.tolist(),
      'pred_classes': pred_classes,
      'has_predictions': True
    })
    
  except Exception as e:
    raise CustomError(f"Image processing failed: {e}", 500)