(() => {
  const { useState, useEffect } = React;
  
  const App = () => {
    // Destructure components, data, and utils from the global namespace
    const components = window.MySelvam.components;
    const data = window.MySelvam.data;
    const utils = window.MySelvam.utils;

    const {
      DashboardIcon, PortfolioIcon, GoldIcon, AssetsIcon, ExpensesIcon, GoalsIcon, LogoIcon, CheckCircleIcon, SpinnerIcon
    } = components;

    const {
        mockMutualFunds, mockGoldHoldings, mockAssets, mockExpenses, mockGoals
    } = data;

    const { generateMissingSipTransactions } = utils;

    const [activeView, setActiveView] = useState('dashboard');
    const [funds, setFunds] = useState([]);
    const [goldHoldings, setGoldHoldings] = useState([]);
    const [assets, setAssets] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [goals, setGoals] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('All changes saved');

    // Load data from localStorage on initial render
    useEffect(() => {
      console.log("MySelvam App Initializing...");
      try {
        const savedData = localStorage.getItem('mySelvamData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          
          // SIP Automation Logic
          const fundsWithAutoSip = parsedData.funds.map(fund => generateMissingSipTransactions(fund));
          
          setFunds(fundsWithAutoSip || mockMutualFunds);
          setGoldHoldings(parsedData.goldHoldings || mockGoldHoldings);
          setAssets(parsedData.assets || mockAssets);
          setExpenses(parsedData.expenses || mockExpenses);
          setGoals(parsedData.goals || mockGoals);
          console.log("Data loaded from localStorage.");
        } else {
          // Initialize with mock data if nothing is saved
          setFunds(mockMutualFunds.map(fund => generateMissingSipTransactions(fund)));
          setGoldHoldings(mockGoldHoldings);
          setAssets(mockAssets);
          setExpenses(mockExpenses);
          setGoals(mockGoals);
          console.log("Initialized with mock data.");
        }
      } catch (error) {
        console.error("Failed to load or parse data from localStorage:", error);
        // Fallback to mock data in case of parsing errors
        setFunds(mockMutualFunds.map(fund => generateMissingSipTransactions(fund)));
        setGoldHoldings(mockGoldHoldings);
        setAssets(mockAssets);
        setExpenses(mockExpenses);
        setGoals(mockGoals);
      }
    }, []);

    // Auto-save data to localStorage whenever it changes
    useEffect(() => {
      const allDataLoaded = funds.length > 0 || goldHoldings.length > 0 || assets.length > 0 || expenses.length > 0 || goals.length > 0;
      if (!allDataLoaded) return;

      setIsSaving(true);
      setSaveStatus('Saving...');
      const timeoutId = setTimeout(() => {
        try {
            const appData = {
                funds,
                goldHoldings,
                assets,
                expenses,
                goals
            };
            localStorage.setItem('mySelvamData', JSON.stringify(appData));
            setSaveStatus('All changes saved');
        } catch (error) {
            console.error("Failed to save data to localStorage:", error);
            setSaveStatus('Error saving data');
        } finally {
            setIsSaving(false);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }, [funds, goldHoldings, assets, expenses, goals]);


    const renderView = () => {
      switch (activeView) {
        case 'dashboard':
          return React.createElement(components.Dashboard, { funds, goldHoldings, assets, expenses, goals });
        case 'portfolio':
          return React.createElement(components.Portfolio, { funds, setFunds });
        case 'gold':
            return React.createElement(components.Gold, { goldHoldings, setGoldHoldings });
        case 'assets':
            return React.createElement(components.Assets, { assets, setAssets });
        case 'expenses':
            return React.createElement(components.Expenses, { expenses, setExpenses, goals, setGoals });
         case 'goals':
            return React.createElement(components.Goals, { goals, setGoals, assets, funds, goldHoldings });
        default:
          return React.createElement(components.Dashboard, { funds, goldHoldings, assets, expenses, goals });
      }
    };

    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
      { id: 'portfolio', label: 'Portfolio', icon: PortfolioIcon },
      { id: 'gold', label: 'Gold', icon: GoldIcon },
      { id: 'assets', label: 'Assets', icon: AssetsIcon },
      { id: 'expenses', label: 'Expenses', icon: ExpensesIcon },
      { id: 'goals', label: 'Goals', icon: GoalsIcon },
    ];

    return (
      React.createElement('div', { className: 'flex h-screen bg-slate-100 font-sans' },
        React.createElement('aside', { className: 'w-64 bg-slate-800 text-slate-300 flex flex-col' },
          React.createElement('div', { className: 'flex items-center justify-center p-4 border-b border-slate-700' },
            React.createElement(LogoIcon, { className: 'w-12 h-12' }),
            React.createElement('span', { className: 'ml-2 text-4xl font-bold text-slate-100' }, 'MySelvam')
          ),
          React.createElement('nav', { className: 'flex-1 p-2' },
            navItems.map(item =>
              React.createElement('a', {
                key: item.id,
                href: '#',
                onClick: (e) => { e.preventDefault(); setActiveView(item.id); },
                className: `flex items-center px-4 py-3 my-1 rounded-md text-lg transition-colors ${activeView === item.id ? 'bg-teal-600 text-white' : 'hover:bg-slate-700'}`
              },
                React.createElement(item.icon, { className: 'w-6 h-6 mr-3' }),
                item.label
              )
            )
          ),
          React.createElement('div', { className: 'p-4 border-t border-slate-700' },
            React.createElement('div', { className: 'flex items-center justify-center text-sm' },
              isSaving ? React.createElement(SpinnerIcon, { className: 'w-5 h-5 mr-2 animate-spin' }) : React.createElement(CheckCircleIcon, { className: 'w-5 h-5 mr-2 text-green-400' }),
              React.createElement('span', null, saveStatus)
            )
          )
        ),
        React.createElement('main', { className: 'flex-1 p-6 lg:p-8 overflow-y-auto' },
          renderView()
        )
      )
    );
  };

  window.MySelvam.components.App = App;
})();
