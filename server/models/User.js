import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * User Model
 * Defines the schema for application users, storing name, email, password, and credit balance.
 * Includes a pre-save hook to hash the password securely before storing it in the database.
 */
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  credits: { type: Number, default: 20 },
});

// Hash Password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
