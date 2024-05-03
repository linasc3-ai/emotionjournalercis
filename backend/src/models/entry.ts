
import { Schema, model } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
interface IJournalEntry {
  entryTitle: string;
  entryDate: Date;  
  entryText: string;
  entryEmotion: string; 
  author: string; 
}


// 2. Create a Schema corresponding to the document interface.
const journalSchema = new Schema<IJournalEntry>({
  entryTitle: { type: String, required: true },
  entryDate: { type: Date, required: true }, 
  entryText: { type: String, required: true }, 
  entryEmotion: { type: String, required: false }, // false required we don't want to fill this in until we get API result 
  author: { type: String, required: true }
});

// 3. Create a Model.
// models in mongoose provide INTERFACE to database for querying, updating, deleting records 
const JournalEntry = model<IJournalEntry>('Journal Entry', journalSchema);

export default JournalEntry; 