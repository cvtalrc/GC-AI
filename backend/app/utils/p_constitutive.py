import sbol3
from sbol_utilities.component import *

def promoter_constitutive(target: Union[sbol3.Feature, sbol3.Component], system: Optional[sbol3.Component] = None)\
      -> sbol3.Feature:
  """Add a constitutive promoter regulating the target feature.

  :param target: 5' region for promoter to regulate
  :param system: optional explicit statement of system
  :return: newly created constitutive promoter
  """

  system = ensure_singleton_system(system, target)
  target = ensure_singleton_feature(system, target)

  local = sbol3.LocalSubComponent([sbol3.SBO_DNA], roles=['https://identifiers.org/SO:0002050'])
  promoter_component = add_feature(system, local)
  regulate(promoter_component, target)

  # TODO: add lookups for constraints like we have for interactions
  containers = [c.subject for c in system.constraints
                if c.restriction == sbol3.SBOL_CONTAINS and c.object == target.identity]
  for c in containers:
    contains(find_child(c), promoter_component)

  return promoter_component
