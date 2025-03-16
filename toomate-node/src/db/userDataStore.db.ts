import { UserPayment } from "../models/userPayment.model.js";
import User from "../models/user.model.js";

// Create a new user
export const createUser = async (userData: any) => {
  const newUser = new User({
    id: userData.id,
    email: userData.email_addresses[0].email_address,
    firstName: userData.first_name,
    lastName: userData.last_name,
    imageUrl: userData.image_url,
    clerkUserId: userData.id,
    createdAt: new Date(userData.created_at),
    updatedAt: new Date(userData.updated_at),
  });

  const newPayment = new UserPayment({
    userId: newUser._id,
    activePlan:'',
    planAccess:[true, false, false]
  });


  try {
    await newUser.save();
    await newPayment.save();
  } catch (error) {
    console.error("Error saving data:", error);
    throw error;
  }
};

// Update a user
export const updateUser = async (userData: any) => {
  const updateData = {
    email: userData.email_addresses[0].email_address,
    firstName: userData.first_name,
    lastName: userData.last_name,
    imageUrl: userData.image_url,
    updatedAt: new Date(userData.updated_at),
  };

  try {
    await User.findOneAndUpdate({ clerkUserId: userData.id }, updateData, { new: true });

  } catch (error) {

    throw error;
  }
};

// Delete a user
export const deleteUser = async (userData: any) => {
  try {
    await User.findOneAndDelete({ clerkUserId: userData.id });

  } catch (error) {

    throw error;
  }
};
