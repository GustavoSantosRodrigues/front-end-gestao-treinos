export type WeekDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY"

export type NutritionFood = {
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export type NutritionMeal = {
  id: string
  nutritionDayId: string
  name: string
  time?: string | null
  calories: number
  protein: number
  carbs: number
  fat: number
  foods: NutritionFood[]
  notes?: string | null
  order: number
}

export type NutritionDay = {
  id: string
  nutritionPlanId: string
  weekDay: WeekDay | null
  order: number
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  meals: NutritionMeal[]
}

export type NutritionPlan = {
  id: string
  userId: string
  goal: string
  isActive: boolean
  coverImageUrl?: string | null
  notes?: string | null
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  days: NutritionDay[]
  createdAt: string
  updatedAt: string
}

export const JS_TO_WEEKDAY: WeekDay[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
]

export type NutritionDayWithPlan = NutritionDay & {
  nutritionPlan: Pick<
    NutritionPlan,
    "id" | "goal" | "totalCalories" | "totalProtein" | "totalCarbs" | "totalFat"
  >
}