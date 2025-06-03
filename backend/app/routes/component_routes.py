from flask import Blueprint, request, jsonify
from app.config import get_db_connection
from app.utils.custom_error import CustomError
from dotenv import load_dotenv
import os
import logging

logger = logging.getLogger(__name__)
logger.propagate = True

#load_dotenv()

DB_NAME = os.getenv('DB_NAME')

component_blueprint = Blueprint('component', __name__)

@component_blueprint.route('/names', methods=['GET'])
def get_names():
  """
  Returns a list of part names based on the specified role.
  """
  logger.info("Received request to fetch component names")
  try:
    role = request.args.get('role')
    if not role:
      logger.warning("Role parameter is missing")
      raise CustomError('Role is required', 400)

    part_type_map = {
      'Aptamer-RNA': ['rna'],
      'Aptamer-DNA': ['dna'],
      'Promoter': ['regulatory', 'promoter', 'T7'],
      'Operator': ['regulatory', 'promoter', 'T7', 'inverter'],
      'CDS': ['coding', 'protein', 'reporter', 'generator', 'tag', 'protein_domain'],
      'RBS': ['rbs'],
      'Inert-DNA-Spacer': ['dna'],
      'Engineered-Region': ['inverter', 'reporter', 'composite', 'device', 'project', 'plasmid_backbone', 'generator', 'signalling'],
      'Ncrna': ['rna'],
      'PolyA-Site': ['rna'],
      'Primer-Binding-Site': ['primer'],
      'Origin-Of-Transfer': ['conjugation'],
      'Origin-Of-Replication': ['plasmid_backbone'],
      'Terminator': ['terminator']
    }

    part_types = part_type_map.get(role)
    if not part_types:
      logger.warning(f"Invalid role: {role}")
      raise CustomError('Invalid role', 400)

    placeholders = ', '.join(['%s'] * len(part_types))
    query = f"""
        SELECT DISTINCT part_name 
        FROM {DB_NAME}.parts 
        WHERE part_type IN ({placeholders}) AND sequence IS NOT NULL
    """
    logger.info(f"Executing query to fetch names for role: {role}")
    
    connection = get_db_connection()
    try:
      with connection.cursor() as cursor:
        cursor.execute(query, part_types)
        components_names = [row[0] for row in cursor.fetchall()]
        logger.info(f"Fetched {len(components_names)} component names")
    finally:
      connection.close()

    return jsonify(components_names)
  except Exception as e:
      logger.error(f"Failed to fetch names: {e}", exc_info=True)
      raise CustomError(f"Failed to fetch names: {e}", 500)
    
@component_blueprint.route('/interactions', methods=['GET'])
def get_participations():
  """
  Returns the participation types for a given interaction type.
  """
  logger.info("Received request to fetch interaction participations")
  try:
    interaction_type = request.args.get('interaction_type')
    if not interaction_type:
      logger.warning("Interaction type parameter is missing")
      raise CustomError('Interaction type is required', 400)

    participation_map = {
      'Inhibition': ['Inhibitor', 'Inhibited'],
      'Stimulation': ['Stimulator', 'Stimulated'],
      'Biochemical Reaction': ['Reactant', 'Product', 'Modifier', 'Modified'],
      'Non-Covalent Binding': ['Reactant', 'Product'],
      'Degradation': ['Reactant'],
      'Control': ['Modifier', 'Modified'],
      'Genetic Production': ['Product', 'Promoter', 'Template']
    }

    participations = participation_map.get(interaction_type)
    if not participations:
      logger.warning(f"Invalid interaction type: {interaction_type}")
      raise CustomError('Invalid interaction type', 400)

    logger.info(f"Returning participation types for {interaction_type}: {participations}")
    return jsonify(participations)
  except Exception as e:
    logger.error(f"Failed to fetch participations: {e}", exc_info=True)
    raise CustomError(f"Failed to fetch participations: {e}", 500)

@component_blueprint.route('/details', methods=['GET'])
def get_component():
  """
  Returns the details of a component by its name.
  """
  logger.info("Received request to fetch component details")
  try:
    component_name = request.args.get('component_name')
    role = request.args.get('role')  
    if not component_name:
      logger.warning("Component name parameter is missing")
      raise CustomError('Component name is required', 400)

    query = f"""
      SELECT description, sequence, sequence_length
      FROM {DB_NAME}.parts 
      WHERE part_name = %s
      LIMIT 1
    """
    logger.info(f"Executing query to fetch details for component: {component_name}")
    connection = get_db_connection()
    try:
      with connection.cursor() as cursor:
        cursor.execute(query, (component_name,))
        component = cursor.fetchone()
    finally:
      connection.close()

    if not component:
      logger.warning(f"Component not found: {component_name}")
      raise CustomError('Component not found', 404)

    logger.info(f"Returning details for component: {component_name}")
    return jsonify({
      'identifier': component_name,
      'name': component_name,
      'description': component[0],
      'role': role,
      'sequence': component[1],
      'sequence_length': component[2]
    })
  except Exception as e:
    logger.error(f"Failed to fetch component: {e}", exc_info=True)
    raise CustomError(f"Failed to fetch component: {e}", 500)