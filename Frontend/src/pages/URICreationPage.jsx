import React, { useState } from "react";
import { create } from "kubo-rpc-client";
import { FaCopy } from "react-icons/fa";

const URICreationPage = () => {
  const [assetName, setAssetName] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [assetImage, setAssetImage] = useState(null);
  const [assetDocument, setAssetDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uri, setUri] = useState("");

  // Initialize Kubo RPC client
  const ipfs = create({ url: "http://localhost:5001/api/v0" }); // URL of your IPFS node

  // Function to handle file uploads to IPFS and generate the URI
  const uploadToIPFS = async () => {
    setLoading(true);
    try {
      const files = [];

      // Prepare the files to upload to IPFS
      if (assetImage) {
        files.push({ path: "image.jpg", content: assetImage });
      }
      if (assetDocument) {
        files.push({ path: "document.pdf", content: assetDocument });
      }

      // Add files to IPFS
      const addedFiles = [];
      for await (const result of ipfs.addAll(files)) {
        addedFiles.push(result);
      }

      if (addedFiles.length === 0) {
        throw new Error("No files were added to IPFS");
      }

      // Prepare metadata JSON with the URIs of the uploaded files
      const metadata = {
        name: assetName,
        description: assetDescription,
        documentURI: addedFiles[1]
          ? `https://ipfs.infura.io/ipfs/${addedFiles[1].cid.toString()}`
          : "",
        imageURI: addedFiles[0]
          ? `https://ipfs.infura.io/ipfs/${addedFiles[0].cid.toString()}`
          : "",
      };

      // Upload the metadata to IPFS
      const metadataResult = await ipfs.add({
        path: "metadata.json",
        content: JSON.stringify(metadata),
      });

      // Generate URI for the metadata on IPFS
      const metadataURI = `https://ipfs.infura.io/ipfs/${metadataResult.cid.toString()}`;
      setUri(metadataURI); // Set the URI for display
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uri);
    alert("URI copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center text-yellow-600">
        RWA Tokenization: Upload Asset to IPFS
      </h1>

      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md mt-8 p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Asset Name
          </label>
          <input
            type="text"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            placeholder="Enter asset name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Asset Description
          </label>
          <textarea
            value={assetDescription}
            onChange={(e) => setAssetDescription(e.target.value)}
            placeholder="Enter asset description"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Upload Image
          </label>
          <input
            type="file"
            onChange={(e) => setAssetImage(e.target.files[0])}
            className="mt-1 block w-full text-gray-700"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Upload Document (PDF, etc.)
          </label>
          <input
            type="file"
            onChange={(e) => setAssetDocument(e.target.files[0])}
            className="mt-1 block w-full text-gray-700"
          />
        </div>

        <button
          onClick={uploadToIPFS}
          disabled={loading}
          className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md shadow hover:bg-yellow-700"
        >
          {loading ? "Uploading..." : "Upload to IPFS"}
        </button>

        {uri && (
          <div className="mt-4 p-4 bg-gray-200 rounded-lg flex items-center justify-between">
            <div className="text-gray-700 break-all">{uri}</div>
            <button
              onClick={copyToClipboard}
              className="ml-4 text-gray-700 hover:text-gray-900"
            >
              <FaCopy />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default URICreationPage;
