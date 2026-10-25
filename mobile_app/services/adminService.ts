const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type AdminProfile = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Get one admin
export const getAdminById = async (id: string) => {
  const res = await fetch(`${API_URL}/admin/${id}`);
  return await res.json();
};

// Create a new admin
export const createAdmin = async (admin: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
}) => {
  const res = await fetch(`${API_URL}/admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(admin),
  });
  return await res.json();
};

// Edit an admin (password fields are optional)
export const updateAdmin = async (
  id: string,
  admin: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    currentPassword?: string;
    newPassword?: string;
  }
) => {
  const res = await fetch(`${API_URL}/admin/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(admin),
  });
  return await res.json();
};
