import mongoose, { Schema, Document, Model } from 'mongoose';

// Lecture note structure
interface LectureNote {
  id?: string;
  _id?: string;
  title?: string;
  name?: string;
  fileName?: string;
  fileType?: string;
  summary?: string;
  date: string;
  files?: { name: string, url: string }[];
}

export interface ICourse extends Document {
  googleUid: string;
  courseName: string;
  syllabusPDF?: string;
  lectureNotes?: LectureNote[];
  times?: string[];
  profName?: string;
  courseDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define schema for lecture notes
const LectureNoteSchema = new Schema({
  id: String,
  title: String,
  name: String,
  fileName: String,
  fileType: String,
  summary: String,
  date: String,
  files: [{ name: String, url: String }]
});

const CourseSchema: Schema = new Schema(
  {
    googleUid: {
      type: String,
      required: true,
      index: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    syllabusPDF: {
      type: String,
      default: '',
    },
    lectureNotes: {
      type: [LectureNoteSchema],
      default: [],
    },
    times: {
      type: [String],
      default: [],
    },
    profName: {
      type: String,
      default: '',
    },
    courseDescription: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'Course',
  }
);

// Check if the Course model already exists to prevent overwriting it
// This is needed for hot reloading in development
const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course; 