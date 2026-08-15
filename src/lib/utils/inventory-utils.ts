// src/lib/utils/inventory-utils.ts

export class InventoryUtils {
  /**
   * Calcular rotación de inventario
   */
  static calculateTurnover(costOfGoodsSold: number, averageInventory: number): number {
    if (averageInventory === 0) return 0
    return costOfGoodsSold / averageInventory
  }

  /**
   * Calcular días de inventario
   */
  static calculateDaysOfInventory(averageInventory: number, dailyCostOfGoodsSold: number): number {
    if (dailyCostOfGoodsSold === 0) return 0
    return averageInventory / dailyCostOfGoodsSold
  }

  /**
   * Calcular punto de reorden
   */
  static calculateReorderPoint(
    dailyDemand: number,
    leadTimeDays: number,
    safetyStock: number
  ): number {
    return (dailyDemand * leadTimeDays) + safetyStock
  }

  /**
   * Calcular stock de seguridad
   */
  static calculateSafetyStock(
    maxDailyDemand: number,
    maxLeadTimeDays: number,
    averageDailyDemand: number,
    averageLeadTimeDays: number
  ): number {
    return (maxDailyDemand * maxLeadTimeDays) - (averageDailyDemand * averageLeadTimeDays)
  }

  /**
   * Calcular costo promedio ponderado
   */
  static calculateWeightedAverage(
    currentStock: number,
    currentCost: number,
    newStock: number,
    newCost: number
  ): number {
    const totalCost = (currentStock * currentCost) + (newStock * newCost)
    const totalStock = currentStock + newStock
    return totalCost / totalStock
  }
}