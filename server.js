import express from "express";
import aiService, { getServiceClient } from "./aiService";
import { generateId } from "./utils/RandomId";
import { validateInputs } from "./utils/ValidateIputs";
import { uploadFile } from "./utils/FileUploader";
import fileUpload from "express-fileupload";

let localConcurrencyToken = "";
let localChannelId = "";
let tokenCreationInProgress = false;
let serviceClient;

let vowelSoundUrl;
let coughUrl;
let breathUrl;

const app = express();
const port = 8077;

const status = { SUCCESS: "SUCCESS", FAILURE: "FAILURE" };

app.use(express.json());
app.use(fileUpload({ safeFileNames: true }));

app.listen(port, () => {
  console.log(`Covid detection service listening at http://localhost:${port}`);
});

app.get("/hello", (req, res) => {
  return res.status(200).send("Hello World!");
});

app.post("/coviddetection", async (req, res) => {
  if (!serviceClient) {
    serviceClient = await getServiceClient();
  }
  function waitForTokenCreation() {
    return new Promise((resolve, reject) => {
      const checking = setInterval(() => {
        if (!tokenCreationInProgress) {
          clearInterval(checking);
          resolve();
        }
      }, 3000);
    });
  }

  const createConcurrencyToken = async () => {
    try {
      tokenCreationInProgress = true;
      const result = await serviceClient.getConcurrencyTokenAndChannelId();
      const { concurrencyToken, channelId } = result;
      tokenCreationInProgress = false;
      localConcurrencyToken = concurrencyToken;
      localChannelId = channelId;
    } catch (error) {
      throw new Error(error);
    }
  };

  const invokeAiService = async () => {
    try {
      serviceClient.setConcurrencyTokenAndChannelId(
        localConcurrencyToken,
        localChannelId
      );

      const userId = generateId();
      const submissionId = generateId();

      return await aiService(
        serviceClient,
        vowelSoundUrl,
        coughUrl,
        breathUrl,
        userId,
        submissionId
      );
    } catch (error) {
      throw new Error(error);
    }
  };

  const getFileContent = ({ data, name }) => {
    const fileContent = Buffer.from(data, "binary");
    return { fileContent, name };
  };

  const run = async (shouldCreateNewToken = false) => {
    try {
      if (tokenCreationInProgress) await waitForTokenCreation();
      if (shouldCreateNewToken) await createConcurrencyToken();
      return await invokeAiService();
    } catch (error) {
      let errorMessage = error.message.toLowerCase();
      if (
        errorMessage.includes("Usage Exceeded on channel Id".toLowerCase()) ||
        errorMessage.includes(
          "signed amount for token request cannot be greater than full amount in channel".toLowerCase()
        ) ||
        errorMessage.includes(
          "signed amount for token request needs to be greater than last signed amount"
        ) ||
        errorMessage.includes("Insufficient funds in channel".toLowerCase())
      ) {
        await run(true);
      } else if (errorMessage.includes("already known")) {
        tokenCreationInProgress = true;
        await run();
      } else {
        throw new Error(error);
      }
    }
  };

  async function uploadFiles(req) {
    const folderName = generateId();
    const fileUploadPath = `public/COUGH_TEST_${folderName}`;

    const vowelFile = getFileContent(req.files.vowelFile);
    const coughFile = getFileContent(req.files.coughFile);
    const breathFile = getFileContent(req.files.breathFile);

    vowelSoundUrl = await uploadFile(
      fileUploadPath,
      vowelFile.name,
      vowelFile.fileContent
    );

    coughUrl = await uploadFile(
      fileUploadPath,
      coughFile.name,
      coughFile.fileContent
    );

    breathUrl = await uploadFile(
      fileUploadPath,
      breathFile.name,
      breathFile.fileContent
    );
  }

  try {
    await validateInputs(req.files);
    await uploadFiles(req);
    const data = await run(!Boolean(localConcurrencyToken));

    res.status(200).json({ data, status: status.SUCCESS });
  } catch (error) {
    res.status(400).json({ error: error.toString(), status: status.FAILURE });
  }
});
