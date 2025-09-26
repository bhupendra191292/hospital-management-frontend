// ID Utility Functions for NewFlow
// Standardizes ID handling across the application

/**
 * Gets the standardized ID from an object (prioritizes _id over id)
 * @param {Object} obj - Object that might have _id or id
 * @returns {string|null} - The standardized ID or null if not found
 */
export const getStandardId = (obj) => {
  if (!obj) return null;
  return obj._id || obj.id || null;
};

/**
 * Gets the standardized ID from an object with fallback
 * @param {Object} obj - Object that might have _id or id
 * @param {string} fallback - Fallback value if no ID found
 * @returns {string} - The standardized ID or fallback
 */
export const getStandardIdWithFallback = (obj, fallback = '') => {
  return getStandardId(obj) || fallback;
};

/**
 * Checks if two objects have the same ID
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {boolean} - True if same ID
 */
export const hasSameId = (obj1, obj2) => {
  const id1 = getStandardId(obj1);
  const id2 = getStandardId(obj2);
  return id1 && id2 && id1 === id2;
};

/**
 * Creates a standardized object with _id field
 * @param {Object} obj - Object to standardize
 * @returns {Object} - Object with standardized _id field
 */
export const standardizeObject = (obj) => {
  if (!obj) return obj;

  const standardized = { ...obj };
  if (obj.id && !obj._id) {
    standardized._id = obj.id;
    delete standardized.id;
  }
  return standardized;
};

/**
 * Standardizes an array of objects to use _id
 * @param {Array} array - Array of objects to standardize
 * @returns {Array} - Array with standardized objects
 */
export const standardizeArray = (array) => {
  if (!Array.isArray(array)) return array;
  return array.map(standardizeObject);
};

/**
 * Gets patient ID from various possible formats
 * @param {Object|string} patient - Patient object or ID string
 * @returns {string|null} - Standardized patient ID
 */
export const getPatientId = (patient) => {
  if (typeof patient === 'string') return patient;
  return getStandardId(patient);
};

/**
 * Gets doctor ID from various possible formats
 * @param {Object|string} doctor - Doctor object or ID string
 * @returns {string|null} - Standardized doctor ID
 */
export const getDoctorId = (doctor) => {
  if (typeof doctor === 'string') return doctor;
  return getStandardId(doctor);
};

/**
 * Gets visit ID from various possible formats
 * @param {Object|string} visit - Visit object or ID string
 * @returns {string|null} - Standardized visit ID
 */
export const getVisitId = (visit) => {
  if (typeof visit === 'string') return visit;
  return getStandardId(visit);
};
