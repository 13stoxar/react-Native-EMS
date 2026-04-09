import api from "./client";

export interface ExpenseData {
  id?: string;
  merchant: string;
  amount: number;
  date: string;
  items: any[];
  category?: string;
}

// In-memory mock storage for the session
let mockExpenses: ExpenseData[] = [
  { id: "1", merchant: "Amazon", amount: 45.99, date: new Date().toISOString(), items: [], category: "Shopping" },
  { id: "2", merchant: "Starbucks", amount: 5.50, date: new Date().toISOString(), items: [], category: "Food" },
  { id: "3", merchant: "Uber", amount: 15.20, date: new Date().toISOString(), items: [], category: "Transport" },
];

export const createExpense = async (expenseData: ExpenseData) => {
  console.log("Mocking createExpense:", expenseData);
  await new Promise(resolve => setTimeout(resolve, 500));
  const newExpense = { ...expenseData, id: Math.random().toString(36).substr(2, 9) };
  mockExpenses.push(newExpense);
  return newExpense;
};

export const getExpenses = async () => {
  console.log("Mocking getExpenses");
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockExpenses;
};

export const deleteExpense = async (id: string) => {
  console.log("Mocking deleteExpense:", id);
  await new Promise(resolve => setTimeout(resolve, 500));
  mockExpenses = mockExpenses.filter(e => e.id !== id);
  return { success: true };
};
