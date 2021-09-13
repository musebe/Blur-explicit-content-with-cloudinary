import Head from "next/head";
import { useState } from "react";

export default function Home() {
  const [video, setVideo] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleUploadVideo = async () => {
    try {
      // Set loading to true
      setLoading(true);

      // Make a POST request to the `api/videos/` endpoint
      const response = await fetch("/api/videos", {
        method: "post",
      });

      const data = await response.json();

      // Check if the response is successful
      if (response.status >= 200 && response.status < 300) {
        const result = data.result;

        // Update our videos state with the results
        setVideo(result);
      } else {
        throw data;
      }
    } catch (error) {
      // TODO: Handle error
      console.error(error);
    } finally {
      setLoading(false);
      // Set loading to true once a response is available
    }
  };

  return (
    <div>
      <Head>
        <title>
          Blur explicit content with Google Video Intelligence and Cloudinary
        </title>
        <meta
          name="description"
          content=" Blur explicit content with Google Video Intelligence and Cloudinary"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <h1>
          Blur explicit content with Google Video Intelligence and Cloudinary
        </h1>
      </header>

      <main>
        <hr />
        <div className="upload-wrapper">
          <button onClick={handleUploadVideo} disabled={loading || video}>
            Upload
          </button>
        </div>
        <hr />

        {loading && <div className="loading">Loading...</div>}

        {video ? (
          [
            <div
              className="original-video-wrapper"
              key="original-video-wrapper"
            >
              <h2>Original Video</h2>
              <video src="/videos/explicit.mp4" controls></video>
            </div>,
            <hr key="videos-break" />,
            <div className="blurred-video-wrapper" key="blurred-video-wrapper">
              <h2>Blurred Video</h2>
              <video src={video.uploadResult.secure_url} controls></video>
            </div>,
          ]
        ) : (
          <div className="no-video">
            <p>Tap On The Upload Button To Load Video</p>
          </div>
        )}
      </main>
      <style jsx>{`
        header {
          width: 100%;
          min-height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        main {
          min-height: 100vh;
        }

        main div.upload-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px 0;
        }

        main div.upload-wrapper button {
          padding: 10px;
          min-width: 200px;
          height: 50px;
        }

        main div.loading {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #9900ff;
          color: #ffffff;
          height: 150px;
        }

        main div.original-video-wrapper {
          width: 100%;
          display: flex;
          flex-flow: column;
          justify-content: center;
          align-items: center;
        }

        main div.original-video-wrapper video {
          width: 80%;
        }

        main div.blurred-video-wrapper {
          width: 100%;
          display: flex;
          flex-flow: column;
          justify-content: center;
          align-items: center;
        }

        main div.blurred-video-wrapper video {
          width: 80%;
        }

        main div.no-video {
          background-color: #ececec;
          min-height: 300px;
          display: flex;
          flex-flow: column;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
