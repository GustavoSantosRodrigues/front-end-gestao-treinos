import { NutritionChat } from "./_components/nutrition-chat";

export default function NutritionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <NutritionChat />
    </>
  );
}