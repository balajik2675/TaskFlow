import { createMemoryModel } from "./memoryModel.js";

const User = createMemoryModel("User", {
  name: "",
  email: "",
  passwordHash: "",
  createdAt: new Date(),
  updatedAt: new Date()
});

export default User;
