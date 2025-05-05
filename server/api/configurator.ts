import { Request, Response } from 'express';
import {
  carModels, carModelsInsertSchema,
  engineOptions, engineOptionsInsertSchema,
  transmissionOptions, transmissionOptionsInsertSchema,
  colorOptions, colorOptionsInsertSchema,
  wheelOptions, wheelOptionsInsertSchema,
} from '@shared/schema';
import { db } from '@db';
import { eq } from 'drizzle-orm';

// Car models API routes
export async function getCarModels(req: Request, res: Response) {
  try {
    const result = await db.query.carModels.findMany({
      orderBy: (carModels, { desc }) => [desc(carModels.featured), carModels.name],
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching car models:', error);
    res.status(500).json({ error: 'Failed to fetch car models' });
  }
}

export async function getCarModelById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const result = await db.query.carModels.findFirst({
      where: eq(carModels.id, id),
    });
    if (!result) {
      return res.status(404).json({ error: 'Car model not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching car model:', error);
    res.status(500).json({ error: 'Failed to fetch car model' });
  }
}

export async function createCarModel(req: Request, res: Response) {
  try {
    const validatedData = carModelsInsertSchema.parse(req.body);
    const [result] = await db.insert(carModels).values(validatedData).returning();
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating car model:', error);
    res.status(500).json({ error: 'Failed to create car model' });
  }
}

export async function updateCarModel(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const validatedData = carModelsInsertSchema.parse(req.body);
    const [result] = await db
      .update(carModels)
      .set(validatedData)
      .where(eq(carModels.id, id))
      .returning();

    if (!result) {
      return res.status(404).json({ error: 'Car model not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error updating car model:', error);
    res.status(500).json({ error: 'Failed to update car model' });
  }
}

export async function deleteCarModel(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const [result] = await db
      .delete(carModels)
      .where(eq(carModels.id, id))
      .returning();

    if (!result) {
      return res.status(404).json({ error: 'Car model not found' });
    }
    res.json({ message: 'Car model deleted successfully' });
  } catch (error) {
    console.error('Error deleting car model:', error);
    res.status(500).json({ error: 'Failed to delete car model' });
  }
}

// Engine options API routes
export async function getEngineOptions(req: Request, res: Response) {
  try {
    const result = await db.query.engineOptions.findMany({
      orderBy: (engineOptions, { asc }) => [asc(engineOptions.name)],
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching engine options:', error);
    res.status(500).json({ error: 'Failed to fetch engine options' });
  }
}

export async function getEngineOptionById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const result = await db.query.engineOptions.findFirst({
      where: eq(engineOptions.id, id),
    });
    if (!result) {
      return res.status(404).json({ error: 'Engine option not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching engine option:', error);
    res.status(500).json({ error: 'Failed to fetch engine option' });
  }
}

export async function createEngineOption(req: Request, res: Response) {
  try {
    const validatedData = engineOptionsInsertSchema.parse(req.body);
    const [result] = await db.insert(engineOptions).values(validatedData).returning();
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating engine option:', error);
    res.status(500).json({ error: 'Failed to create engine option' });
  }
}

export async function updateEngineOption(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const validatedData = engineOptionsInsertSchema.parse(req.body);
    const [result] = await db
      .update(engineOptions)
      .set(validatedData)
      .where(eq(engineOptions.id, id))
      .returning();

    if (!result) {
      return res.status(404).json({ error: 'Engine option not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error updating engine option:', error);
    res.status(500).json({ error: 'Failed to update engine option' });
  }
}

export async function deleteEngineOption(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const [result] = await db
      .delete(engineOptions)
      .where(eq(engineOptions.id, id))
      .returning();

    if (!result) {
      return res.status(404).json({ error: 'Engine option not found' });
    }
    res.json({ message: 'Engine option deleted successfully' });
  } catch (error) {
    console.error('Error deleting engine option:', error);
    res.status(500).json({ error: 'Failed to delete engine option' });
  }
}

// Transmission options API routes
export async function getTransmissionOptions(req: Request, res: Response) {
  try {
    const result = await db.query.transmissionOptions.findMany({
      orderBy: (transmissionOptions, { asc }) => [asc(transmissionOptions.name)],
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching transmission options:', error);
    res.status(500).json({ error: 'Failed to fetch transmission options' });
  }
}

export async function getTransmissionOptionById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const result = await db.query.transmissionOptions.findFirst({
      where: eq(transmissionOptions.id, id),
    });
    if (!result) {
      return res.status(404).json({ error: 'Transmission option not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching transmission option:', error);
    res.status(500).json({ error: 'Failed to fetch transmission option' });
  }
}

export async function createTransmissionOption(req: Request, res: Response) {
  try {
    const validatedData = transmissionOptionsInsertSchema.parse(req.body);
    const [result] = await db.insert(transmissionOptions).values(validatedData).returning();
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating transmission option:', error);
    res.status(500).json({ error: 'Failed to create transmission option' });
  }
}

export async function updateTransmissionOption(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const validatedData = transmissionOptionsInsertSchema.parse(req.body);
    const [result] = await db
      .update(transmissionOptions)
      .set(validatedData)
      .where(eq(transmissionOptions.id, id))
      .returning();

    if (!result) {
      return res.status(404).json({ error: 'Transmission option not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error updating transmission option:', error);
    res.status(500).json({ error: 'Failed to update transmission option' });
  }
}

export async function deleteTransmissionOption(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const [result] = await db
      .delete(transmissionOptions)
      .where(eq(transmissionOptions.id, id))
      .returning();

    if (!result) {
      return res.status(404).json({ error: 'Transmission option not found' });
    }
    res.json({ message: 'Transmission option deleted successfully' });
  } catch (error) {
    console.error('Error deleting transmission option:', error);
    res.status(500).json({ error: 'Failed to delete transmission option' });
  }
}

// Color options API routes
export async function getColorOptions(req: Request, res: Response) {
  try {
    const result = await db.query.colorOptions.findMany({
      orderBy: (colorOptions, { asc }) => [asc(colorOptions.name)],
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching color options:', error);
    res.status(500).json({ error: 'Failed to fetch color options' });
  }
}

export async function getColorOptionById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const result = await db.query.colorOptions.findFirst({
      where: eq(colorOptions.id, id),
    });
    if (!result) {
      return res.status(404).json({ error: 'Color option not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching color option:', error);
    res.status(500).json({ error: 'Failed to fetch color option' });
  }
}

export async function createColorOption(req: Request, res: Response) {
  try {
    const validatedData = colorOptionsInsertSchema.parse(req.body);
    const [result] = await db.insert(colorOptions).values(validatedData).returning();
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating color option:', error);
    res.status(500).json({ error: 'Failed to create color option' });
  }
}

export async function updateColorOption(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const validatedData = colorOptionsInsertSchema.parse(req.body);
    const [result] = await db
      .update(colorOptions)
      .set(validatedData)
      .where(eq(colorOptions.id, id))
      .returning();

    if (!result) {
      return res.status(404).json({ error: 'Color option not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error updating color option:', error);
    res.status(500).json({ error: 'Failed to update color option' });
  }
}

export async function deleteColorOption(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const [result] = await db
      .delete(colorOptions)
      .where(eq(colorOptions.id, id))
      .returning();

    if (!result) {
      return res.status(404).json({ error: 'Color option not found' });
    }
    res.json({ message: 'Color option deleted successfully' });
  } catch (error) {
    console.error('Error deleting color option:', error);
    res.status(500).json({ error: 'Failed to delete color option' });
  }
}

// Wheel options API routes
export async function getWheelOptions(req: Request, res: Response) {
  try {
    const result = await db.query.wheelOptions.findMany({
      orderBy: (wheelOptions, { asc }) => [asc(wheelOptions.name)],
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching wheel options:', error);
    res.status(500).json({ error: 'Failed to fetch wheel options' });
  }
}

export async function getWheelOptionById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const result = await db.query.wheelOptions.findFirst({
      where: eq(wheelOptions.id, id),
    });
    if (!result) {
      return res.status(404).json({ error: 'Wheel option not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching wheel option:', error);
    res.status(500).json({ error: 'Failed to fetch wheel option' });
  }
}

export async function createWheelOption(req: Request, res: Response) {
  try {
    const validatedData = wheelOptionsInsertSchema.parse(req.body);
    const [result] = await db.insert(wheelOptions).values(validatedData).returning();
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating wheel option:', error);
    res.status(500).json({ error: 'Failed to create wheel option' });
  }
}

export async function updateWheelOption(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const validatedData = wheelOptionsInsertSchema.parse(req.body);
    const [result] = await db
      .update(wheelOptions)
      .set(validatedData)
      .where(eq(wheelOptions.id, id))
      .returning();

    if (!result) {
      return res.status(404).json({ error: 'Wheel option not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error updating wheel option:', error);
    res.status(500).json({ error: 'Failed to update wheel option' });
  }
}

export async function deleteWheelOption(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const [result] = await db
      .delete(wheelOptions)
      .where(eq(wheelOptions.id, id))
      .returning();

    if (!result) {
      return res.status(404).json({ error: 'Wheel option not found' });
    }
    res.json({ message: 'Wheel option deleted successfully' });
  } catch (error) {
    console.error('Error deleting wheel option:', error);
    res.status(500).json({ error: 'Failed to delete wheel option' });
  }
}
