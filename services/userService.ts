import api from "@/lib/api";
import { User } from "@/types/auth";

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put("/users/profile", data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/users/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
