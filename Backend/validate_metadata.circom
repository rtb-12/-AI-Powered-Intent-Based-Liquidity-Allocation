pragma circom 2.0.0;

include "node_modules/circomlib/circuits/poseidon.circom";

template ValidateMetadata() {
    // Input signals
    signal input propertyName;
    signal input address;
    signal input price;
    signal input aiValidationResult;
    signal input metadataHash;

    // Output signal
    signal output valid;

    // Create hasher component
    component hasher = Poseidon(3);
    hasher.inputs[0] <== propertyName;
    hasher.inputs[1] <== address;
    hasher.inputs[2] <== price;

    // Compute hash and validate
    signal computedHash <== hasher.out;
    
    // Validation constraints
    signal hashValid <== computedHash === metadataHash;
    signal aiValid <== aiValidationResult === 1;
    
    // Final validation (both conditions must be true)
    valid <== hashValid * aiValid;
}

component main = ValidateMetadata();