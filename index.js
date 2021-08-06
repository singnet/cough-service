import aiService from "./aiService";

const main = async () => {
  const response = await aiService();
  console.log("Get the data from the response object", response);
};

main();
