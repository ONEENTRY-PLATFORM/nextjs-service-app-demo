import https from 'https';
import { imageSize } from 'image-size';
import url from 'url';

/**
 * Get the dimensions (width and height) of an image from its URL
 *
 * This function fetches an image from a URL and determines its dimensions
 * using the image-size library. It handles the image data stream and
 * extracts size information as soon as enough data is available.
 * @param   {string}                                   imgUrl - The URL of the image to get dimensions for
 * @returns {Promise<{width: number, height: number}>}        A Promise that resolves to an object containing width and height properties
 * @throws {Error} if the image cannot be fetched or dimensions cannot be determined
 */
const getImageSize = async (
  imgUrl: string,
): Promise<{ width: number; height: number }> => {
  /** Parse the image URL into options for the https request */
  const options = url.parse(imgUrl);

  /** Return a Promise that will resolve with the image dimensions */
  return new Promise((resolve, reject) => {
    /** Make an HTTPS GET request to fetch the image */
    https
      .get(options, (response) => {
        /** Check if the response status is not OK (200) */
        if (response.statusCode !== 200) {
          /** Reject the Promise with an error message */
          reject(
            new Error(
              `Failed to fetch image. Status code: ${response.statusCode}`,
            ),
          );
          /** Consume response data to free up memory */
          response.resume();
          return;
        }

        /** Initialize an array to store chunks of image data */
        const chunks: Uint8Array[] = [];
        /** Initialize variable to store image dimensions */
        let dimensions: { width?: number; height?: number } | null = null;

        response
          /** Listen for data events (chunks of image data) */
          .on('data', (chunk) => {
            /** Only process data if dimensions haven't been determined yet */
            if (!dimensions) {
              /** Add the current chunk to our chunks array */
              chunks.push(chunk);
              try {
                /** Try to determine image dimensions from accumulated chunks */
                dimensions = imageSize(Buffer.concat(chunks));

                /** If both width and height are available, resolve the Promise */
                if (dimensions.width && dimensions.height) {
                  resolve({
                    width: dimensions.width,
                    height: dimensions.height,
                  });
                  /** Destroy the response to stop further data reception */
                  response.destroy();
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
              } catch (error) {
                /** If image-size throws an error due to insufficient data, continue receiving */
              }
            }
          })
          /** Listen for the end event (when all data has been received) */
          .on('end', () => {
            /** If dimensions were never determined, reject the Promise */
            if (!dimensions) {
              reject(new Error('Could not determine image dimensions'));
            }
          })
          /** Listen for error events during data reception */
          .on('error', (err) => {
            /** Reject the Promise with the error */
            reject(err);
          });
      })
      /** Listen for errors during the HTTPS request */
      .on('error', (err) => {
        /** Reject the Promise with the error */
        reject(err);
      });
  });
};

export default getImageSize;
