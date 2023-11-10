import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
} from 'recharts'
import Wrapper from '../assets/wrappers/ChartsContainer'

const AreaChartContainer = ({
  chartHeader,
  data,
  dataKeyX,
  dataKeyY = 'count',
  unitX = null,
  unitY = null,
}) => {
  const moneyFormatter = (value, name) => {
    return ['$' + value, name.charAt(0).toUpperCase() + name.slice(1)]
  }

  return (
    <Wrapper>
      {chartHeader && <h4>{chartHeader}</h4>}
      <ResponsiveContainer width='100%' height={300}>
        <AreaChart data={data} margin={{ left: 50 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey={dataKeyX} angle={-45} textAnchor='end' height='100' />
          <YAxis allowDecimals={false}>
            <Label
              value='Revenue (CAD$)'
              offset='0'
              position='left'
              angle={-90}
              style={{ textAnchor: 'middle' }}
            />
          </YAxis>
          <Tooltip formatter={moneyFormatter} />
          <Area
            type='monotone'
            dataKey={dataKeyY}
            stroke='#2cb1bc'
            fill='#bef8fd'
          />
        </AreaChart>
      </ResponsiveContainer>
    </Wrapper>
  )
}

export default AreaChartContainer
