
import { Schema, model } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
interface EntryEmotionItem {
  segment: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  sentiment_rate: number 
}

interface IJournalEntry {
  entryTitle: string;
  entryDate: Date;  
  entryText: string;
  general_sentiment: string; 
  general_sentiment_rate: number; 
  emotionData: EntryEmotionItem[];
  author: string; 
}

const entryEmotionItemSchema = new Schema({
  segment: { type: String, required: false },
  sentiment: { type: String, required: false, enum: ['Positive', 'Negative', 'Neutral'] },
  sentiment_rate: { type: Number, required: false },
});

// 2. Create a Schema corresponding to the document interface.
const journalSchema = new Schema<IJournalEntry>({
  entryTitle: { type: String, required: true },
  entryDate: { type: Date, required: true }, 
  entryText: { type: String, required: true }, 
  general_sentiment: { type: String, required: false }, 
  general_sentiment_rate: { type: Number, required: false }, 
  emotionData: { type: [entryEmotionItemSchema], required: false }, 
  author: { type: String, required: true }
});

// 3. Create a Model.
// models in mongoose provide INTERFACE to database for querying, updating, deleting records 
const JournalEntry = model<IJournalEntry>('Journal Entry', journalSchema);

export default JournalEntry; 