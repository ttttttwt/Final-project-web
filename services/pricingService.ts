import api from "@/lib/api";

/**
 * Pricing plan response from public API
 */
export interface PricingPlan {
  id: string;
  name: string;
  planType: "MONTHLY" | "YEARLY";
  description: string;
  price: number;
  originalPrice: number | null;
  billingInterval: string;
  isFeatured: boolean;
  displayOrder: number;
  features: Record<string, unknown>;
}

/**
 * Service for fetching public pricing information.
 * No authentication required.
 */
export const pricingService = {
  /**
   * Get all available pricing plans
   * @returns Array of active pricing plans
   */
  async getPlans(): Promise<PricingPlan[]> {
    const response = await api.get<PricingPlan[]>("/pricing/plans");
    return response.data;
  },

  /**
   * Get a specific plan by type
   * @param planType - MONTHLY or YEARLY
   * @returns The matching plan or undefined
   */
  async getPlanByType(planType: "MONTHLY" | "YEARLY"): Promise<PricingPlan | undefined> {
    const plans = await this.getPlans();
    return plans.find((plan) => plan.planType === planType);
  },

  /**
   * Calculate savings for yearly plan compared to monthly
   * @param monthlyPrice - Monthly plan price
   * @param yearlyPrice - Yearly plan price
   * @returns Object with savings amount and percentage
   */
  calculateYearlySavings(monthlyPrice: number, yearlyPrice: number): {
    amountSaved: number;
    percentSaved: number;
    monthlyEquivalent: number;
  } {
    const yearlyIfMonthly = monthlyPrice * 12;
    const amountSaved = yearlyIfMonthly - yearlyPrice;
    const percentSaved = Math.round((amountSaved / yearlyIfMonthly) * 100);
    const monthlyEquivalent = Number((yearlyPrice / 12).toFixed(2));

    return {
      amountSaved,
      percentSaved,
      monthlyEquivalent,
    };
  },
};
