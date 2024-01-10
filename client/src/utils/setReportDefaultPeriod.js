import day from 'dayjs'

export const setReportDefaultPeriod = (baseLink, defaultReportPeriod) => {
  if (defaultReportPeriod == 'all time') {
    return baseLink
  }

  var defaultStartDate = '',
    defaultEndDate = ''
  const today = day()
  if (defaultReportPeriod == 'today') {
    defaultStartDate = today.format('YYYY-MM-DD')
    defaultEndDate = today.format('YYYY-MM-DD')
  } else if (defaultReportPeriod == 'one week') {
    defaultStartDate = today.subtract(7, 'day').format('YYYY-MM-DD')
    defaultEndDate = today.format('YYYY-MM-DD')
  } else if (defaultReportPeriod == 'one month') {
    defaultStartDate = today.subtract(1, 'month').format('YYYY-MM-DD')
    defaultEndDate = today.format('YYYY-MM-DD')
  }
  return `${baseLink}?startDate=${defaultStartDate}&endDate=${defaultEndDate}`
}
