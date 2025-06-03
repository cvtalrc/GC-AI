export const validateNamespace = (namespace) => {
  if (!namespace || namespace.trim() === "") {
    return null;
  }

  try {
    const url = new URL(namespace);
    if (!url.href.startsWith("http://") && !url.href.startsWith("https://")) {
      return "'Namespace' must start with http or https";
    }
  } catch {
    return "'Namespace' must be a valid URL starting with http or https";
  }

  return null;
};

export const validateComponent = (component) => {
  const componentErrors = {};

  if (!component.id?.trim()) {
    componentErrors.id = "ID cannot be empty";
  }

  if (!component.uri?.trim()) {
    componentErrors.uri = "'URI' cannot be empty";
  } else {
    try {
      const url = new URL(component.uri);
      if (!url.href.startsWith("http://") && !url.href.startsWith("https://")) {
        componentErrors.uri = "'URI' must start with http or https";
      }
    } catch {
      componentErrors.uri = "'URI' must be a valid URL starting with http or https";
    }
  }

  if (component.new === undefined) {
    componentErrors.new = "New flag cannot be empty";
  }

  if (!component.identifier?.trim()) {
    componentErrors.identifier = "'Identifier' cannot be empty";
  }

  if (!component.name?.trim()) {
    componentErrors.name = "'Name' cannot be empty";
  }

  if (!component.role?.trim()) {
    componentErrors.role = "'Role' cannot be empty";
  }

  if (component.id !== "component-principal") {
    if (!component.sequence?.trim()) {
      componentErrors.sequence = "'Sequence' cannot be empty";
    }

    if (component.sequence_length === undefined || component.sequence_length === "") {
      componentErrors.sequence_length = "'Sequence length' cannot be empty";
    }
  }

  return Object.keys(componentErrors).length > 0 ? componentErrors : null;
};

export const validatePrediction = (prediction) => {
  const errors = {};
  const nameRoleMap = {};

  const principalComponent = prediction.find(component => component.id === "component-principal");

  if (principalComponent) {
    prediction.forEach((component) => {
      if (component.id !== "component-principal") {
        if (component.identifier === principalComponent.identifier) {
          if (!errors[principalComponent.id]) {
            errors[principalComponent.id] = {};
          }
          errors[principalComponent.id].identifier = `'Identifier' "${principalComponent.identifier}" must be unique.`;
        }
        if (component.name === principalComponent.name) {
          if (!errors[principalComponent.id]) {
            errors[principalComponent.id] = {};
          }
          errors[principalComponent.id].name = `'Name' "${principalComponent.name}" must be unique.`;
        }
      }
    });
  }

  prediction.forEach((component) => {
    const componentErrors = validateComponent(component);

    if (component.name && component.role) {
      if (!nameRoleMap[component.name]) {
        nameRoleMap[component.name] = new Set();
      }
      nameRoleMap[component.name].add(component.role);
    }

    if (componentErrors) {
      errors[component.id] = componentErrors;
    }
  });

  const normalizedNameRoleMap = {};

  Object.keys(nameRoleMap).forEach((key) => {
    const normalizedKey = key.toLowerCase();
    if (!normalizedNameRoleMap[normalizedKey]) {
      normalizedNameRoleMap[normalizedKey] = new Set();
    }
    nameRoleMap[key].forEach((role) => normalizedNameRoleMap[normalizedKey].add(role));
  });

  prediction.forEach((component) => {
    const normalizedName = component.name.toLowerCase();
    const roles = normalizedNameRoleMap[normalizedName];

    if (roles && roles.size > 1) {
      if (!errors[component.id]) {
        errors[component.id] = {};
      }
      errors[component.id].name = `'Name' "${component.name}" cannot have different roles (${[...roles].join(', ')}).`;
    }
  });
  return Object.keys(errors).length > 0 ? errors : null;
};

export const validateExpressions = (expressions) => {
  const errors = {};

  expressions.forEach((expression) => {
    const expressionErrors = {};

    if (!expression.name?.trim()) {
      expressionErrors.name = "'Name' cannot be empty";
    }

    if (!Array.isArray(expression.components) || expression.components.length === 0) {
      expressionErrors.components = "'Components' cannot be empty";
    }

    if (Array.isArray(expression.unions) && expression.unions.length > 0) {
      const unionsErrors = [];

      expression.unions.forEach((union) => {
        const unionErrors = {};
        if (!union.from?.name?.trim()) {
          unionErrors.from = "'From' cannot be empty";
        }
        if (!union.to?.name?.trim()) {
          unionErrors.to = "'To' cannot be empty";
        }
        if (!union.type?.trim()) {
          unionErrors.type = "'Type' cannot be empty";
        }
        if (Object.keys(unionErrors).length > 0) {
          unionsErrors[union.id] = unionErrors;
        }
      });
      if (Object.keys(unionsErrors).length > 0) {
        expressionErrors.unions = unionsErrors;
      }

    } else {
      expressionErrors.unions = "'Unions' cannot be empty";
    }

    if (Object.keys(expressionErrors).length > 0) {
      errors[expression.id] = expressionErrors;
    }
  });

  return Object.keys(errors).length > 0 ? errors : null;
};

export const validateEds = (eds) => {
  const errors = {};

  eds.forEach((ed) => {
    const edErrors = {};

    if (!ed.name?.trim()) {
      edErrors.name = "'Name' cannot be empty";
    }

    if (ed.uri?.trim()) {
      try {
        const url = new URL(ed.uri);
        if (!url.href.startsWith("http://") && !url.href.startsWith("https://")) {
          edErrors.uri = "'URI' must start with http or https";
        }
      } catch {
        edErrors.uri = "'URI' must be a valid URL starting with http or https";
      }
    }
    if (!ed.type?.trim()) {
      edErrors.type = "'Type' cannot be empty";
    }

    if (Object.keys(edErrors).length > 0) {
      errors[ed.id] = edErrors;
    }
  });

  return Object.keys(errors).length > 0 ? errors : null;
};

export const validateInteractions = (interactions) => {
  const errors = {};

  interactions.forEach((interaction) => {
    const interactionErrors = {};

    if (!interaction.type?.trim()) {
      interactionErrors.type = "'Interaction Type' cannot be empty";
    }

    const participants = interaction.participants || {};
    const participantsErrors = {};

    Object.keys(participants).forEach((role) => {
      const roleParticipants = participants[role] || [];

      if (roleParticipants.length === 0) {
        participantsErrors[role] = `No participants provided for the role '${role}'.`;
      } else {
        roleParticipants.forEach((participant) => {
          const participantErrors = {};

          if (!participant?.name?.trim()) {
            participantErrors.name = `'${role}' cannot be empty.`;
          }

          if (Object.keys(participantErrors).length > 0) {
            if (!participantsErrors[role]) participantsErrors[role] = {};
            participantsErrors[role][participant.instance_id || participant.id] = participantErrors;
          }
        });
      }
    });

    if (Object.keys(participantsErrors).length > 0) {
      interactionErrors.participants = participantsErrors;
    }

    if (Object.keys(interactionErrors).length > 0) {
      errors[interaction.id] = interactionErrors;
    }
  });

  return Object.keys(errors).length > 0 ? errors : null;
};

export const validateForm = ({ namespace, prediction, expressions, interactions, eds }, participantRoles) => {
  const errors = {};

  const namespaceError = validateNamespace(namespace);
  if (namespaceError) {
    errors.namespace = namespaceError;
  }

  const predictionErrors = validatePrediction(prediction);
  if (predictionErrors) {
    errors.prediction = predictionErrors;
  }

  const expressionsErrors = validateExpressions(expressions);
  if (expressionsErrors) {
    errors.expressions = expressionsErrors;
  }

  const interactionsErrors = validateInteractions(interactions, participantRoles);
  if (interactionsErrors) {
    errors.interactions = interactionsErrors;
  }

  const edsErrors = validateEds(eds);
  if (edsErrors) {
    errors.eds = edsErrors;
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

