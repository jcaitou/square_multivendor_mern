import { AreaChartContainer, BarChartContainer, StatItem } from '../components'
import customFetch from '../utils/customFetch'
import { useLoaderData } from 'react-router-dom'
import { FaSuitcaseRolling, FaCalendarCheck, FaBug } from 'react-icons/fa'
import { MdOutlineLocationOn } from 'react-icons/md'
import { BsCashCoin, BsBasket } from 'react-icons/bs'
import { GiCoins } from 'react-icons/gi'

import StatRowWrapper from '../assets/wrappers/StatsContainer'
import { useDashboardContext } from './DashboardLayout'
import day from 'dayjs'

export const loader = async () => {
  try {
    const response = await customFetch.get('/orders/stats')
    console.log(response.data)
    return response.data
  } catch (error) {
    return error
  }
}

const Stats = () => {
  const {
    allTimeBestsellers,
    allTimeTotal,
    lastMonthBestsellers,
    monthToDateTotal,
    sixMonthsSales,
    productCount,
  } = useLoaderData()
  const { user } = useDashboardContext()
  console.log(user)

  const CADMoney = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  })

  //   {
  //   title: 'pending applications',
  //   count: defaultStats?.pending || 0,
  //   icon: <FaSuitcaseRolling />,
  //   color: '#f59e0b',
  //   bcg: '#fef3c7',
  // }
  //display: number of products listed, number of locations active, total lifetime revenue,
  // most relevant stats: month to date revnue (expected payout), last 30 days bestsellers
  return (
    <>
      {/* <StatsContainer defaultStats={defaultStats} /> */}
      <div className='store-stats'>
        <StatRowWrapper>
          <StatItem
            key='product-count'
            title='Products Listed'
            count={productCount}
            icon={<BsBasket />}
            color='#647acb'
            bcg='#e0e8f9'
          />

          <StatItem
            key='active-locations'
            title='Active Locations'
            count={user.locations.length}
            icon={<MdOutlineLocationOn />}
            color='#d66a6a'
            bcg='#ffeeee'
          />
        </StatRowWrapper>
      </div>
      <div className='revenue-stats'>
        <StatRowWrapper>
          <StatItem
            key='all-time-revenue'
            title='All-Time Revenue'
            count={CADMoney.format(allTimeTotal / 100)}
            icon={<GiCoins />}
            color='#75b798'
            bcg='#cbe8da'
          />

          <StatItem
            key='month-revenue'
            title={`This Months' Revenue (${day().format('MMM YYYY')})`}
            count={CADMoney.format(monthToDateTotal / 100)}
            icon={<BsCashCoin />}
            color='#f59e0b'
            bcg='#fef3c7'
          />
        </StatRowWrapper>
      </div>
      {lastMonthBestsellers?.length > 0 && (
        <BarChartContainer
          chartHeader='Last 30 Days Bestsellers'
          data={lastMonthBestsellers}
          dataKeyX='name'
          dataKeyY='quantity'
        />
      )}

      {sixMonthsSales?.length > 0 && (
        <AreaChartContainer
          chartHeader='Last 6 Months Sales'
          data={sixMonthsSales}
          dataKeyX='date'
          dataKeyY='revenue'
          unitY='$'
        />
      )}
      {allTimeBestsellers?.length > 0 && (
        <BarChartContainer
          chartHeader='All-Time Bestsellers'
          data={allTimeBestsellers}
          dataKeyX='name'
          dataKeyY='quantity'
        />
      )}
    </>
  )
}

export default Stats
