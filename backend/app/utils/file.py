import sbol3
from sbol_utilities.component import *
from app.utils.calculate_seq import calculate_seq_with_scars
from app.utils.custom_error import CustomError
from app.utils.p_constitutive import promoter_constitutive
from app.config import FILES_GENERATED_DIR
import os
import logging
from dotenv import load_dotenv

#load_dotenv()

DB_NAME = os.getenv('DB_NAME')

logger = logging.getLogger(__name__)
logger.propagate = True

class ComponentData:
  """
    A class to represent metadata and properties for SBOL components.
  """
  
  def __init__(self, short_desc='', description='', author='', owning_group_id='', status='', dominant=False, discontinued=False, part_status='',
               sample_status='', creation_date='', m_datetime='', m_user_id='', uses='', favorite=False, owner_id='', group_u_list='',
               categories='', sequence='', sequence_length=0, notes=''):
    self.short_desc = short_desc
    self.description = description
    self.creator = author
    self.owning_group_id = owning_group_id
    self.status = status
    self.dominant = dominant
    self.discontinued = discontinued
    self.part_status = part_status
    self.sample_status = sample_status
    self.created = creation_date
    self.modified = m_datetime
    self.m_user_id = m_user_id
    self.experience = uses
    self.bookmark = favorite
    self.owner_id = owner_id
    self.group_u_list = group_u_list
    self.categories = categories
    self.sequence = sequence
    self.sequence_length = sequence_length
    self.mutable_description = notes

def get_component_data(cursor, component_name):
  """
    Fetches component metadata from the database.

    Args:
      cursor: Database cursor to execute queries.
      component_name: Name of the component to fetch data for.

    Returns:
      An instance of ComponentData if the component is found, otherwise None.
  """
  
  query = f"""
      SELECT short_desc, description, author, owning_group_id, status, dominant, 
            discontinued, part_status, sample_status, creation_date, m_datetime,
            m_user_id, uses, favorite, owner_id, group_u_list, categories, sequence, 
            sequence_length, notes 
      FROM {DB_NAME}.parts 
      WHERE part_name = %s
  """
  
  try:
    cursor.execute(query, (component_name,))
    result = cursor.fetchone()

    if not result:
      error_message = f"No component data found for: {component_name}"
      logger.warning(error_message)
      raise CustomError(error_message, status_code=404)

    logger.info(f"Fetched component data for: {component_name}")
    return ComponentData(*result)

  except Exception as e:
    error_message = f"Error fetching data for component {component_name}: {e}"
    logger.error(error_message)
    raise CustomError(error_message, status_code=500)

def add_annotations(component, component_data, component_namespace):
  """
    Adds annotations (metadata) to a given SBOL3 component.

    Args:
        component: The SBOL3 component to annotate.
        component_data: Metadata to attach to the component.
        component_namespace: Namespace to use for annotations.
  """
  
  try:
    logger.info(f"Adding annotations for component: {component.identity}")
    properties = {
      'owning_group_id': component_data.owning_group_id,
      'status': component_data.status,
      'dominant': 'true' if component_data.dominant else 'false',
      'discontinued': 'true' if component_data.discontinued else 'false',
      'part_status': component_data.part_status,
      'sample_status': component_data.sample_status,
      'created': component_data.created,
      'modified': component_data.modified,
      'm_user_id': component_data.m_user_id,
      'experience': component_data.experience,
      'bookmark': 'true' if component_data.bookmark else 'false',
      'owner_id': component_data.owner_id,
      'group_u_list': component_data.group_u_list,
      'mutableNotes': component_data.mutable_description
    }
    for key, value in properties.items():
      sbol3.TextProperty(component, f'{component_namespace}{key}', 0, 1, initial_value=str(value))
      
    logger.info(f"Annotations successfully added for component: {component.identity}")

  except Exception as e:
    error_message = f"Error adding annotations for component {component.identity}: {e}"
    logger.error(error_message)
    raise CustomError(error_message, status_code=500)
  
def create_component_general(doc, component_name, component_type, component_data, instance, parent, namespace):
  """
    Creates a general SBOL3 component with its associated properties.

    Args:
      doc: SBOL3 document to add the component to.
      component_name: Name of the component.
      component_type: Type of the component (e.g., Promoter, RBS).
      component_data: Metadata associated with the component.
      instance: Instance ID for distinguishing identical components.
      parent: Indicates if the component is a parent component.
      namespace: Namespace URI for the component.

    Returns:
      The created SBOL3 component.
  """
  
  try:
    component_map = {
      'Aptamer-DNA': ('https://identifiers.org/SO:0000032', sbol3.SBO_DNA, sbol3.IUPAC_DNA_ENCODING),
      'Aptamer-RNA': ('https://identifiers.org/SO:0000033', sbol3.SBO_RNA, sbol3.IUPAC_RNA_ENCODING),
      'Inert-DNA-Spacer': ('https://identifiers.org/SO:0002223', sbol3.SBO_DNA, sbol3.IUPAC_DNA_ENCODING),
      'Ncrna': ('https://identifiers.org/SO:0000655', sbol3.SBO_RNA, sbol3.IUPAC_RNA_ENCODING),
      'PolyA-Site':  ('https://identifiers.org/SO:0000553', sbol3.SBO_RNA, sbol3.IUPAC_RNA_ENCODING),
      'Promoter': (sbol3.SO_PROMOTER, sbol3.SBO_DNA, sbol3.IUPAC_DNA_ENCODING),
      'RBS': (sbol3.SO_RBS, sbol3.SBO_DNA, sbol3.IUPAC_DNA_ENCODING),
      'CDS': (sbol3.SO_CDS, sbol3.SBO_DNA, sbol3.IUPAC_DNA_ENCODING),
      'Terminator': (sbol3.SO_TERMINATOR, sbol3.SBO_DNA, sbol3.IUPAC_DNA_ENCODING),
      'Operator': (sbol3.SO_OPERATOR, sbol3.SBO_DNA, sbol3.IUPAC_DNA_ENCODING),
      'Engineered-Region': (sbol3.SO_ENGINEERED_REGION, sbol3.SBO_DNA, sbol3.IUPAC_DNA_ENCODING),
      'Primer-Binding-Site': ('https://identifiers.org/SO:0005850', sbol3.SBO_DNA, sbol3.IUPAC_DNA_ENCODING),
      'Origin-Of-Transfer': ('https://identifiers.org/SO:0000724', sbol3.SBO_DNA, sbol3.IUPAC_DNA_ENCODING),
      'Origin-Of-Replication': ('https://identifiers.org/SO:0000296', sbol3.SBO_DNA, sbol3.IUPAC_DNA_ENCODING),
      'mRNA': (sbol3.SO_MRNA, sbol3.SBO_RNA, sbol3.IUPAC_RNA_ENCODING)
    }
    
    component_info = component_map.get(component_type)  
    
    if not component_info:
      error_message = f"Unsupported component type: {component_type}"
      logger.error(error_message)
      raise CustomError(error_message, status_code=400)

    component_role, component_type, component_encoding = component_info
          
    identity = f"{component_name}"
    identifier = f"{component_name}_{instance}"
    comp_description = component_data.short_desc

    if not parent:
      logger.info(f"Creating component with sequence: {component_name}")
      comp_sequence = doc.add(sbol3.Sequence(f'{component_name}_seq', elements=component_data.sequence, encoding=component_encoding))
      component = doc.add(sbol3.Component(
        identity=identity,
        types=[component_type],
        roles=[component_role],
        sequences=[comp_sequence],
        name = identifier,
        description=comp_description
      ))
      
    else:
      logger.info(f"Creating parent component: {component_name}")
      component = doc.add(sbol3.Component(
        identity=identity,
        types=[component_type],
        roles=[component_role],
        name = identifier,
        description=comp_description
      ))

    logger.info(f"Successfully created component: {component.identity}")
    return component
  
  except Exception as e:
    error_message = f"Error creating component {component_name}: {e}"
    logger.error(error_message)
    raise CustomError(error_message, status_code=500)

def create_system(doc, parent_component, data_system, interactions, eds):
  """
    Creates a system of components and their interactions.

    Args:
      doc: SBOL3 document to add the system to.
      parent_component: Parent component of the system.
      data_system: Data describing the system's operons and components.
      interactions: Interactions within the system.
      eds: Externally defined components for the system.
  """
  
  try: 
    logger.info(f"Creating system for parent component: {parent_component.identity}")
    system = functional_component(f'{parent_component.display_id}_system')
    doc.add(system)
    parent_system = add_feature(system, parent_component)

    for operon in data_system:
      name_operon = operon['name']
      output = add_feature(system, sbol3.LocalSubComponent([sbol3.SBO_DNA], roles=[sbol3.SO_ENGINEERED_REGION], name=name_operon))
      logger.info(f"Added {name_operon} to system: {output}")
      
      for component in operon['components']:
        subcomponent = None

        subcomponent = next(
          (feature for feature in parent_component.features 
          if (isinstance(feature, sbol3.SubComponent) and feature.name == component)
          or (isinstance(feature, sbol3.ComponentReference) and feature.refers_to.lookup().name == component)),
          None
        )

        if subcomponent:
          subcomponent_ref = sbol3.ComponentReference(parent_system, subcomponent)
          system.features.append(subcomponent_ref)
          logger.info(f"Added subcomponent reference to system: {subcomponent}")
          contains(output, subcomponent_ref, system)
          logger.info(f"Establishing containment of {subcomponent.identity} in {output.identity}")     
    
      if operon['constitutive']:
        promoter_constitutive(output, system)
        logger.info(f"Establishing constitutive in {output.identity}")

      for union in operon['unions']:
        union_type = union['type']
        from_name = union['from']
        to_name = union['to']
        
        from_component = find_component_reference(system, parent_component, from_name)    
        to_component = find_component_reference(system, parent_component, to_name)
        
        if not to_component:
          logger.warning(f"Component {to_component} not found in the system or as a LocalSubComponent.")
          continue
        
        if not from_component:
          logger.warning(f"Component {from_component} not found in the system or as a LocalSubComponent.")
          continue

        if union_type == 'Order':
          logger.info(f"Establishing order between {from_component} and {to_component}")
          order(from_component, to_component, system)
          
        elif union_type == 'Regulate':
          logger.info(f"Establishing regulation of {from_component} on {to_component}")
          regulate(from_component, to_component, system)

    create_ed_components(eds, system)
    create_interactions(interactions, system, parent_component)
    
    logger.info(f"System created with ID: {system.identity}")
    return system

  except Exception as e:
    error_message = f"Error creating system for parent component {parent_component.identity}: {e}"
    logger.error(error_message)
    raise CustomError(error_message, status_code=500)
      
def find_component_reference(system, parent_component, component_name):
  """
    Finds a reference to a component within a system.

    Args:
      system (sbol3.Component): The system where the search will be performed.
      parent_component (sbol3.Component): The parent component that contains the referenced subcomponents.
      component_name (str): The name of the component to find.

    Returns:
      sbol3.ComponentReference or sbol3.ExternallyDefined: 
      The matching component reference if found, otherwise None.
  """
  
  try:
    for feature in system.features:
      if isinstance(feature, sbol3.ComponentReference):
        referred_component = feature.refers_to.lookup()
        for sub_feature in parent_component.features:
          if isinstance(sub_feature, sbol3.SubComponent) and sub_feature == referred_component:
            if sub_feature.name == component_name:
                logger.info(f"Found matching component reference: {feature} points to subcomponent {sub_feature} in system {system.display_id}")
                return feature
              
      elif isinstance(feature, sbol3.ExternallyDefined): 
        if (feature.name == component_name):
          logger.info(f"Found matching ExternallyDefined component: {feature.name} in system {system.display_id}")
          return feature

    logger.warning(f"No matching component reference found for {component_name} in system {system.display_id}")
    return None

  except Exception as e:
    error_message = f"Error finding component reference for {component_name} in system {system.display_id}: {e}"
    logger.error(error_message)
    raise CustomError(error_message, status_code=500)

def hierarchy(parent_component, child_components):
  """
    Establishes hierarchical relationships between parent and child components.

    Args:
      parent_component: The parent component.
      child_components: List of child components.
  """
  
  try:
    for i in range(len(child_components) - 1):
      logger.info(f"Establishing order between {child_components[i].identity} and {child_components[i + 1].identity}")
      order(child_components[i], child_components[i + 1], parent_component)
      
    parent_component_seq = calculate_seq_with_scars(parent_component, child_components)
    logger.info(f"Computed sequence for parent component: {parent_component.identity}")
    
    return parent_component_seq
  
  except Exception as e:
    error_message = f"Error creating circuit sequence for parent component {parent_component.identity}: {e}"
    logger.error(error_message)
    raise CustomError(error_message, status_code=500)

def create_interactions(data_interactions, system, parent_component):
  """
    Adds interactions between components within a system.

    Args:
      data_interactions: List of interactions to create.
      system: The system to add interactions to.
      parent_component: Parent component containing the system.
  """
  
  try: 
    interaction_mapping = {
      'Inhibition': sbol3.SBO_INHIBITION,
      'Stimulation': sbol3.SBO_STIMULATION,
      'Biochemical Reaction': sbol3.SBO_BIOCHEMICAL_REACTION,
      'Non-Covalent Binding': sbol3.SBO_NON_COVALENT_BINDING,
      'Degradation': sbol3.SBO_DEGRADATION,
      'Genetic Production': sbol3.SBO_GENETIC_PRODUCTION,
      'Control': sbol3.SBO_CONTROL
    }
    role_mapping = {
      'Inhibitor': sbol3.SBO_INHIBITOR,
      'Inhibited': sbol3.SBO_INHIBITED,
      'Stimulator': sbol3.SBO_STIMULATOR,
      'Stimulated': sbol3.SBO_STIMULATED,
      'Reactant': sbol3.SBO_REACTANT,  
      'Product': sbol3.SBO_PRODUCT,
      'Modifier': sbol3.SBO_MODIFIER,
      'Modified': sbol3.SBO_MODIFIED,
      'Template': sbol3.SBO_TEMPLATE,
      'Promoter': sbol3.SBO_PROMOTER  # 'http://identifiers.org/SBO:0000598'
    }
    
    logger.info(f"Creating interactions system: {system.display_id}")

    for interaction_data in data_interactions:
      interaction_type = interaction_data.get('type')
      participants = interaction_data.get('participants')

      if interaction_type not in interaction_mapping:
        logger.warning(f"Interaction type {interaction_type} not recognized.")
        continue

      URI_interaction = interaction_mapping[interaction_type]
      participant_uris = {}

      for role_name, component_values in participants.items():
        if role_name not in role_mapping:
          logger.warning(f"Role {role_name} not recognized for participant {component_name}.")
          continue

        URI_role = role_mapping[role_name]
        
        for component_name in component_values:
          participant_obj = find_component_reference(system, parent_component, component_name)

          if participant_obj is None:
              logger.info(f"Component {component_name} not found in any system.")
              continue

          participant_uris[participant_obj] = URI_role
          
      if participant_uris:
        add_interaction(URI_interaction, participant_uris, system)
        logger.info(f"Interaction added with participants: {participant_uris}")
        
      else:
        logger.warning(f"No valid participants found for interaction {interaction_type} in system {system.display_id}.")

  except Exception as e:
    error_message = f"Error creating interactions for system '{system.display_id}': {e}"
    logger.error(error_message)
    raise CustomError(error_message, status_code=500)
  
def create_ed_components(ed_data, system):
  """
  Adds externally defined components to the system.
  If the component type is 'Protein', it adds the 'transcription factor' role.

  Args:
    ed_data: List of externally defined component data.
             Each dict in the list should have 'type', 'uri', and 'name'.
    system: The sbol3.Component to add the features to.
  
  Returns:
    list: List of the created sbol3.ExternallyDefined feature components.
  """
  
  try:
    ed_mapping = {
      'Simple Chemical': sbol3.SBO_SIMPLE_CHEMICAL,
      'Protein': sbol3.SBO_PROTEIN,
      'Restriction Enzyme': sbol3.SBO_PROTEIN
    }

    TRANSCRIPTION_FACTOR_ROLE = 'http://identifiers.org/GO:0003700'
    ed_components = []

    for data in ed_data:
      ed_type_str = data.get('type') 
      ed_uri = data.get('uri', "")    
      ed_name = data.get('name') 

      if not ed_type_str or not ed_name:
        error_message = f"Missing data for externally defined component: {data}"
        logger.error(error_message)
        raise CustomError(error_message, status_code=400)

      if ed_type_str not in ed_mapping:
        error_message = f"Unsupported externally defined component type: {ed_type_str}"
        logger.error(error_message)
        raise CustomError(error_message, status_code=400)

      sbol_component_type_iri = ed_mapping[ed_type_str]
      feature_sbol_types = [sbol_component_type_iri]
      feature_roles = []

      if ed_type_str == 'Protein':
        feature_roles.append(TRANSCRIPTION_FACTOR_ROLE)


      ed_feature = sbol3.ExternallyDefined(types=feature_sbol_types, 
                                             definition=ed_uri, 
                                             name=ed_name)
      
      added_feature = add_feature(system, ed_feature)
      
      if feature_roles:
        added_feature.roles = feature_roles
        
      ed_components.append(added_feature)
      logger.info(f"Created externally defined feature - Name: {ed_name}, Type: {ed_type_str}, Roles: {feature_roles}")

    return ed_components

  except Exception as e:
    error_message = f"An unexpected error occurred while creating externally defined components: {str(e)}"
    logger.error(error_message, exc_info=True) 
    raise CustomError(error_message, status_code=500)

def create_file_sol3(cursor, data_front, include_functional):
  """
    Creates an SBOL3 document with components, systems, and interactions based on input data.

    Args:
      cursor: Database cursor to fetch component data if necessary.
      data_front (dict): Input data containing components, systems, interactions, and external definitions (eds).
      include_functional (bool): Indicates whether to include functional data (e.g., systems and interactions).

    Returns:
      sbol3.Document: An SBOL3 document populated with the provided data.

    Workflow:
      1. Sets the namespace for the document if provided.
      2. Creates the parent component and its associated data.
      3. Iterates through additional components and adds them as subcomponents or features.
      4. Establishes hierarchical relationships between components.
      5. Creates a system with functional data (if include_functional is True).

    Notes:
      - If `include_functional` is False or `data_systems` is empty, skips system creation.
      - Relies on helper functions such as `create_component_general`, `hierarchy`, and `create_system` for modularity.
  """
  
  try:
    
    namespace = data_front.get("namespace") 
    if namespace:
        logger.info("Adding namespace to document")
        sbol3.set_namespace(namespace)
    else:
        logger.info("Namespace not provided, skipping namespace setup.")

    doc = sbol3.Document()
    
    components_data = data_front['components']
    data_systems = data_front['expressions']
    interactions = data_front['interactions']
    eds = data_front['eds']

    logger.info("Creating parent component")
    parent_component_name = components_data[0]['name']
    parent_component_uri = components_data[0]['uri']
    parent_component_type = components_data[0]['role']
    instance = components_data[0].get('instance_id', 1)
    
    component_data = None
  
    if components_data[0].get('new'):
      component_data = ComponentData(
          short_desc=components_data[0]['description'],
      )
    else:
      component_data = get_component_data(cursor, parent_component_name)

    parent_component = create_component_general(doc, parent_component_name, parent_component_type, component_data, instance, True, parent_component_uri)

    components = []

    for data in components_data[1:]:
      instance = data.get('instance_id', 1)
      component_uri = data.get('uri')
      component_name_with_instance = f"{data['name']}_{instance}"
      existing_subcomponent = None
      existing_subcomponent = next((component for component in parent_component.features 
                                if isinstance(component, sbol3.SubComponent) 
                                and component.instance_of.lookup().display_id== data['name']), None)

      if existing_subcomponent:
        logger.info(f"Component {data['name']} already exists. Adding as a SubComponent.")
        subcomponent = sbol3.SubComponent(existing_subcomponent.instance_of)
        subcomponent.name = component_name_with_instance
        parent_component.features.append(subcomponent)
        components.append(subcomponent)
        continue

      component_data = None
      if data.get('new'):
        logger.info(f"Creating new component {data['name']} with data from user")
        component_data = ComponentData(
          short_desc=data.get('description', ''),
          sequence=data.get('sequence', ''),
          sequence_length=data.get('sequence_length', 0)
        )
      else:
        component_data = get_component_data(cursor, data['name'])
        if component_data is None:
          logger.warning(f"Not found component {data['name']} in database")
          continue
      
      component = create_component_general(doc, data['name'], data['role'], component_data, instance, False, component_uri)
      subcomponent = sbol3.SubComponent(component)
      subcomponent.name = component_name_with_instance
      parent_component.features.append(subcomponent)
      components.append(subcomponent)

      if component_data:
        component_namespace = f"{data['uri']}{data['name']}#"
        add_annotations(component, component_data, component_namespace)

    hierarchy(parent_component, components)

    if include_functional and data_systems:
        create_system(doc, parent_component, data_systems, interactions, eds)
    else:
      logger.info("Skipping system creation as include_functional is False or expressions is empty.")

    return doc
  
  except Exception as e:
    error_message = f"Error creating SBOL3 document: {e}"
    logger.error(error_message)
    raise CustomError(error_message, status_code=500)

def validate_sbol3_document(doc):
    """
    Validates an SBOL3 document and returns a validation report.
    """
    validation_report = doc.validate()
    return len(validation_report) == 0, [str(issue) for issue in validation_report]

def generate_related_filename(file_path, suffix, extension):
    """
    Generates a new filename by appending a suffix to the original filename.
    """
    base_name = os.path.splitext(os.path.basename(file_path))[0]
    return f"{base_name}_{suffix}.{extension}"
  
def generate_sbol3_file(data_front, cursor, id_path, include_functional):
  """
  Generates an SBOL3 file based on the provided data and saves it to the filesystem.

  Args:
    data_front (dict): Input data containing components, systems, and interactions.
    cursor: Database cursor to fetch additional component information.
    id_path (str): Unique identifier to differentiate output files.
    include_functional (bool): Whether to include functional data in the SBOL3 file.

  Returns:
    tuple: (file_path, None) if successful, or (None, error_message) if an error occurs.
  """
  
  try:
    logger.info("Starting SBOL3 file generation.")

    if not os.path.exists(FILES_GENERATED_DIR):
      os.makedirs(FILES_GENERATED_DIR, exist_ok=True)
            
    doc = create_file_sol3(cursor, data_front, include_functional)
    
    if include_functional:
      file_name = f'full_sbol3_{id_path}.xml'
    else:
      file_name = f'structural_sbol3_{id_path}.xml'

    file_path = os.path.join(FILES_GENERATED_DIR, file_name)
    
    doc.write(file_path)
    logger.info(f"SBOL3 file generated successfully: {file_path}")

    return file_path, None
  
  except CustomError as ce:
    logger.error(f"Custom error during SBOL3 file generation: {ce.message}")
    raise ce

  except Exception as e:
    error_message = f"Error generating SBOL3 file: {e}"
    logger.error(error_message)
    raise CustomError(error_message, status_code=500)
