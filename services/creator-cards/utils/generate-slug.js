const { randomBytes } = require('@app-core/randomness');

function isValidSlugChar(char) {
  const code = char.charCodeAt(0);
  const isLowerLetter = code >= 97 && code <= 122;
  const isNumber = code >= 48 && code <= 57;
  const isHyphen = char === '-';
  const isUnderscore = char === '_';
  return isLowerLetter || isNumber || isHyphen || isUnderscore;
}

function generateSlug(title) {
  const lowered = title.toLowerCase();
  let slug = '';

  for (let i = 0; i < lowered.length; i++) {
    const char = lowered[i];
    if (char === ' ') {
      slug += '-';
    } else if (isValidSlugChar(char)) {
      slug += char;
    }
  }

  return slug;
}

function generateSlugWithSuffix(base) {
  const suffix = randomBytes(3);
  return `${base}-${suffix}`;
}

module.exports = { generateSlug, generateSlugWithSuffix };
