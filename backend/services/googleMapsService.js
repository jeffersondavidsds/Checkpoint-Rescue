const axios = require('axios');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) {
  console.warn('⚠️ GOOGLE_MAPS_API_KEY não está definido. Funcionalidades do Google Maps estarão desabilitadas.');
}

const endpoints = {
  geocode: 'https://maps.googleapis.com/maps/api/geocode/json',
  nearbySearch: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
};

const buildParams = (params) => ({
  ...params,
  key: GOOGLE_MAPS_API_KEY,
  language: 'pt-BR'
});

const geocodeAddress = async (address) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('GOOGLE_MAPS_API_KEY não está configurada');
  }

  const response = await axios.get(endpoints.geocode, {
    params: buildParams({ address })
  });

  if (response.data.status !== 'OK') {
    const message = response.data.error_message || `Google Maps Geocode API retornou status ${response.data.status}`;
    throw new Error(message);
  }

  return {
    status: response.data.status,
    results: response.data.results
  };
};

const reverseGeocode = async (latitude, longitude) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('GOOGLE_MAPS_API_KEY não está configurada');
  }

  const response = await axios.get(endpoints.geocode, {
    params: buildParams({ latlng: `${latitude},${longitude}` })
  });

  if (response.data.status !== 'OK') {
    const message = response.data.error_message || `Google Maps Geocode API retornou status ${response.data.status}`;
    throw new Error(message);
  }

  return {
    status: response.data.status,
    results: response.data.results
  };
};

const buscarLugaresProximos = async (latitude, longitude, radius = 1000, type) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('GOOGLE_MAPS_API_KEY não está configurada');
  }

  const params = {
    location: `${latitude},${longitude}`,
    radius,
    keyword: type || 'shelter'
  };

  if (type) {
    params.type = type;
  }

  const response = await axios.get(endpoints.nearbySearch, {
    params: buildParams(params)
  });

  if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
    const message = response.data.error_message || `Google Maps Places API retornou status ${response.data.status}`;
    throw new Error(message);
  }

  return {
    status: response.data.status,
    results: response.data.results,
    next_page_token: response.data.next_page_token || null
  };
};

module.exports = {
  geocodeAddress,
  reverseGeocode,
  buscarLugaresProximos
};
