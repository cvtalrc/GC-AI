import sbol3
from sbol_utilities.helper_functions import find_top_level, cached_references

def add_biobrick_scar(next_sequence):
  """
  Add the appropriate BioBrick scar based on the start of the next sequence.
  """
  if next_sequence.startswith("at"):
    return "tactag"
  else:
    return "tactagag"

def calculate_seq_with_scars(parent_component, components):
  """Compute the sequence of a component and add this information into the Component in place.

  :param component: Component whose sequence is to be computed
  :return: Sequence that has been computed
  """
  
  sequence = sbol3.Sequence(parent_component.display_id + "_sequence",
                            elements='',
                            encoding=sbol3.IUPAC_DNA_ENCODING)

  with cached_references(parent_component.document):
    for i, subcomponent in enumerate(components):
      subc = find_top_level(subcomponent.instance_of)
      assert len(subc.sequences) == 1
      subseq = find_top_level(subc.sequences[0])
      assert sequence.encoding == subseq.encoding

      if i > 0:
        next_sequence = subseq.elements
        scar = add_biobrick_scar(next_sequence)
        sequence.elements += scar

      start_position = len(sequence.elements) + 1
      sequence.elements += subseq.elements
      end_position = len(sequence.elements)
      subcomponent.locations.append(sbol3.Range(sequence, start_position, end_position))

  parent_component.document.add(sequence)
  parent_component.sequences.append(sequence)
  return sequence