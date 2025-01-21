// src/services/extraTagsService.ts

import axios from 'axios';

export const getExtraTags = async () => {
  try {
    const response = await axios.get('/webapi/items/ExtraTags');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching extra tags:', error);
    throw new Error('Error al cargar las etiquetas adicionales. Por favor, intente de nuevo.');
  }
};
