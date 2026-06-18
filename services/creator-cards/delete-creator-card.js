const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const CreatorCardMessages = require('@app/messages/creator-card');
const CreatorCard = require('@app/repository/creator-cards');
const serializeCard = require('./utils/serialize-card');

const spec = `root {
  slug string<trim>
  creator_reference string<length:20>
}`;

const parsedSpec = validator.parse(spec);

async function deleteCreatorCard(serviceData, options = {}) {
  const data = validator.validate(serviceData, parsedSpec);
  let result;

  try {
    // Find card — must exist and not already be deleted
    const card = await CreatorCard.findOne({
      query: { slug: data.slug },
    });

    if (!card || card.deleted) {
      throwAppError(CreatorCardMessages.CARD_NOT_FOUND, 'NF01');
    }


    const now = Date.now();

    // Soft delete — set deleted and updated timestamps
    await CreatorCard.updateOne({
      query: { slug: data.slug },
      updateValues: { deleted: now, updated: now },
    });

    // Build the deleted card object for the response
    const cardObj = card.toObject ? card.toObject() : Object.assign({}, card);
    cardObj.deleted = now;
    cardObj.updated = now;

    // Return deleted card in creation response format (access_code included)
    result = serializeCard(cardObj, { includeAccessCode: true });
  } catch (error) {
    appLogger.errorX(error, 'delete-creator-card-error');
    throw error;
  }

  return result;
}

module.exports = deleteCreatorCard;
