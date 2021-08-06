import dotenv from "dotenv";
import SnetSDK, { DefaultPaymentStrategy } from "snet-sdk";

import service from "./grpc_stubs/cough_test_grpc_pb.js";
import messages from "./grpc_stubs/cough_test_pb.js";
import config from "./config";

dotenv.config();
const sdk = new SnetSDK(config);

const orgId = "rejuve";
const serviceId = "covid-detection";
const groupName = "default_group";
const paymentStrategy = new DefaultPaymentStrategy(20);
let tokenToMakeFreeCall = process.env.FREE_CALL_TOKEN
  ? process.env.FREE_CALL_TOKEN.toUpperCase()
  : "";
tokenToMakeFreeCall = Boolean(tokenToMakeFreeCall)
  ? tokenToMakeFreeCall.startsWith("0X")
    ? tokenToMakeFreeCall
    : `0X${tokenToMakeFreeCall}`
  : "";
const serviceClientOptions = {
  tokenToMakeFreeCall,
  tokenExpirationBlock: process.env.TOKEN_EXPIRATION_BLOCK,
  email: process.env.EMAIL,
  disableBlockchainOperations: false,
  concurrency: true,
};

const closeConnection = () => {
  sdk.web3.currentProvider.connection &&
    sdk.web3.currentProvider.connection.close();
};

export const getServiceClient = async () => {
  try {
    const serviceClient = await sdk.createServiceClient(
      orgId,
      serviceId,
      service.COVIDClient,
      groupName,
      paymentStrategy,
      serviceClientOptions
    );
    return serviceClient;
  } catch (error) {
    throw error;
  }
};

const exampleService = async (
  serviceClientWithToken,
  vowelSoundUrl,
  coughUrl,
  breathUrl,
  userId,
  submissionId
) => {
  let serviceClient = serviceClientWithToken;
  try {
    if (!serviceClient) {
      serviceClient = await getServiceClient();
    }

    console.log(breathUrl, "breathUrl");
    console.log(vowelSoundUrl, "vowelSoundUrl");
    console.log(userId, "userId");
    console.log(submissionId, "submissionId");

    const request = new messages.Audio();

    request.setCoughUrl(coughUrl);
    request.setBreathUrl(breathUrl);
    request.setVowelSoundUrl(vowelSoundUrl);
    request.setUserId(userId);
    request.setSubmissionId(submissionId);

    return new Promise((resolve, reject) => {
      serviceClient.service.s2t(request, (err, result) => {
        if (err) {
          return reject(err);
        }
        closeConnection();
        resolve(result.getText());
      });
    });
  } catch (error) {
    throw error;
  }
};
export default exampleService;
