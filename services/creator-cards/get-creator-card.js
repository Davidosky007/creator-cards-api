const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const CreatorCardMessages = require('@app/messages/creator-card');
const CreatorCard = require('@app/repository/creator-cards');
const serializeCard = require('./utils/serialize-card');

const spec = `root {
  slug string<trim>
  access_code? string
}`;

const parsedSpec = validator.parse(spec);

async function getCreatorCard(serviceData, options = {}) {
  const data = validator.validate(serviceData, parsedSpec);
  let result;

  try {
    // Rule 1: card must exist and not be deleted
    const card = await CreatorCard.findOne({
      query: { slug: data.slug, deleted: null },
    });

    if (!card) {
      throwAppError(CreatorCardMessages.CARD_NOT_FOUND, 'NF01');
    }

    // Rule 2: draft cards are not publicly retrievable
    if (card.status === 'draft') {
      throwAppError(CreatorCardMessages.CARD_IS_DRAFT, 'NF02');
    }

    // Rule 3 & 4: private card access control
    if (card.access_type === 'private') {
      if (!data.access_code) {
        throwAppError(CreatorCardMessages.PRIVATE_CARD_NO_CODE, 'AC03');
      }

      if (data.access_code !== card.access_code) {
        throwAppError(CreatorCardMessages.INVALID_ACCESS_CODE, 'AC04');
      }
    }

    // access_code is NEVER included in retrieval responses
    result = serializeCard(card, { includeAccessCode: false });
  } catch (error) {
    appLogger.errorX(error, 'get-creator-card-error');
    throw error;
  }

  return result;
}

module.exports = getCreatorCard;
