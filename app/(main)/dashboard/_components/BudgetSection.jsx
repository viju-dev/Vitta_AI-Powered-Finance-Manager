// This is a new ASYNC Server Component
import { getCurrentBudget } from "@/actions/budget";
import BudgetProgress from "./budget-progress"; // Assuming this component exists

// This component receives the ID and fetches the data
export default async function BudgetSection({ defaultAccountId }) {
  if (!defaultAccountId) {
    // If there's no account return nothing
    return null;
  }
  
  // This is the slow await, but it only blocks THIS component's rendering, not the whole page.
  const budgetData = await getCurrentBudget(defaultAccountId); 

  return (
    <BudgetProgress
      initialBudget={budgetData?.budget}
      currentExpenses={budgetData?.currentExpenses || 0}
    />
  );
}
