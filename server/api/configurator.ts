import { Request, Response } from 'express';
import { db } from '@db';
import {
  carModels,
  engineOptions,
  transmissionOptions,
  colorOptions,
  wheelOptions,
  interiorOptions,
  aiOptions,
  additionalOptions,
  userConfigurations,
  carModelsInsertSchema,
  engineOptionsInsertSchema,
  transmissionOptionsInsertSchema,
  colorOptionsInsertSchema,
  wheelOptionsInsertSchema,
  interiorOptionsInsertSchema,
  aiOptionsInsertSchema,
  additionalOptionsInsertSchema,
  userConfigurationsInsertSchema
} from '@shared/schema';
import { eq, inArray, desc } from 'drizzle-orm';
import { z } from 'zod';

// Get all car models
export const getAllCarModels = async (req: Request, res: Response) => {
  try {
    const models = await db.query.carModels.findMany({
      orderBy: [desc(carModels.featured), desc(carModels.name)]
    });
    return res.status(200).json(models);
  } catch (error) {
    console.error('Error fetching car models:', error);
    return res.status(500).json({ error: 'Failed to fetch car models' });
  }
};

// Get car model by ID
export const getCarModelById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const model = await db.query.carModels.findFirst({
      where: eq(carModels.id, parseInt(id))
    });
    if (!model) {
      return res.status(404).json({ error: 'Car model not found' });
    }
    return res.status(200).json(model);
  } catch (error) {
    console.error(`Error fetching car model with ID ${id}:`, error);
    return res.status(500).json({ error: 'Failed to fetch car model' });
  }
};

// Get car model by slug
export const getCarModelBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  try {
    const model = await db.query.carModels.findFirst({
      where: eq(carModels.slug, slug)
    });
    if (!model) {
      return res.status(404).json({ error: 'Car model not found' });
    }
    return res.status(200).json(model);
  } catch (error) {
    console.error(`Error fetching car model with slug ${slug}:`, error);
    return res.status(500).json({ error: 'Failed to fetch car model' });
  }
};

// Create car model
export const createCarModel = async (req: Request, res: Response) => {
  try {
    const validateData = carModelsInsertSchema.safeParse(req.body);
    if (!validateData.success) {
      return res.status(400).json({ error: validateData.error.errors });
    }

    const newModel = await db.insert(carModels).values(validateData.data).returning();
    return res.status(201).json(newModel[0]);
  } catch (error) {
    console.error('Error creating car model:', error);
    return res.status(500).json({ error: 'Failed to create car model' });
  }
};

// Update car model
export const updateCarModel = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existingModel = await db.query.carModels.findFirst({
      where: eq(carModels.id, parseInt(id))
    });

    if (!existingModel) {
      return res.status(404).json({ error: 'Car model not found' });
    }

    const updatedModel = await db
      .update(carModels)
      .set(req.body)
      .where(eq(carModels.id, parseInt(id)))
      .returning();

    return res.status(200).json(updatedModel[0]);
  } catch (error) {
    console.error(`Error updating car model with ID ${id}:`, error);
    return res.status(500).json({ error: 'Failed to update car model' });
  }
};

// Delete car model
export const deleteCarModel = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existingModel = await db.query.carModels.findFirst({
      where: eq(carModels.id, parseInt(id))
    });

    if (!existingModel) {
      return res.status(404).json({ error: 'Car model not found' });
    }

    await db.delete(carModels).where(eq(carModels.id, parseInt(id)));

    return res.status(200).json({ message: 'Car model deleted successfully' });
  } catch (error) {
    console.error(`Error deleting car model with ID ${id}:`, error);
    return res.status(500).json({ error: 'Failed to delete car model' });
  }
};

// Engine options routes

// Get all engine options
export const getAllEngineOptions = async (req: Request, res: Response) => {
  try {
    const engines = await db.query.engineOptions.findMany();
    return res.status(200).json(engines);
  } catch (error) {
    console.error('Error fetching engine options:', error);
    return res.status(500).json({ error: 'Failed to fetch engine options' });
  }
};

// Get engine options compatible with a specific car model
export const getCompatibleEngineOptions = async (req: Request, res: Response) => {
  const { modelId } = req.params;
  try {
    const engines = await db.query.engineOptions.findMany({
      where: (engine) => {
        const jsonContainsModelId = `${engine.compatibleModels}::jsonb @> '${parseInt(modelId)}'::jsonb`;
        return jsonContainsModelId;
      }
    });
    return res.status(200).json(engines);
  } catch (error) {
    console.error(`Error fetching compatible engines for model ID ${modelId}:`, error);
    return res.status(500).json({ error: 'Failed to fetch compatible engine options' });
  }
};

// Create engine option
export const createEngineOption = async (req: Request, res: Response) => {
  try {
    const validateData = engineOptionsInsertSchema.safeParse(req.body);
    if (!validateData.success) {
      return res.status(400).json({ error: validateData.error.errors });
    }

    const newEngine = await db.insert(engineOptions).values(validateData.data).returning();
    return res.status(201).json(newEngine[0]);
  } catch (error) {
    console.error('Error creating engine option:', error);
    return res.status(500).json({ error: 'Failed to create engine option' });
  }
};

// Update engine option
export const updateEngineOption = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existingEngine = await db.query.engineOptions.findFirst({
      where: eq(engineOptions.id, parseInt(id))
    });

    if (!existingEngine) {
      return res.status(404).json({ error: 'Engine option not found' });
    }

    const updatedEngine = await db
      .update(engineOptions)
      .set(req.body)
      .where(eq(engineOptions.id, parseInt(id)))
      .returning();

    return res.status(200).json(updatedEngine[0]);
  } catch (error) {
    console.error(`Error updating engine option with ID ${id}:`, error);
    return res.status(500).json({ error: 'Failed to update engine option' });
  }
};

// Delete engine option
export const deleteEngineOption = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existingEngine = await db.query.engineOptions.findFirst({
      where: eq(engineOptions.id, parseInt(id))
    });

    if (!existingEngine) {
      return res.status(404).json({ error: 'Engine option not found' });
    }

    await db.delete(engineOptions).where(eq(engineOptions.id, parseInt(id)));

    return res.status(200).json({ message: 'Engine option deleted successfully' });
  } catch (error) {
    console.error(`Error deleting engine option with ID ${id}:`, error);
    return res.status(500).json({ error: 'Failed to delete engine option' });
  }
};

// Transmission options routes

// Get all transmission options
export const getAllTransmissionOptions = async (req: Request, res: Response) => {
  try {
    const transmissions = await db.query.transmissionOptions.findMany();
    return res.status(200).json(transmissions);
  } catch (error) {
    console.error('Error fetching transmission options:', error);
    return res.status(500).json({ error: 'Failed to fetch transmission options' });
  }
};

// Get transmission options compatible with a specific car model and engine
export const getCompatibleTransmissionOptions = async (req: Request, res: Response) => {
  const { modelId, engineId } = req.params;
  try {
    const transmissions = await db.query.transmissionOptions.findMany({
      where: (transmission) => {
        const jsonContainsModelId = `${transmission.compatibleModels}::jsonb @> '${parseInt(modelId)}'::jsonb`;
        const jsonContainsEngineId = engineId ? `${transmission.compatibleEngines}::jsonb @> '${parseInt(engineId)}'::jsonb` : 'TRUE';
        return `${jsonContainsModelId} AND ${jsonContainsEngineId}`;
      }
    });
    return res.status(200).json(transmissions);
  } catch (error) {
    console.error(`Error fetching compatible transmissions for model ID ${modelId}:`, error);
    return res.status(500).json({ error: 'Failed to fetch compatible transmission options' });
  }
};

// Create transmission option
export const createTransmissionOption = async (req: Request, res: Response) => {
  try {
    const validateData = transmissionOptionsInsertSchema.safeParse(req.body);
    if (!validateData.success) {
      return res.status(400).json({ error: validateData.error.errors });
    }

    const newTransmission = await db.insert(transmissionOptions).values(validateData.data).returning();
    return res.status(201).json(newTransmission[0]);
  } catch (error) {
    console.error('Error creating transmission option:', error);
    return res.status(500).json({ error: 'Failed to create transmission option' });
  }
};

// Update transmission option
export const updateTransmissionOption = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existingTransmission = await db.query.transmissionOptions.findFirst({
      where: eq(transmissionOptions.id, parseInt(id))
    });

    if (!existingTransmission) {
      return res.status(404).json({ error: 'Transmission option not found' });
    }

    const updatedTransmission = await db
      .update(transmissionOptions)
      .set(req.body)
      .where(eq(transmissionOptions.id, parseInt(id)))
      .returning();

    return res.status(200).json(updatedTransmission[0]);
  } catch (error) {
    console.error(`Error updating transmission option with ID ${id}:`, error);
    return res.status(500).json({ error: 'Failed to update transmission option' });
  }
};

// Delete transmission option
export const deleteTransmissionOption = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existingTransmission = await db.query.transmissionOptions.findFirst({
      where: eq(transmissionOptions.id, parseInt(id))
    });

    if (!existingTransmission) {
      return res.status(404).json({ error: 'Transmission option not found' });
    }

    await db.delete(transmissionOptions).where(eq(transmissionOptions.id, parseInt(id)));

    return res.status(200).json({ message: 'Transmission option deleted successfully' });
  } catch (error) {
    console.error(`Error deleting transmission option with ID ${id}:`, error);
    return res.status(500).json({ error: 'Failed to delete transmission option' });
  }
};

// Similar CRUD operations for other configuration options (color, wheels, interior, AI, additional options)
// I'll include some representative ones and you can extend for the others

// Color options routes

// Get all color options
export const getAllColorOptions = async (req: Request, res: Response) => {
  try {
    const colors = await db.query.colorOptions.findMany();
    return res.status(200).json(colors);
  } catch (error) {
    console.error('Error fetching color options:', error);
    return res.status(500).json({ error: 'Failed to fetch color options' });
  }
};

// Get color options compatible with a specific car model
export const getCompatibleColorOptions = async (req: Request, res: Response) => {
  const { modelId } = req.params;
  try {
    const colors = await db.query.colorOptions.findMany({
      where: (color) => {
        const jsonContainsModelId = `${color.availableForModels}::jsonb @> '${parseInt(modelId)}'::jsonb`;
        return jsonContainsModelId;
      }
    });
    return res.status(200).json(colors);
  } catch (error) {
    console.error(`Error fetching compatible colors for model ID ${modelId}:`, error);
    return res.status(500).json({ error: 'Failed to fetch compatible color options' });
  }
};

// Create color option
export const createColorOption = async (req: Request, res: Response) => {
  try {
    const validateData = colorOptionsInsertSchema.safeParse(req.body);
    if (!validateData.success) {
      return res.status(400).json({ error: validateData.error.errors });
    }

    const newColor = await db.insert(colorOptions).values(validateData.data).returning();
    return res.status(201).json(newColor[0]);
  } catch (error) {
    console.error('Error creating color option:', error);
    return res.status(500).json({ error: 'Failed to create color option' });
  }
};

// Update color option
export const updateColorOption = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existingColor = await db.query.colorOptions.findFirst({
      where: eq(colorOptions.id, parseInt(id))
    });

    if (!existingColor) {
      return res.status(404).json({ error: 'Color option not found' });
    }

    const updatedColor = await db
      .update(colorOptions)
      .set(req.body)
      .where(eq(colorOptions.id, parseInt(id)))
      .returning();

    return res.status(200).json(updatedColor[0]);
  } catch (error) {
    console.error(`Error updating color option with ID ${id}:`, error);
    return res.status(500).json({ error: 'Failed to update color option' });
  }
};

// Delete color option
export const deleteColorOption = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existingColor = await db.query.colorOptions.findFirst({
      where: eq(colorOptions.id, parseInt(id))
    });

    if (!existingColor) {
      return res.status(404).json({ error: 'Color option not found' });
    }

    await db.delete(colorOptions).where(eq(colorOptions.id, parseInt(id)));

    return res.status(200).json({ message: 'Color option deleted successfully' });
  } catch (error) {
    console.error(`Error deleting color option with ID ${id}:`, error);
    return res.status(500).json({ error: 'Failed to delete color option' });
  }
};

// Wheel options routes (abbreviated for brevity)
export const getAllWheelOptions = async (req: Request, res: Response) => {
  try {
    const wheels = await db.query.wheelOptions.findMany();
    return res.status(200).json(wheels);
  } catch (error) {
    console.error('Error fetching wheel options:', error);
    return res.status(500).json({ error: 'Failed to fetch wheel options' });
  }
};

// Interior options routes (abbreviated for brevity)
export const getAllInteriorOptions = async (req: Request, res: Response) => {
  try {
    const interiors = await db.query.interiorOptions.findMany();
    return res.status(200).json(interiors);
  } catch (error) {
    console.error('Error fetching interior options:', error);
    return res.status(500).json({ error: 'Failed to fetch interior options' });
  }
};

// AI integration options routes (abbreviated for brevity)
export const getAllAiOptions = async (req: Request, res: Response) => {
  try {
    const aiIntegrations = await db.query.aiOptions.findMany();
    return res.status(200).json(aiIntegrations);
  } catch (error) {
    console.error('Error fetching AI integration options:', error);
    return res.status(500).json({ error: 'Failed to fetch AI integration options' });
  }
};

// Additional options routes (abbreviated for brevity)
export const getAllAdditionalOptions = async (req: Request, res: Response) => {
  try {
    const additionals = await db.query.additionalOptions.findMany();
    return res.status(200).json(additionals);
  } catch (error) {
    console.error('Error fetching additional options:', error);
    return res.status(500).json({ error: 'Failed to fetch additional options' });
  }
};

// User Configurations routes

// Get all user configurations
export const getAllUserConfigurations = async (req: Request, res: Response) => {
  try {
    const configs = await db.query.userConfigurations.findMany({
      with: {
        carModel: true,
        engine: true,
        transmission: true,
        color: true,
        wheel: true,
        interior: true,
      },
    });
    return res.status(200).json(configs);
  } catch (error) {
    console.error('Error fetching user configurations:', error);
    return res.status(500).json({ error: 'Failed to fetch user configurations' });
  }
};

// Get user configurations for a specific user
export const getUserConfigurations = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const configs = await db.query.userConfigurations.findMany({
      where: eq(userConfigurations.userId, parseInt(userId)),
      with: {
        carModel: true,
        engine: true,
        transmission: true,
        color: true,
        wheel: true,
        interior: true,
      },
    });
    return res.status(200).json(configs);
  } catch (error) {
    console.error(`Error fetching configurations for user ID ${userId}:`, error);
    return res.status(500).json({ error: 'Failed to fetch user configurations' });
  }
};

// Create user configuration
export const createUserConfiguration = async (req: Request, res: Response) => {
  try {
    const validateData = userConfigurationsInsertSchema.safeParse(req.body);
    if (!validateData.success) {
      return res.status(400).json({ error: validateData.error.errors });
    }

    const newConfig = await db.insert(userConfigurations).values(validateData.data).returning();
    const configWithRelations = await db.query.userConfigurations.findFirst({
      where: eq(userConfigurations.id, newConfig[0].id),
      with: {
        carModel: true,
        engine: true,
        transmission: true,
        color: true,
        wheel: true,
        interior: true,
      },
    });
    return res.status(201).json(configWithRelations);
  } catch (error) {
    console.error('Error creating user configuration:', error);
    return res.status(500).json({ error: 'Failed to create user configuration' });
  }
};

// Update user configuration
export const updateUserConfiguration = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existingConfig = await db.query.userConfigurations.findFirst({
      where: eq(userConfigurations.id, parseInt(id))
    });

    if (!existingConfig) {
      return res.status(404).json({ error: 'User configuration not found' });
    }

    const updatedConfig = await db
      .update(userConfigurations)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(userConfigurations.id, parseInt(id)))
      .returning();

    const configWithRelations = await db.query.userConfigurations.findFirst({
      where: eq(userConfigurations.id, updatedConfig[0].id),
      with: {
        carModel: true,
        engine: true,
        transmission: true,
        color: true,
        wheel: true,
        interior: true,
      },
    });

    return res.status(200).json(configWithRelations);
  } catch (error) {
    console.error(`Error updating user configuration with ID ${id}:`, error);
    return res.status(500).json({ error: 'Failed to update user configuration' });
  }
};

// Delete user configuration
export const deleteUserConfiguration = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existingConfig = await db.query.userConfigurations.findFirst({
      where: eq(userConfigurations.id, parseInt(id))
    });

    if (!existingConfig) {
      return res.status(404).json({ error: 'User configuration not found' });
    }

    await db.delete(userConfigurations).where(eq(userConfigurations.id, parseInt(id)));

    return res.status(200).json({ message: 'User configuration deleted successfully' });
  } catch (error) {
    console.error(`Error deleting user configuration with ID ${id}:`, error);
    return res.status(500).json({ error: 'Failed to delete user configuration' });
  }
};
