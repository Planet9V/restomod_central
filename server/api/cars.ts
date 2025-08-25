import { Router } from 'express';
import { getCarsForSale } from '@server/storage';

const carsRouter = Router();

carsRouter.get('/', async (req, res) => {
  const { make, category, priceMin, priceMax, year, search } = req.query;

  const filters = {
    make: make as string | undefined,
    category: category as string | undefined,
    priceMin: priceMin ? parseFloat(priceMin as string) : undefined,
    priceMax: priceMax ? parseFloat(priceMax as string) : undefined,
    year: year ? parseInt(year as string, 10) : undefined,
    search: search as string | undefined,
  };

  try {
    const vehicleList = await getCarsForSale(filters);
    res.json(vehicleList);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

export default carsRouter;
