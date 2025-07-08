import { useEffect, useState } from 'react';

interface Category {
  label: string;
  keywords: string[];
  budget: number;
}

export function useBudgetAlert() {
  const [showAlert, setShowAlert] = useState(false);
  const [totalBudget, setTotalBudget] = useState<number | null>(null);

  useEffect(() => {
    fetch('/categories.json')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.categories)) {
          const sum = data.categories.reduce((acc: number, cat: Category) => acc + (Number(cat.budget) || 0), 0);
          setTotalBudget(sum);
          if (sum > 100) setShowAlert(true);
        }
      })
      .catch(() => {});
  }, []);

  return { showAlert, totalBudget };
}
