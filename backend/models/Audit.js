import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  admin: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  certId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Audit", auditSchema);
