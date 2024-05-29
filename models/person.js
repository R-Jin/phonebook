const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: [8, "User phone number not long enough"],
    validate: {
      validator: function (v) {
        return /^([0-9]{2}|[0-9]{3})\-[0-9]+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid number!`,
    },
    required: [true, "User phone number required"],
  },
});

personSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
