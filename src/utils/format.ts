export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const formatMonthYear = (dateStr: string) => {
  const [year, month] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  return `${monthNames[date.getMonth()]} ${year.slice(2)}`;
};

const USER_NAMES: { [key: string]: string } = {
  'nikuland@gmail.com': 'Nicolas',
  'alix.troalen@gmail.com': 'Alix',
  'romain.troalen@gmail.com': 'Romain',
  'remi.roux@gmail.com': 'Rémi',
  'guillaume.marion.perso@gmail.com': 'Guillaume',
};

export const formatUserName = (email: string): string => {
  return USER_NAMES[email] || email;
}; 