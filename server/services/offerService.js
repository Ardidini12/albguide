import * as offerModel from '../models/offerModel.js';

export async function createOffer(data) {
  return await offerModel.createOffer(data);
}

export async function listActiveOffers() {
  return await offerModel.listActiveOffers();
}

export async function listAllOffers() {
  return await offerModel.listAllOffers();
}

export async function updateOffer(id, data) {
  return await offerModel.updateOffer(id, data);
}

export async function deleteOffer(id) {
  return await offerModel.deleteOffer(id);
}
