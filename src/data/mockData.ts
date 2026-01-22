// NOT BEING USED
export const ITEMS = [
  "VELVET RIBBONS - Handfrayed Velvet",
  "VELVET RIBBONS - Finished Edge",
  "VELVET RIBBONS - Single Sided Poly Satin",
  "VELVET RIBBONS - Double Sided Poly Satin",
  "GROSSGRAIN RIBBONS - Poly grossgrain",
  "on Satin PRINTED RIBBONS",
  "on Grossgrain PRINTED RIBBONS",
  "TINSEL",
  "SHEER RIBBONS - Tulle/Net",
  "SHEER RIBBONS - Organza",
  "SHEER RIBBONS - Chiffon",
  "WIRED RIBBONS",
  "DIE CUT - ABSTRACT POLY WOVEN",
  "PEARL RIBBONS - ABSTRACT POLY WOVEN",
  "Floral - EMBROIDERED RIBBONS",
  "Sequins - EMBROIDERED RIBBONS",
  "embellished - EMBROIDERED RIBBONS",
  "mirror - EMBROIDERED RIBBONS",
  "JACQUARD - ribbons",
  "JUTE - ribbons",
  "POMS - TRIMS",
  "RIC RAC - TRIMS",
  "FRINGE - TRIMS",
  "TASSELS - TRIMS",
  "LACE - TRIMS",
  "CORDS - TRIMS",
];

// not being used
export const VENDORS = [
  "Silk Suppliers Ltd",
  "Ribbon World Inc",
  "Textile Masters",
  "Quality Fabrics Co",
  "Premium Materials",
  "Global Textiles",
  "Craft Supplies Pro",
  "Elite Ribbons",
];

// not being used
export const BUYERS = [
  "Fashion House A",
  "Boutique B",
  "Craft Store C",
  "Wedding Planners D",
  "Event Decor E",
  "Gift Shop F",
];

// used
export const TRANSACTION_TYPES = [
  "Raw Material",
  "WIP",
  "Final Item",
  "Packaging",
  "Sampling"
];

export const UNITS = ["Pieces", "Metre", "Kilos" , "Litres"];

// Mock inventory data
const getStoredInventory = () => {
  const stored = localStorage.getItem('inventory');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Initialize with some default inventory (multiples of 10)
  const defaultInventory: Record<string, number> = {};
  ITEMS.forEach(item => {
    defaultInventory[item] = Math.floor((Math.random() * 20 + 5)) * 10; // 50-240 in multiples of 10
  });
  
  localStorage.setItem('inventory', JSON.stringify(defaultInventory));
  return defaultInventory;
};

export const getInventory = () => getStoredInventory();

export const updateInventory = (item: string, quantity: number) => {
  const inventory = getInventory();
  inventory[item] = (inventory[item] || 0) + quantity;
  localStorage.setItem('inventory', JSON.stringify(inventory));
};

// Mock transactions
export const getTransactions = (type: 'inward' | 'outward') => {
  const key = `${type}_transactions`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

export const addTransaction = (type: 'inward' | 'outward', transaction: any) => {
  const key = `${type}_transactions`;
  const transactions = getTransactions(type);
  const newTransaction = {
    ...transaction,
    id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  transactions.unshift(newTransaction);
  localStorage.setItem(key, JSON.stringify(transactions));
  return newTransaction;
};

export const updateTransaction = (type: 'inward' | 'outward', id: string, updates: any) => {
  const key = `${type}_transactions`;
  const transactions = getTransactions(type);
  const index = transactions.findIndex((t: any) => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
    localStorage.setItem(key, JSON.stringify(transactions));
  }
};

// Notifications
export const getNotifications = () => {
  const stored = localStorage.getItem('notifications');
  return stored ? JSON.parse(stored) : [];
};

export const addNotification = (notification: any) => {
  const notifications = getNotifications();
  notifications.unshift({
    ...notification,
    id: `NOTIF-${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: 'unread',
  });
  localStorage.setItem('notifications', JSON.stringify(notifications));
};
