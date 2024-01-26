const formatCurrency = (number) => {
  return CADMoney.format(number / 100.0)
}

const CADMoney = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
})

export default formatCurrency
