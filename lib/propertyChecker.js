function propertyChecker(body, bodyStructure) {
  const bodyStructureEntries = Object.entries(bodyStructure);
  
  let propertyCorrection = false;
  
  if (bodyStructureEntries.length !== 0) {
    bodyStructureEntries.forEach((property) => {
      if (property[0] in body) {
        if (property[1] === 'array') {
          if (!Array.isArray(body[property[0]])) {
            propertyCorrection = {
              code: 400,
              message: `property ${property[0]} harus bertipe ${property[1]}`,
            };
          } else if (body[property[0]].length === 0) {
            propertyCorrection = {
              code: 400,
              message: `property ${property[0]} tidak boleh kosong`,
            };
          }
        } else {
          if (typeof body[property[0]] !== property[1]) {
            propertyCorrection = {
              code: 400,
              message: `property ${property[0]} harus bertipe ${property[1]}`,
            };
          } else if (body[property[0]].length === 0) {
            propertyCorrection = {
              code: 400,
              message: `property ${property[0]} tidak boleh kosong`,
            };
          }
        }
      } else {
        propertyCorrection = {
          code: 400,
          message: `request harus berisi property: ${Object.keys(bodyStructure).join(', ')}`,
        };
      }
    });
  }

  return propertyCorrection;
}

module.exports = propertyChecker;
