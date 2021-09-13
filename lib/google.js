import {
  VideoIntelligenceServiceClient,
  protos,
} from "@google-cloud/video-intelligence";

const client = new VideoIntelligenceServiceClient({
  // Google cloud platform project id
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/gm, "\n"),
  },
});

/**
 *
 * @param {string | Uint8Array} inputContent
 * @returns {Promise<protos.google.cloud.videointelligence.v1.VideoAnnotationResults>}
 */
export const annotateVideoWithLabels = async (inputContent) => {
  // Grab the operation using array destructuring. The operation is the first object in the array.
  const [operation] = await client.annotateVideo({
    // Input content
    inputContent: inputContent,
    // Video Intelligence features
    features: ["EXPLICIT_CONTENT_DETECTION"],
  });

  const [operationResult] = await operation.promise();

  // Gets annotations for video
  const [annotations] = operationResult.annotationResults;

  return annotations;
};
