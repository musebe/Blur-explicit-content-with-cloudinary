// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { promises as fs } from "fs";
import { annotateVideoWithLabels } from "../../lib/google";
import {
  handleCloudinaryDelete,
  handleCloudinaryUpload,
} from "../../lib/cloudinary";
import { createWriteStream, promises } from "fs";
import { get } from "https";
import { annotations as preSavedAnnotations } from "../../test.js";

const videosController = async (req, res) => {
  // Check the incoming http method. Handle the POST request method and reject the rest.
  switch (req.method) {
    // Handle the POST request method
    case "POST": {
      try {
        const result = await handlePostRequest();

        // Respond to the request with a status code 201(Created)
        return res.status(201).json({
          message: "Success",
          result,
        });
      } catch (error) {
        // In case of an error, respond to the request with a status code 400(Bad Request)
        return res.status(400).json({
          message: "Error",
          error,
        });
      }
    }
    // Reject other http methods with a status code 405
    default: {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  }
};

const handlePostRequest = async () => {
  // Path to the file you want to upload
  const pathToFile = "public/videos/explicit.mp4";

  // Read the file using fs. This results in a Buffer
  const file = await fs.readFile(pathToFile);

  // Convert the file to a base64 string in preparation of analysing the video with google's video intelligence api
  const inputContent = file.toString("base64");

  // Analyze the video using google video intelligence api and annotate explicit frames
  let annotations;

  if (process.env.IS_CODESANDBOX) {
    annotations = preSavedAnnotations;
  } else {
    annotations = await annotateVideoWithLabels(inputContent);
  }

  // Group all adjacent frames with the same pornography likelyhood
  const likelihoodClusters = annotations.explicitAnnotation.frames.reduce(
    (prev, curr) => {
      if (
        prev.length &&
        curr.pornographyLikelihood ===
          prev[prev.length - 1][0].pornographyLikelihood
      ) {
        prev[prev.length - 1].push(curr);
      } else {
        prev.push([curr]);
      }

      return prev;
    },
    []
  );

  // Get the frames with a pornogrphy likelihood greater than 2
  const likelyFrames = likelihoodClusters.filter((cluster) =>
    cluster.some((frame) => frame.pornographyLikelihood > 2)
  );

  // Set the start offset for the main explicit video
  let initialStartOffset = 0;

  // Array to hold all uploaded videos
  const uploadResults = [];

  // Loop through the frames with a pornogrphy likelihood greater than 2
  for (const likelyFrame of likelyFrames) {
    // Get the start offset of the frame
    const startOffset =
      parseInt(likelyFrame[0].timeOffset.seconds ?? 0) +
      (likelyFrame[0].timeOffset.nanos ?? 0) / 1000000000;

    // Get the end offset of the frame
    const endOffset =
      parseInt(likelyFrame[likelyFrame.length - 1].timeOffset.seconds ?? 0) +
      (likelyFrame[likelyFrame.length - 1].timeOffset.nanos ?? 0) / 1000000000 +
      0.1;

    let unlikelyFrameUploadResult;

    if (startOffset != 0) {
      unlikelyFrameUploadResult = await handleCloudinaryUpload(pathToFile, [
        { offset: [initialStartOffset, startOffset] },
      ]);
    }

    // Upload the frame to cloudinary and apply a blur effect
    const uploadResult = await handleCloudinaryUpload(pathToFile, [
      { offset: [startOffset, endOffset], effect: "blur:1500" },
    ]);

    uploadResults.push(
      {
        startOffset: initialStartOffset,
        endOffset: startOffset,
        uploadResult: unlikelyFrameUploadResult,
      },
      { startOffset, endOffset, uploadResult }
    );

    initialStartOffset = endOffset;
  }

  // Upload the last frame to cloudinary if any
  const uploadResult = await handleCloudinaryUpload(pathToFile, [
    { start_offset: initialStartOffset },
  ]);

  uploadResults.push({
    startOffset: initialStartOffset,
    endOffset: null,
    uploadResult,
  });

  const firstFilePath = await downloadVideo(
    uploadResults[0].uploadResult.secure_url,
    uploadResults[0].uploadResult.public_id.replace(/\//g, "-")
  );

  const fullVideoUploadResult = await handleCloudinaryUpload(firstFilePath, [
    uploadResults.slice(1).map((video) => ({
      flags: "splice",
      overlay: `video:${video.uploadResult.public_id.replace(/\//g, ":")}`,
    })),
  ]);

  await handleCloudinaryDelete([
    uploadResults.map((video) => video.uploadResult.public_id),
  ]);

  return {
    uploadResult: fullVideoUploadResult,
  };
};

const downloadVideo = (url, name) => {
  return new Promise((resolve, reject) => {
    try {
      get(url, async (res) => {
        const downloadPath = `public/videos/downloads`;

        await promises.mkdir(downloadPath, { recursive: true });

        const filePath = `${downloadPath}/${name}.mp4`;

        const file = createWriteStream(filePath);

        res.pipe(file);

        res.on("error", (error) => {
          reject(error);
        });

        file.on("error", (error) => {
          reject(error);
        });

        file.on("finish", () => {
          file.close();
          resolve(file.path);
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};

export default videosController;
