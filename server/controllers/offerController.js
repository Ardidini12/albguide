import * as service from '../services/offerService.js';

export async function list(req, res) {
  try {
    // If admin, show all? Or usually separates logic.
    // Let's assume public endpoint shows active. Admin endpoint (protected) shows all.
    // For now, we'll use a query param or separate routes?
    // Let's use `request_is_admin` logic or different usage.
    // We'll trust the route protection.
    // If public route -> listActive.
    // If admin route -> listAll.
    // This controller handles both if we check req.user.
    
    if (req.user?.is_admin) {
      const offers = await service.listAllOffers();
      return res.json({ offers });
    } else {
      const offers = await service.listActiveOffers();
      return res.json({ offers });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function create(req, res) {
  try {
    const offer = await service.createOffer(req.body);
    return res.status(201).json({ offer });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(409).json({ message: 'Code already exists' });
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function update(req, res) {
  try {
    const offer = await service.updateOffer(req.params.id, req.body);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    return res.json({ offer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function destroy(req, res) {
  try {
    const id = await service.deleteOffer(req.params.id);
    if (!id) return res.status(404).json({ message: 'Offer not found' });
    return res.json({ message: 'Offer deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
