from flask import Blueprint, request, jsonify, send_file
from app.utils.file import generate_sbol3_file, validate_sbol3_document, generate_related_filename

from app.utils.custom_error import CustomError
from sbol_utilities.conversion import convert_to_genbank, convert_to_fasta
from app.config import get_db_connection
from app.config import FILES_CONVERTED_DIR

import os
import zipfile
import io
import sbol3
import uuid
import logging

logger = logging.getLogger(__name__)
logger.propagate = True

file_blueprint = Blueprint('file', __name__)

@file_blueprint.route('/create', methods=['POST'])
def create_file():
  """
  Generates SBOL3 files and validates them.
  """
  logger.info("Received request to create SBOL3 file")
  try:
    data_front = request.json
    if not data_front:
      logger.warning("No data provided in request")
      raise CustomError('No data provided', 400)

    connection = get_db_connection()
    try:
      with connection.cursor() as cursor:
          unique_id = str(uuid.uuid4())[:8]
          logger.info(f"Generated unique ID: {unique_id}")

          file_path_full, error_full = generate_sbol3_file(data_front, cursor, unique_id, include_functional=True)
          if error_full:
            logger.error(f"Error generating full SBOL3 file: {error_full}")
            raise CustomError(f"Error generating full SBOL3 file: {error_full}", 500)

          file_path_structural, error_structural = generate_sbol3_file(data_front, cursor, unique_id, include_functional=False)
          if error_structural:
            logger.error(f"Error generating structural SBOL3 file: {error_structural}")
            raise CustomError(f"Error generating structural SBOL3 file: {error_structural}", 500)
          
          logger.info(f"SBOL3 files generated: {file_path_full}, {file_path_structural}")
    finally:
      connection.close()

    doc3 = sbol3.Document()
    try:
      doc3.read(file_path_full)
      logger.info(f"Successfully read SBOL3 file: {file_path_full}")
    except Exception as e:
      logger.error(f"Failed to read SBOL3 file: {e}", exc_info=True)
      raise CustomError(f"Failed to read SBOL3 file: {e}", 500)

    is_valid = validate_sbol3_document(doc3)
    if not is_valid:
      logger.warning("Invalid SBOL3 document")
      raise CustomError('Invalid SBOL3 document', 400)

    response = send_file(file_path_full, as_attachment=True)
    response.headers['file_path_structural'] = file_path_structural
    logger.info("Returning SBOL3 file to client")
    return response
  except Exception as e:
    logger.error(f"Failed to create SBOL3 file: {e}", exc_info=True)
    raise CustomError(f"Failed to create SBOL3 file: {e}", 500)

@file_blueprint.route('/convert', methods=['POST'])
def convert_sbol3():
  """
  Converts SBOL3 files to GenBank and/or FASTA formats and returns them as a ZIP.
  """
  logger.info("Received request to convert SBOL3 file")
  try:
    data = request.get_json()
    file_path = data.get('file_path')
    genbank = data.get('genbank')
    fasta = data.get('fasta')

    if not file_path or not os.path.exists(file_path):
      logger.warning(f"Invalid file path: {file_path}")
      raise CustomError('File does not exist or invalid file path', 404)

    if not os.path.exists(FILES_CONVERTED_DIR):
      os.makedirs(FILES_CONVERTED_DIR, exist_ok=True)
      logger.info(f"Created directory for converted files: {FILES_CONVERTED_DIR}")
      
    output_files = []
    
    try:
      doc3 = sbol3.Document()
      doc3.read(file_path)
      logger.info(f"Successfully read SBOL3 file: {file_path}")
      
      if fasta:
        output_fasta = os.path.join(FILES_CONVERTED_DIR, generate_related_filename(file_path, 'fasta', 'fasta'))
        convert_to_fasta(doc3, output_fasta)
        output_files.append(output_fasta)
        logger.info(f"Generated FASTA: {output_fasta}")

      if genbank:
        output_genbank = os.path.join(FILES_CONVERTED_DIR, generate_related_filename(file_path, 'genbank', 'gb'))
        logger.info("Starting GenBank conversion")
        convert_to_genbank(doc3, output_genbank, allow_genbank_online=True)
        logger.info(f"Generated GenBank: {output_genbank}")
        output_files.append(output_genbank)

      zip_buffer = io.BytesIO()
      with zipfile.ZipFile(zip_buffer, 'w') as zipf:
        for file in output_files:
          zipf.write(file, os.path.basename(file))
      zip_buffer.seek(0)

      logger.info("Returning ZIP file")
      return send_file(zip_buffer, as_attachment=True, mimetype='application/zip', attachment_filename='converted_files.zip')
    
    except Exception as e:
      logger.error(f"Error during file conversion: {e}", exc_info=True)
      raise CustomError(f"Error during file conversion: {e}", 500)

  except Exception as e:
    logger.error(f"Failed to convert SBOL3 file: {e}", exc_info=True)
    raise CustomError(f"Failed to convert SBOL3 file: {e}", 500)
