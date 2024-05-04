
import { Schema, model, Document } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
// interface is how we can provide type safety 
interface IUser extends Document { 
  username: string;
  password: string;
  logStatus: boolean; 
  checkPassword: (possiblyPassword: string) => Promise<boolean>; 
}

// 2. Create a Schema corresponding to the document interface.
// schemas are how you tell mongoose what your documents look like 
const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  logStatus: {type: Boolean, required: false}
});

userSchema.methods.checkPassword = function (this: IUser, possiblyPass: string): boolean { // defining method to check password 
    const isMatch = possiblyPass === this.password; 
    return isMatch
  };
  // return boolean representing whether password correct or not 

// 3. Create a Model
const User = model<IUser>('User', userSchema);


export default User; 