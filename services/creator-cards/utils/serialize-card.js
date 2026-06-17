function serializeCard(card, options) {
  const includeAccessCode = options && options.includeAccessCode === true;
  const obj = card.toObject ? card.toObject() : Object.assign({}, card);

  const result = {
    id: obj._id,
    title: obj.title,
    description: obj.description || null,
    slug: obj.slug,
    creator_reference: obj.creator_reference,
    links: obj.links || [],
    service_rates: obj.service_rates || null,
    status: obj.status,
    access_type: obj.access_type,
    created: obj.created,
    updated: obj.updated,
    deleted: obj.deleted !== undefined ? obj.deleted : null,
  };

  if (includeAccessCode) {
    result.access_code = obj.access_code || null;
  }

  return result;
}

module.exports = serializeCard;
