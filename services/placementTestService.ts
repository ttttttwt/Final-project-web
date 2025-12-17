import api from "@/lib/api";
import { PlacementQuestion, PlacementResult, PlacementSubmission } from "@/types/placement-test";

const BASE_URL = "/placement-test";

export const placementTestService = {
  getQuestions: async (): Promise<PlacementQuestion[]> => {
    const response = await api.get<PlacementQuestion[]>(`${BASE_URL}/questions`);
    return response.data;
  },

  submitTest: async (submission: PlacementSubmission): Promise<PlacementResult> => {
    const response = await api.post<PlacementResult>(`${BASE_URL}/submit`, submission);
    return response.data;
  },
};
