import mongoose from "mongoose";

const certSchema = new mongoose.Schema({
  certificateId: { type: String, required: true, unique: true },
  studentName: { type: String },
  email: { type: String },
  courseName: { type: String },
  issueDate: { type: Date },
  meta: { type: mongoose.Schema.Types.Mixed },
  pdfPath: { type: String }, // e.g. /public/certs/xxx.pdf
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Certificate", certSchema);
