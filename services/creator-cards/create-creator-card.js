const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const { ulid } = require('@app-core/randomness');
const CreatorCardMessages = require('@app/messages/creator-card');
const CreatorCard = require('@app/repository/creator-cards');
const { generateSlug, generateSlugWithSuffix } = require('./utils/generate-slug');
const serializeCard = require('./utils/serialize-card');

const spec = `root {
  title string<trim|lengthBetween:3,100>
  description? string<trim|maxLength:500>
  slug? string<trim|lengthBetween:5,50>
  creator_reference string<length:20>
  links[]? {
    title string<trim|lengthBetween:1,100>
    url string<trim|maxLength:200>
  }
  service_rates? {
    currency string(NGN|USD|GBP|GHS)
    rates[] {
      name string<trim|lengthBetween:3,100>
      description? string<trim|maxLength:250>
      amount number<min:1>
    }
  }
  status string(draft|published)
  access_type? string(public|private)
  access_code? string<lengthBetween:6,6>
}`;

const parsedSpec = validator.parse(spec);

async function createCreatorCard(serviceData, options = {}) {
  const data = validator.validate(serviceData, parsedSpec);
  let result;

  try {
    const accessType = data.access_type || 'public';

    // Business rule AC01: access_code required when private
    if (accessType === 'private' && !data.access_code) {
      throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED, 'AC01');
    }

    // Business rule AC05: access_code must not be set on public cards
    if (accessType !== 'private' && data.access_code) {
      throwAppError(CreatorCardMessages.ACCESS_CODE_NOT_ALLOWED, 'AC05');
    }

    // Business rule: amount must be a positive integer (no decimals)
    if (data.service_rates && data.service_rates.rates) {
      data.service_rates.rates.forEach((rate) => {
        if (!Number.isInteger(rate.amount) || rate.amount < 1) {
          throwAppError(
            'service_rates.rates[].amount must be a positive integer',
            'INVLDDATA'
          );
        }
      });
    }

    // Slug logic
    const slugProvided = !!data.slug;
    let slug = data.slug;

    if (!slug) {
      slug = generateSlug(data.title);
      if (slug.length < 5) {
        slug = generateSlugWithSuffix(slug);
      }
    }

    // Check slug uniqueness
    const existing = await CreatorCard.findOne({
      query: { slug, deleted: null },
    });

    if (existing && slugProvided) {
      // Client provided slug that is taken — error SL02
      throwAppError(CreatorCardMessages.SLUG_ALREADY_TAKEN, 'SL02');
    }

    if (existing && !slugProvided) {
      // Auto-generated slug is taken — append suffix and try
      slug = generateSlugWithSuffix(generateSlug(data.title));
    }

    const now = Date.now();

    const card = await CreatorCard.create({
      _id: ulid(),
      title: data.title,
      description: data.description || null,
      slug,
      creator_reference: data.creator_reference,
      links: data.links || [],
      service_rates: data.service_rates || null,
      status: data.status,
      access_type: accessType,
      access_code: data.access_code || null,
      created: now,
      updated: now,
      deleted: null,
    });

    result = serializeCard(card, { includeAccessCode: true });
  } catch (error) {
    appLogger.errorX(error, 'create-creator-card-error');
    throw error;
  }

  return result;
}

module.exports = createCreatorCard;
