import { supabase } from '../lib/supabase';

export interface MortgageCalculationParameters {
  id: string;
  institution_id: string | null;
  is_default: boolean;
  name: string | null;
  active: boolean;

  gds_excellent_threshold: number;
  gds_good_threshold: number;
  gds_fair_threshold: number;
  gds_qualifying_threshold: number;

  tds_excellent_threshold: number;
  tds_good_threshold: number;
  tds_fair_threshold: number;
  tds_qualifying_threshold: number;

  interest_rate_lte_80: number;
  interest_rate_80_to_95: number;
  interest_rate_95_to_99: number;
  interest_rate_100: number;

  gds_score_weight: number;
  tds_score_weight: number;
  down_payment_score_weight: number;
  employment_score_weight: number;
  income_score_weight: number;

  score_excellent_threshold: number;
  score_good_threshold: number;
  score_fair_threshold: number;

  property_tax_rate: number;
  heating_cost_monthly: number;

  down_payment_20_plus_score: number;
  down_payment_15_to_20_score: number;
  down_payment_10_to_15_score: number;
  down_payment_5_to_10_score: number;
  down_payment_under_5_score: number;

  employment_5_plus_years_score: number;
  employment_3_to_5_years_score: number;
  employment_1_to_3_years_score: number;
  employment_under_1_year_score: number;

  income_ratio_under_3_score: number;
  income_ratio_3_to_4_score: number;
  income_ratio_4_to_5_score: number;
  income_ratio_over_5_score: number;

  created_at: string;
  updated_at: string;
}

export async function getActiveParameters(institutionId?: string): Promise<MortgageCalculationParameters | null> {
  try {
    if (institutionId) {
      const { data, error } = await supabase
        .from('mortgage_calculation_parameters')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('active', true)
        .maybeSingle();

      if (error) throw error;

      if (data) return data as MortgageCalculationParameters;
    }

    const { data: defaultData, error: defaultError } = await supabase
      .from('mortgage_calculation_parameters')
      .select('*')
      .eq('is_default', true)
      .maybeSingle();

    if (defaultError) throw defaultError;

    return defaultData as MortgageCalculationParameters | null;
  } catch (error) {
    console.error('Error fetching parameters:', error);
    return null;
  }
}

export async function getSystemDefaultParameters(): Promise<MortgageCalculationParameters | null> {
  try {
    const { data, error } = await supabase
      .from('mortgage_calculation_parameters')
      .select('*')
      .eq('is_default', true)
      .maybeSingle();

    if (error) throw error;

    return data as MortgageCalculationParameters | null;
  } catch (error) {
    console.error('Error fetching system defaults:', error);
    return null;
  }
}

export async function updateInstitutionParameters(
  institutionId: string,
  updates: Partial<MortgageCalculationParameters>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('mortgage_calculation_parameters')
      .select('id')
      .eq('institution_id', institutionId)
      .eq('active', true)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      const { error: updateError } = await supabase
        .from('mortgage_calculation_parameters')
        .update(updates)
        .eq('id', existing.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('mortgage_calculation_parameters')
        .insert({
          institution_id: institutionId,
          active: true,
          is_default: false,
          ...updates,
        });

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating parameters:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update parameters'
    };
  }
}

export async function resetToDefaults(institutionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('mortgage_calculation_parameters')
      .delete()
      .eq('institution_id', institutionId)
      .eq('active', true);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error resetting to defaults:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset parameters'
    };
  }
}

export function getInterestRateForFinancing(
  params: MortgageCalculationParameters,
  downPaymentPercent: number
): number {
  if (downPaymentPercent >= 20) {
    return params.interest_rate_lte_80;
  } else if (downPaymentPercent >= 10) {
    return params.interest_rate_80_to_95;
  } else if (downPaymentPercent >= 5) {
    return params.interest_rate_95_to_99;
  } else {
    return params.interest_rate_100;
  }
}

export function getDownPaymentScore(
  params: MortgageCalculationParameters,
  downPaymentPercent: number
): number {
  if (downPaymentPercent >= 20) {
    return params.down_payment_20_plus_score;
  } else if (downPaymentPercent >= 15) {
    return params.down_payment_15_to_20_score;
  } else if (downPaymentPercent >= 10) {
    return params.down_payment_10_to_15_score;
  } else if (downPaymentPercent >= 5) {
    return params.down_payment_5_to_10_score;
  } else {
    return params.down_payment_under_5_score;
  }
}

export function getEmploymentScore(
  params: MortgageCalculationParameters,
  yearsEmployed: number
): number {
  if (yearsEmployed >= 5) {
    return params.employment_5_plus_years_score;
  } else if (yearsEmployed >= 3) {
    return params.employment_3_to_5_years_score;
  } else if (yearsEmployed >= 1) {
    return params.employment_1_to_3_years_score;
  } else {
    return params.employment_under_1_year_score;
  }
}

export function getIncomeRatioScore(
  params: MortgageCalculationParameters,
  loanToIncomeRatio: number
): number {
  if (loanToIncomeRatio < 3) {
    return params.income_ratio_under_3_score;
  } else if (loanToIncomeRatio < 4) {
    return params.income_ratio_3_to_4_score;
  } else if (loanToIncomeRatio < 5) {
    return params.income_ratio_4_to_5_score;
  } else {
    return params.income_ratio_over_5_score;
  }
}

export function getGDSScore(
  params: MortgageCalculationParameters,
  gdsRatio: number
): number {
  const maxScore = params.gds_score_weight;

  if (gdsRatio <= params.gds_excellent_threshold) {
    return maxScore;
  } else if (gdsRatio <= params.gds_good_threshold) {
    return maxScore * 0.75;
  } else if (gdsRatio <= params.gds_fair_threshold) {
    return maxScore * 0.5;
  } else {
    return maxScore * 0.25;
  }
}

export function getTDSScore(
  params: MortgageCalculationParameters,
  tdsRatio: number
): number {
  const maxScore = params.tds_score_weight;

  if (tdsRatio <= params.tds_excellent_threshold) {
    return maxScore;
  } else if (tdsRatio <= params.tds_good_threshold) {
    return maxScore * 0.75;
  } else if (tdsRatio <= params.tds_fair_threshold) {
    return maxScore * 0.5;
  } else {
    return maxScore * 0.25;
  }
}
