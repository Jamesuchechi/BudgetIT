/**
 * Financial Variance Engine — BudgetIT
 * Contains core mathematical formulas and health status indicators for budgeting.
 */

export type BudgetHealthStatus = "under_budget" | "near_limit" | "over_budget";

export interface HealthBadgeConfig {
  status: BudgetHealthStatus;
  label: string;
  badgeClass: string;
  dotClass: string;
}

export interface VarianceSummary {
  budgeted: number;
  actual: number;
  variance: number;
  spendPercentage: number;
  remainingCap: number;
  health: BudgetHealthStatus;
}

export interface RollupGroup extends VarianceSummary {
  key: string;
  itemCount: number;
}

/**
 * Calculates budget variance metrics given budgeted and actual amounts.
 * - Variance Amount = Budgeted Amount - Actual Amount
 * - Spend Percentage = (Actual Amount / Budgeted Amount) * 100
 * - Remaining Cap = Budgeted Amount - Actual Amount
 */
export function calculateVariance(budgeted: number, actual: number): VarianceSummary {
  const safeBudgeted = Math.max(0, budgeted);
  const variance = safeBudgeted - actual;
  const spendPercentage = safeBudgeted > 0 ? (actual / safeBudgeted) * 100 : 0;
  const remainingCap = safeBudgeted - actual;
  const health = getBudgetHealthStatus(spendPercentage);

  return {
    budgeted: safeBudgeted,
    actual,
    variance,
    spendPercentage,
    remainingCap,
    health,
  };
}

/**
 * Health Status Thresholds:
 * - 🟢 Under Budget: < 80% spent
 * - 🟡 Near Limit: 80% - 99.9% spent
 * - 🔴 Over Budget: >= 100% spent
 */
export function getBudgetHealthStatus(spendPercentage: number): BudgetHealthStatus {
  if (spendPercentage >= 100) return "over_budget";
  if (spendPercentage >= 80) return "near_limit";
  return "under_budget";
}

export function getHealthBadgeConfig(health: BudgetHealthStatus): HealthBadgeConfig {
  switch (health) {
    case "under_budget":
      return {
        status: "under_budget",
        label: "Under Budget",
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        dotClass: "bg-emerald-500",
      };
    case "near_limit":
      return {
        status: "near_limit",
        label: "Near Limit",
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        dotClass: "bg-amber-500",
      };
    case "over_budget":
      return {
        status: "over_budget",
        label: "Over Budget",
        badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        dotClass: "bg-rose-500",
      };
  }
}

export interface RollupItem {
  category: string;
  department: string;
  budgeted_amount: number;
  actual_amount: number;
}

export function rollupByKey(
  items: RollupItem[],
  keySelector: (item: RollupItem) => string,
): RollupGroup[] {
  const map = new Map<string, { budgeted: number; actual: number; count: number }>();

  for (const item of items) {
    const key = keySelector(item) || "Unassigned";
    const current = map.get(key) ?? { budgeted: 0, actual: 0, count: 0 };
    current.budgeted += Number(item.budgeted_amount || 0);
    current.actual += Number(item.actual_amount || 0);
    current.count += 1;
    map.set(key, current);
  }

  return Array.from(map.entries())
    .map(([key, val]) => {
      const summary = calculateVariance(val.budgeted, val.actual);
      return {
        key,
        itemCount: val.count,
        ...summary,
      };
    })
    .sort((a, b) => b.budgeted - a.budgeted);
}

/**
 * Rollover Engine Calculation
 * Calculates surplus (or deficit) to carry over into next fiscal period.
 */
export function calculateBudgetRollover(
  previousBudgeted: number,
  previousActual: number,
  allowDeficitRollover: boolean = true,
): { carryOverAmount: number; isDeficit: boolean } {
  const netVariance = previousBudgeted - previousActual;
  if (netVariance < 0 && !allowDeficitRollover) {
    return { carryOverAmount: 0, isDeficit: true };
  }
  return {
    carryOverAmount: netVariance,
    isDeficit: netVariance < 0,
  };
}
