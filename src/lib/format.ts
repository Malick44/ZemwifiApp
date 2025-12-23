export const formatCurrency = (value: number, currency = 'XOF') => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(value)
}

export const maskPhone = (phone: string) => {
  if (phone.length < 4) return phone
  const visible = phone.slice(-4)
  return `${'*'.repeat(Math.max(0, phone.length - 4))}${visible}`
}
