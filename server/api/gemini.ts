import { Request, Response } from 'express';
import fetch from 'node-fetch';

interface GeminiImageRequest {
  model: string;
  prompt: string;
  negativePrompt?: string;
  height?: number;
  width?: number;
  seed?: number;
  steps?: number;
  cfgScale?: number;
  samples?: number;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Generate a car or car part image using Gemini AI
 */
export async function generateCarImage(req: Request, res: Response) {
  try {
    // Extract request parameters
    const { prompt, car, part, style } = req.body;
    
    if (!prompt && !car && !part) {
      return res.status(400).json({ error: 'You must provide either a prompt, car model, or part name' });
    }
    
    // Construct an optimized prompt
    let finalPrompt = prompt || '';
    
    if (car && !finalPrompt) {
      finalPrompt = `A photorealistic image of a ${car} classic car, restored to pristine condition, professional automotive photography, studio lighting`;
    }
    
    if (part && !finalPrompt) {
      finalPrompt = `A photorealistic image of a ${part} for classic cars, detailed product photography with studio lighting`;
    }
    
    if (car && part && !finalPrompt) {
      finalPrompt = `A photorealistic image of a ${part} specifically designed for a ${car} classic car, detailed product photography with studio lighting`;
    }
    
    // Apply style modifier if provided
    if (style && style !== 'realistic') {
      if (style === 'blueprint') {
        finalPrompt += ", technical blueprint style, blue background with white lines, schematic drawing";
      } else if (style === 'vintage') {
        finalPrompt += ", vintage photography style, slightly faded colors, film grain texture, 1960s advertisement aesthetic";
      } else if (style === 'modern') {
        finalPrompt += ", modern automotive photography, vibrant colors, dramatic lighting, high contrast, showroom quality";
      }
    }
    
    // Add high quality modifiers
    finalPrompt += ", 4K, highly detailed, professional photography";
    
    // Construct request payload
    const requestData = {
      contents: [{
        parts: [{
          text: finalPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      }
    };
    
    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return res.status(response.status).json({ 
        error: 'Error generating image with Gemini API',
        details: errorData
      });
    }
    
    const data = await response.json();
    
    // Process and return image data
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      
      // Find the part with inlineData for the image
      const imagePart = data.candidates[0].content.parts.find(part => part.inlineData);
      
      if (imagePart && imagePart.inlineData) {
        return res.json({
          success: true,
          prompt: finalPrompt,
          imageData: imagePart.inlineData.data, // Base64 image data
          mimeType: imagePart.inlineData.mimeType
        });
      }
    }
    
    // If we got a response but couldn't find image data
    return res.status(500).json({ 
      error: 'No image data found in Gemini response', 
      responseData: data 
    });
    
  } catch (error) {
    console.error('Error generating image:', error);
    return res.status(500).json({ 
      error: 'Failed to generate image', 
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
