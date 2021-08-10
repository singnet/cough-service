const { Validator } = require("node-input-validator");

const coughServiceInputs = {
  coughUrl: "required|url",
  breathUrl: "required|url",
  vowelUrl: "required|url",
};

export const validateInputs = async (inputs) => {
  try {
    const schema = new Validator(inputs, coughServiceInputs);
    const matched = await schema.check();

    if (!matched) {
      const object = schema.errors;
      for (const key in object) {
        if (Object.hasOwnProperty.call(object, key)) {
          throw object[key].message;
        }
      }
    }
    return schema.inputs;
  } catch (error) {
    throw new Error(error);
  }
};
