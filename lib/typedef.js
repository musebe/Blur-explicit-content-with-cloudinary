/**
 * @typedef {Object} UploadVideoResult
 * @property {CloudinaryUploadResult} uploadResult
 * @property {protos.google.cloud.videointelligence.v1.VideoAnnotationResults} annotations
 */

/**
 * @typedef {Object} CloudinaryUploadResult
 * @property {number} duration
 * @property {string} format
 * @property {number} height
 * @property {number} width
 * @property {string} url
 * @property {string} secure_url
 * @property {string} public_id
 * @property {Info} info
 */

/**
 * @typedef {Object} Info
 * @property {Categorization} categorization
 */

/**
 * @typedef {Object} Categorization
 * @property {Category} google_video_tagging
 */

/**
 * @typedef {Object} Category
 * @property {Array<VideoTag>} data
 */

/**
 * @typedef {Object} VideoTag
 * @property {string} tag
 * @property {Array<string>} categories
 * @property {number} start_time_offset
 * @property {number} end_time_offset
 * @property {number} confidence
 */

/**
 * @typedef {Object} TagWithRooms
 * @property {string} tag
 * @property {Array<VideoTag>} rooms
 *
 */
