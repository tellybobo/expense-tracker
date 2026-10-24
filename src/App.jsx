import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faXmark, faTrash, faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useEffect,  useState } from "react"

function App() {
  const[sidebarOpen, setSidebarOpen] = useState(false)
  const[showTransactionForm, setShowTransactionForm] = useState(false)
  const[title, setTitle] = useState("")
  const[amount, setAmount] = useState("")
  const[type, setType] = useState("expense")
  const[filterType, setFilterType] = useState("all")
  const[filterCategory, setFilterCategory] = useState("all")
  const[searchTerm, setSearchTerm] = useState("")
  const[category, setCategory] = useState("Food")
  const[date, setDate] = useState(new Date().toISOString().split("T")[0])
  const[editingId, setEditingId] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  useEffect(() => {
  const fetchTransactions = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/transactions");

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  fetchTransactions();
}, []);
  
const [monthlyBudget, setMonthlyBudget] = useState(() => {
  const savedBudget = localStorage.getItem("monthlyBudget");
  return savedBudget !== null ? Number(savedBudget) : 0;
});

  const[draftBudget, setDraftBudget] = useState(String(monthlyBudget));

  const [isEditingBudget, setIsEditingBudget] = useState(false)

  useEffect(()=> {
    localStorage.setItem("monthlyBudget", monthlyBudget);

  }, [monthlyBudget]);

  console.log("Transactions loaded:", transactions)

  const totalIncome = transactions
  .filter((transaction)=>transaction.type === "income")
  .reduce((total, transaction)=> total + transaction.amount, 0)
  
  const totalExpenses = transactions
  .filter((transaction)=>transaction.type === "expense")
  .reduce((total, transaction)=> total + transaction.amount, 0)

  const totalBalance = totalIncome - totalExpenses
  
const handleAddTransaction = async (e) => {
  e.preventDefault()

  if (!title.trim() || !amount || Number(amount) <= 0) {
    alert("Please enter a title and a valid amount")
    return
  }

  if (editingId !== null) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/transactions/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            amount: Number(amount),
            type: type,
            category: category,
            date: date,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update transaction");
      }

      const updatedTransaction = await response.json();

      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction._id === editingId ? updatedTransaction : transaction
        )
      );

      setEditingId(null);
      setTitle("");
      setAmount("");
      setShowTransactionForm(false);

    } catch (error) {
      console.error("Error updating transaction:", error);
    }

  } else {
    try {
      const response = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          amount: Number(amount),
          type: type,
          category: category,
          date: date,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save transaction");
      }

      const newTransaction = await response.json();

      setTransactions((prevTransactions) => [
        ...prevTransactions,
        newTransaction,
      ]);

      setTitle("");
      setAmount("");
      setShowTransactionForm(false);

    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Could not save transaction. Please try again.");
    }
  }
}


  const handleEditTransaction = (transaction) => {
  setTitle(transaction.title)
  setAmount(String(transaction.amount))
  setType(transaction.type)
  setCategory(transaction.category)
  setDate(transaction.date.slice(0, 10))
  setEditingId(transaction._id) 
  setShowTransactionForm(true)
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

    
  
const handleDeleteTransaction = async (id) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/transactions/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
  const errorMessage = await response.text();
  console.error("Delete response:", response.status, errorMessage);
  throw new Error("Failed to delete transaction");
}
    setTransactions((prevTransactions) =>
      prevTransactions.filter(
        (transaction) => transaction._id !== id
      )
    );
  } catch (error) {
    console.error("Error deleting transaction:", error);
    alert("Could not delete transaction. Please try again.");
  }
};

  const filteredTransactions = transactions.filter((transaction)=> {
    const matchesType = filterType === "all" || transaction.type 
    === filterType

    const matchesCategory = filterCategory === "all" ||
    transaction.category === filterCategory

    const matchesSearch = transaction.title
    .toLowerCase()
    .includes(searchTerm.toLowerCase())

    return matchesType && matchesCategory && matchesSearch

  })

  const monthlyChartData = Array.from({length:6}, (_, index) => {
    const monthDate = new Date()
    monthDate.setDate(1)
    monthDate.setMonth(monthDate.getMonth()-(5 - index))
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()

    const monthlyTransactions = transactions.filter((transaction) => {
      if (!transaction.date) return false
      const transactionDate = new Date(transaction.date.slice(0, 10) + 'T00:00:00')

      return (
        transactionDate.getFullYear()===year
        &&
        transactionDate.getMonth()===month
      )
    })

    return {
      month:
    monthDate.toLocaleString("en-US", {month: "short"}), Income: monthlyTransactions
    .filter((transaction)=>transaction.type=== "income")
    .reduce((total, transaction)=> total + Number(transaction.amount), 0),
    Expenses: monthlyTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + Number(transaction.amount), 0)
    }
  })

  const categoryChartData = transactions
  .filter((transaction) => transaction.type === "expense")
  .reduce((categories, transaction) => {
    const categoryName = transaction.category || "Uncategorized";

    const existingCategory = categories.find(
      (item) => item.name === categoryName
    );

    if (existingCategory) {
      existingCategory.value += Number(transaction.amount);
    } else {
      categories.push({
        name: categoryName,
        value: Number(transaction.amount),
      });
    }

    return categories;
  }, []);

  const categoryColors = [
    "#16a34a",
    "#2563EB",
    "#f59e0b",
    "#dc2626",
    "#9333ea",
    "#0891b2",
    "#64748b",
    "#ec4899",
  ];

  const currentMonthExpenses = transactions.filter((transaction)=> {
    if (transaction.type!=="expense" || !transaction.date) {
      return false;
    }

  const transactionDate = new Date(`${transaction.date}T00:00:00`);
  const today = new Date();

  return (
    transactionDate.getMonth()===today.getMonth() &&
    transactionDate.getFullYear()===
    today.getFullYear()

  );
  })
  .reduce(
    (total, transaction) => total + Number(transaction.amount),
    0
);

const budgetPercentage =
  monthlyBudget > 0
    ? (currentMonthExpenses / monthlyBudget) * 100
    : 0;
const budgetRemaining = monthlyBudget - currentMonthExpenses;
  console.log("Monthly chart data:", monthlyChartData)

  return (
    <div className="min-h-screen
    bg-gray-50 text-gray-900 md:flex">
      <button onClick={()=> setSidebarOpen(!sidebarOpen)}
      className="m-4 rounded-lg bg-white p-3 shadow md:hidden">
       <FontAwesomeIcon icon={faBars}/> Menu
      </button>
      {sidebarOpen && (
        <div
         onClick={()=> setSidebarOpen(false)}
         className="fixed inset-0 z-40 bg-black/40 md:hidden"
         />
      )}

      

      {/* Sidebar */}

    <aside className={`${
      sidebarOpen ? "block":"hidden"
    } fixed inset-y-0 left-0 z-50 w-72 bg-white p-6 shadow-lg
    md:static md:z-auto md:block md:w-64
    md:shrink-0 md:shadow-none`}>
      <div className="flex items-center
      justify-between">

    <h1 className="text-2xl font-bold
    text-blue-600">ExpenseTrack</h1>
    <button
      onClick={()=> setSidebarOpen(false)}
      className="rounded-lg p-2 text-gray-500
      hover:bg-gray-100 md:hidden"
      aria-label="Close sidebar"> 
      <FontAwesomeIcon icon={faXmark}/>
    </button>
    </div>
    <p className="mt-2 text-sm
    text-gray-500">Manage your money better</p>
    <nav className="mt-8 space-y-2">

      <a 
      href="#dashboard" onClick={()=> 
        setSidebarOpen(false)
      }
      className="block rounded-lg
      bg-blue-50 px-4 py-3 font-medium
      text-blue-700">Dashboard</a>

      <a href="#transactions"
        onClick={()=> 
        setSidebarOpen(false)
      }
      className="block rounded-lg px-4
      py-3 text-gray-600 hover:bg-gray-100">
         Transactions
      </a>

      <a href="#budgets" 
         onClick={()=> 
        setSidebarOpen(false)
      }
      className="block rounded-lg px-4
      py-3 text-gray-600 hover:bg-gray-100">
        Budgets
      </a>

      <a href="#settings" 
       onClick={()=> 
        setSidebarOpen(false)
      }
      className="
      block rounded-lg px-4
      py-3 text-gray-600 hover:bg-gray-100">
        Settings
      </a>
    </nav>
    </aside>

    { /* Main Content */ }
    <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-10">
      <div className="mb-8">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h2 className="text-2xl font-bold sm:text-3xl">
        Dashboard
      </h2>

      <p className="mt-2 text-sm text-gray-500 sm:text-base">
        Here's an overview of your finances
      </p>
    </div>

    <button
      onClick={() => {
        setTitle("");
        setAmount("");
        setType("expense");
        setCategory("Food");
        setDate(new Date().toISOString().split("T")[0]);
        setEditingId(null);
        setShowTransactionForm(true);
      }}
      className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 sm:w-auto sm:py-2"
    >
      + Add Transaction
    </button>
  </div>
</div>
    {showTransactionForm && (
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h3
        className="mb-4 text-xl font-semibold">
          Add New Transaction
        </h3>
        <form onSubmit={handleAddTransaction}>
          <div className="mb-4">
            <label
            className="mb-1 block text-sm
            font-medium">
              Transaction Title
            </label>
            <input type="text"
            value={title}
            onChange={(e)=> setTitle(e.target.value)} 
            placeholder="e.g. Salary or Groceries"
            className="w-full rounded-lg border border-gray-300 p-3
            outline-none
            focus:border-blue-500"
            />
        </div>

        <div className="mb-4">
            <label
            className="mb-1 block text-sm
            font-medium">
              Amount(FCFA)
            </label>
            <input type="number"
            value={amount}
            onChange={(e)=> setAmount(e.target.value)}  
            placeholder="Enter amount"
            className="w-full rounded-lg border border-gray-300 p-3
            outline-none
            focus:border-blue-500"
            />
        </div>

        <div className="mb-4">
            <label
            className="mb-1 block text-sm
            font-medium">
              Type
            </label>
            <select
            value={type}
            onChange={(e)=> setType(e.target.value)} 
            className="w-full rounded-lg border
            border-gray-300 p-3">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Category
              </label>
              <select value={category}
              onChange={(e)=>setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3">
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Bills">Bills</option>
                <option value="Rent">Rent</option>
                <option value="Shopping">Shopping</option>
                <option value="Health">Health</option>
                <option value="Salary">Salary</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label
              className="mb-1 block text-sm font-medium">
                Date
              </label>
              <input type="date" 
              value={date}
              onChange={(e)=>setDate(e.target.value)}
              className="w-full founded-lg border border-gray-300 p-3"/>
            </div>
        </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
  type="submit"
  onClick={() => console.log('editingId at button click:', editingId)}
  className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 sm:w-auto">
  Save Transaction
</button>
            <button
            type="button"
            onClick={()=> 
            setShowTransactionForm(false)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium hover:bg-gray-100 sm:w-auto">
            Cancel
            </button>
          </div>
        </form>
      </div>
    )}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border
        border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
              Total Balance
          </p>
          <p className="mt-3 text-3xl
          font-bold">{totalBalance.toLocaleString()}FCFA</p>
        </div>
        <div className="rounded-xl border
        border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm
          text-gray-500">
            Income
          </p>
          <p className="mt-3 text-3xl
          font-bold text-green-600">
            {totalIncome.toLocaleString()}FCFA
          </p>
        </div>

        <div className="rounded-xl border 
        border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Expenses
          </p>
          <p className="mt-3 text-3xl
          font-bold text-red-600">
            {totalExpenses.toLocaleString()}FCFA
          </p>
        </div>
      </section>
   <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Monthly Budget Container */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
  <h2 className="mb-4 flex items-center justify-between">
    Monthly Budget
  </h2>
    
    <button
    onClick={() => {
  if (!isEditingBudget) {
    setDraftBudget(String(monthlyBudget));
    setIsEditingBudget(true);
  } else {
    setIsEditingBudget(false);
  }
}}
className="text-sm font-medium text-blue-600 hover:text-blue-800">
  {isEditingBudget
  ? "Cancel"
  : monthlyBudget > 0
    ? "Edit Budget"
    : "Set Monthly Budget"}
    </button>
  <div className="mb-2 flex items-center justify-between">
    <span className="text-gray-600">
      Spent this month
    </span>
    <span className="font-semibold text-gray-800">
      FCFA {currentMonthExpenses.toLocaleString()}
    </span>
  </div>
       
{isEditingBudget && (
  <div className="mb-4 space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      Enter your monthly budget (FCFA)
    </label>

    <div className="flex items-center gap-2">
      <input
        type="number"
        min="1"
        value={draftBudget}
        onChange={(e) => setDraftBudget(e.target.value)}
        className="w-full rounded-lg border border-gray-300 p-2 text-gray-800 focus:border-blue-500 focus:outline-none"
        placeholder="e.g. 400000"
      />

      <button
        onClick={() => {
          const amount = Number(draftBudget);

          if (amount > 0 && Number.isFinite(amount)) {
            setMonthlyBudget(amount);
            setIsEditingBudget(false);
          }
        }}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Save
      </button>
    </div>
  </div>
)}
  
{monthlyBudget > 0 ? (
  <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
    <div
      className={`h-full rounded-full ${
        budgetPercentage >= 100 ? "bg-red-600" : "bg-green-600"
      }`}
      style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
    />
  </div>
) : (
  <p className="mb-4 text-sm text-gray-500">
    No monthly budget set. Set a budget to track your spending progress.
  </p>
)}


  <div className="mb-4 flex items-center justify-between text-sm">
    
{monthlyBudget > 0 && (
  <div className="mt-4 space-y-4">
    <div className="flex flex-col gap-1">
      <span className="text-sm text-gray-500">
        Monthly Budget
      </span>
      <span className="text-lg font-semibold text-gray-800">
        FCFA {monthlyBudget.toLocaleString()}
      </span>
    </div>

    <div className="flex flex-col gap-1">
      <span className="text-sm text-gray-500">
        {budgetRemaining >= 0 ? "Remaining Budget" : "Over Budget"}
      </span>
      <span
        className={`text-lg font-semibold ${
          budgetRemaining >= 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        FCFA {Math.abs(budgetRemaining).toLocaleString()}
      </span>
    </div>

    {budgetRemaining < 0 && (
      <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
        You exceeded your budget by FCFA{" "}
        {Math.abs(budgetRemaining).toLocaleString()}.
      </p>
    )}
  </div>
)}
</div>
</div>

<div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
  <h2 className="mb-6 text-xl font-semibold text-gray-800">
    Monthly Income vs Expenses
  </h2>

  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={monthlyChartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
      <Bar dataKey="Expenses" fill="#dc2626" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
</div>
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2
          className="mb-6 text-xl
          font-semibold text-gray-800">
          Spending by Category 
          </h2>
          {categoryChartData.length === 0 ? (
          <p
          className="py-10 text-center text-gray-500">
            Add an expense to see your spending by category.
          </p> ) : (
            <ResponsiveContainer width="100%"
            height={300}>
              <PieChart>
                <Pie
                data={categoryChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={3}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell
                    key={entry.name}
                    fill={categoryColors[index % categoryColors.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                formatter={(value)=> `FCFA ${Number(value).toLocaleString()}`}
                />
                <Legend/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-xl 
      border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg
        font-semibold">
          Recent Transactions
        </h3>
        <div
        className="mb-4 flex flex-wrap gap-2">
          <button
          onClick={()=>setFilterType("all")}
          className={`rounded-lg px-4 py-2
            ${filterType === "all" ? "bg-blue-600 text-white" :
               "bg-100 text-gray-700"}
          `}>All</button>
          <button
          onClick={()=>setFilterType("income")}
          className={`rounded-lg px-4 py-2
            ${filterType === "income" ? "bg-blue-600 text-white" :
               "bg-100 text-gray-700"}
          `}>Income</button>
          <button
          onClick={()=>setFilterType("expense")}
          className={`rounded-lg px-4 py-2
            ${filterType === "expense" ? "bg-blue-600 text-white" :
               "bg-100 text-gray-700"}
          `}>Expenses</button>

        </div>
        <div
        className="mb-4">
          <label 
          className="mb-1 block text-sm font-medium">
            Filter by category
            </label>
            <select 
            value={filterCategory}
            onChange={(e)=> setFilterCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3">
              <option value="all">All Categories</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Bills">Bills</option>
              <option value="Rent">Rent</option>
              <option value="Shopping">Shopping</option>
              <option value="Health">Health</option>
              <option value="Salary">Salary</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div
          className="mb-4">
            <label
            className="mb-1 block text-sm font-medium">
              Search transactions
            </label>
            <input 
            type="text"
            value={searchTerm}
            onChange={(e)=>
              setSearchTerm(e.target.value)} 
              placeholder="Search by transaction title..."
              className="w-full rounded-lg border border-gray-300 p-3"/>


          </div>
        <div
        className="mt-4 space-y-3">
          {transactions.length === 0 ? (
            <p
            className="text-sm text-gray-500">
              No transactions yet. Add your first transaction!
            </p>
          ):(
            filteredTransactions.map((transaction)=> (
              <div
              key={transaction._id}
  className="flex flex-col gap-3 rounded-lg border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="font-medium">
                {transaction.title}
                <p
                className="text-sm text-gray-500">
                  {transaction.category || "Uncategorized"}
                </p>
                <p
                className="text-sm text-gray-500">
                  {transaction.date || "No date"}
                </p>
            </h4>
            <p className="text-sm" text-gray-500>
              {transaction.type === "income" ?
              "Income":"Expense"}
              </p>
            </div>
            <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
              <p
              className={`font-semibold ${
                transaction.type === "income"
                ? "text-green-600"
                : "text-red-600"
              }`}>
                {transaction.type === "income" ? "+" : "-"}
                {transaction.amount.toLocaleString()}FCFA

              </p>
              <button
              type="button"
              onClick={()=> {
                handleEditTransaction(transaction)
              }}
              className="rounded-lg px-3 py-2 text-sm
              text-blue-600 hover:bg-blue-50">
              <FontAwesomeIcon icon={faPenToSquare}/>
              </button>
              <button
              onClick={()=> 
                handleDeleteTransaction(transaction._id)
              }
              className="rounded-lg px-3 py-2 text-sm text-red-600
              hover:bg-red-red">
                <FontAwesomeIcon icon={faTrash}/>
              </button>

            </div>
              </div>
            ))
          )}
           

        </div>
      </section>
      
    </main>
    </div>
  )
}

export default App