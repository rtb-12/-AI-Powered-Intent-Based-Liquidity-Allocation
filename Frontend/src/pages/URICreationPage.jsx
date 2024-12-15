import React, { useState } from "react";
import { create } from "ipfs-http-client";
import { FaCopy, FaCheck, FaTimes, FaRobot, FaShieldAlt } from "react-icons/fa";
import axios from "axios";

const URICreationPage = () => {
  const [formData, setFormData] = useState({
    assetName: "",
    description: "",
    propertyAddress: "",
    propertyPrice: "",
    image: null,
    documents: null,
  });

  const [status, setStatus] = useState({
    loading: false,
    validating: false,
    uploading: false,
    copied: false,
  });

  const [validation, setValidation] = useState({
    analyzing: false,
    analyzed: false,
    generating: false,
    generated: false,
    result: null,
    zkProof: null,
  });

  const [uri, setUri] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  };

  const ipfs = create({ url: "https://ipfs.infura.io:5001/api/v0" });

  // Validate metadata using the AI backend
  const validateMetadata = async () => {
    setStatus((prev) => ({ ...prev, validating: true }));
    setValidation((prev) => ({ ...prev, analyzing: true }));

    try {
      // Send metadata to AI validation endpoint
      const response = await axios.post(
        "http://localhost:5000/validate_metadata",
        {
          property_name: formData.assetName,
          description: formData.description,
          address: formData.propertyAddress,
          price: formData.propertyPrice,
        }
      );

      setValidation((prev) => ({ ...prev, analyzing: false, analyzed: true }));

      if (!response.data.valid) {
        throw new Error(response.data.message);
      }

      // Generate ZK proof
      setValidation((prev) => ({ ...prev, generating: true }));
      const zkResponse = await axios.post(
        "http://localhost:5000/generate_proof",
        {
          metadata: response.data.validated_metadata,
        }
      );

      setValidation((prev) => ({
        ...prev,
        generating: false,
        generated: true,
        result: "Valid: Property metadata verification successful",
        zkProof: zkResponse.data.proof,
      }));

      return true;
    } catch (error) {
      console.error("Validation error:", error);
      setValidation((prev) => ({
        ...prev,
        analyzing: false,
        generating: false,
        result: `Invalid: ${error.message || "Validation failed"}`,
        zkProof: null,
      }));
      return false;
    } finally {
      setStatus((prev) => ({ ...prev, validating: false }));
    }
  };

  // Upload files and metadata to IPFS
  const uploadToIPFS = async () => {
    setStatus((prev) => ({ ...prev, uploading: true }));
    try {
      // Upload image if provided
      let imageHash = null;
      if (formData.image) {
        const imageBuffer = await formData.image.arrayBuffer();
        const imageResult = await ipfs.add(imageBuffer);
        imageHash = imageResult.path;
      }

      // Upload documents if provided
      let documentHash = null;
      if (formData.documents) {
        const documentBuffer = await formData.documents.arrayBuffer();
        const documentResult = await ipfs.add(documentBuffer);
        documentHash = documentResult.path;
      }

      // Create metadata object
      const metadata = {
        name: formData.assetName,
        description: formData.description,
        properties: {
          address: formData.propertyAddress,
          price: formData.propertyPrice,
          image: imageHash ? `ipfs://${imageHash}` : null,
          documents: documentHash ? `ipfs://${documentHash}` : null,
          validationProof: validation.zkProof,
        },
        validation: {
          status: validation.result,
          timestamp: new Date().toISOString(),
        },
      };

      // Upload metadata to IPFS
      const metadataResult = await ipfs.add(JSON.stringify(metadata));
      setUri(`ipfs://${metadataResult.path}`);

      // Clear form after successful upload
      setFormData({
        assetName: "",
        description: "",
        propertyAddress: "",
        propertyPrice: "",
        image: null,
        documents: null,
      });
    } catch (error) {
      console.error("IPFS upload error:", error);
      throw error;
    } finally {
      setStatus((prev) => ({ ...prev, uploading: false }));
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(uri);
      setStatus((prev) => ({ ...prev, copied: true }));
      setTimeout(() => {
        setStatus((prev) => ({ ...prev, copied: false }));
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Form validation
  const isFormValid = () => {
    return (
      formData.assetName.trim() !== "" &&
      formData.propertyAddress.trim() !== "" &&
      formData.propertyPrice !== "" &&
      formData.image !== null
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-yellow-600 mb-8">
          RWA Tokenization
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Metadata Form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Name
              </label>
              <input
                type="text"
                name="assetName"
                value={formData.assetName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Address
              </label>
              <input
                type="text"
                name="propertyAddress"
                value={formData.propertyAddress}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Price
              </label>
              <input
                type="number"
                name="propertyPrice"
                value={formData.propertyPrice}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Image
              </label>
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
                accept="image/*"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documents
              </label>
              <input
                type="file"
                name="documents"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="w-full"
              />
            </div>
          </div>

          {/* Validation Status */}
          {status.validating && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-3">Validation Progress</h3>

              <div className="space-y-3">
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 mr-2 ${
                      validation.analyzing ? "animate-spin" : ""
                    }`}
                  >
                    <FaRobot
                      className={
                        validation.analyzed ? "text-green-500" : "text-gray-400"
                      }
                    />
                  </div>
                  <span>AI Analysis</span>
                </div>

                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 mr-2 ${
                      validation.generating ? "animate-spin" : ""
                    }`}
                  >
                    <FaShieldAlt
                      className={
                        validation.generated
                          ? "text-green-500"
                          : "text-gray-400"
                      }
                    />
                  </div>
                  <span>ZK Proof Generation</span>
                </div>
              </div>
            </div>
          )}

          {/* Validation Result */}
          {validation.result && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                validation.result.includes("Valid")
                  ? "bg-green-50"
                  : "bg-red-50"
              }`}
            >
              <div className="flex items-center mb-2">
                {validation.result.includes("Valid") ? (
                  <FaCheck className="text-green-500 mr-2" />
                ) : (
                  <FaTimes className="text-red-500 mr-2" />
                )}
                <span className="font-medium">{validation.result}</span>
              </div>

              {validation.zkProof && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">ZK Proof:</span>
                    <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                      {validation.zkProof}
                    </code>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={validateMetadata}
              disabled={!isFormValid() || status.validating}
              className={`w-full py-2 px-4 rounded-md ${
                !isFormValid() || status.validating
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {status.validating ? "Validating..." : "Validate Metadata"}
            </button>

            <button
              onClick={uploadToIPFS}
              disabled={!validation.generated || status.uploading}
              className={`w-full py-2 px-4 rounded-md ${
                !validation.generated || status.uploading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-yellow-600 hover:bg-yellow-700 text-white"
              }`}
            >
              {status.uploading ? "Uploading..." : "Upload to IPFS"}
            </button>
          </div>

          {/* URI Display */}
          {uri && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="break-all">{uri}</div>
                <button
                  onClick={copyToClipboard}
                  className="ml-4 text-gray-600 hover:text-gray-900"
                >
                  {status.copied ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default URICreationPage;
