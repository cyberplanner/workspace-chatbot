
/**
 * Setup prototype on string for replacing between two indexes
 */
String.prototype.replaceBetween = function(start, end, what) {
    return this.substring(0, start) + what + this.substring(end);
};

/**
 * Processes a response - substituting variables {var} for a value
 * in userData.summary
 * 
 * @param {*} session the session - so as to retrieve user data
 * @param {*} message the message to run substitution on
 * 
 * @returns Message with substitutions.
 */
const processResponse = (session, message) => {
  let summary = session.userData.summary;
  let newMessage = "" + message;
  let indexOf = newMessage.indexOf('{');
  while (indexOf >= 0) {
    let end = newMessage.indexOf('}');
    if (end >= 0) {
      let key = newMessage.substring(indexOf + 1, end);
      let val = "";
      if (summary) {
        val = " " + summary[key];
      }
      if (!summary || !summary[key]) {
        val = "";
      }
      newMessage = newMessage.replaceBetween(indexOf - 1, end + 1, val);
      indexOf = newMessage.indexOf('{');
    }
  }
  return newMessage.trim();
}
/**
 * Checks the current message against any conditions specified in the 
 * node provided.
 * 
 * @param {*} node the node to check assertions on
 * @param {*} session the conversation session
 * @param {*} args the "arguments" passed by LUIS, including entities
 * @param {*} next the next function in the chain
 */
const checkConditions = (node, session, args, next) => {
  console.log(JSON.stringify(node.conditions));
  if (node.conditions && node.conditions.length > 0) {
    return node.conditions.reduce((result, condition) => {
      if (result) {

        let entity = args.entities.find(entity => {
          console.log(JSON.stringify(entity));
          return entity.type === condition.entityId;
        });
        if (!entity) {
          // No result, return false;
          return false;
        }
        // Great - we've got a result, carry on.
        let result = entity.resolution.values.reduce((result, value) => {
          if (result) {
            return true;
          } else {
            switch (condition.comparator) {
              case "EQUALS":
                return value === condition.value;
              case "CONTAINS":
                return value.includes(condition.value);
              case "REGEX_MATCH":
                return new RegExp(condition.value).test(value);
              default:
                return false;
            }
          }
        }, false);

        if (condition.not) {
          return !result;
        } else {
          return result;
        }

      } else {
        // Give up - a condition hasn't been met
        return false;
      }
    }, true);
  } else {
    // No conditions present - just return true.
    return true;
  }
}
module.exports = {
  processResponse: processResponse,
  checkConditions: checkConditions
}