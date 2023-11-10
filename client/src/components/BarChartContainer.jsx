import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Label,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import Wrapper from '../assets/wrappers/ChartsContainer'

const BarChartContainer = ({
  chartHeader,
  data,
  dataKeyX,
  dataKeyY = 'count',
  unitX = null,
  unitY = null,
}) => {
  const quantityFormatter = (value, name) => {
    return [value, name.charAt(0).toUpperCase() + name.slice(1)]
  }
  return (
    <Wrapper>
      {chartHeader && <h4>{chartHeader}</h4>}
      <ResponsiveContainer width='100%' height={500}>
        <BarChart
          data={data}
          margin={{ bottom: 50 }}
          layout='vertical'
          // barGap='30%'
          barCategoryGap='20%'
        >
          <CartesianGrid horizontal={false} />
          <YAxis
            type='category'
            dataKey={dataKeyX}
            width={150}
            interval={0}
            minTickGap='30'
            allowDecimals={false}
          />
          <XAxis
            type='number'
            stroke='#a0a0a0'
            // domain={[0, 10]}
            // ticks={[0, 2.5, 5, 7.5, 10]}
            // strokeWidth={0.5}
          >
            <Label value='Quantity Sold' offset={5} position='bottom' />
          </XAxis>
          <Tooltip formatter={quantityFormatter} />
          <Bar dataKey={dataKeyY} fill='#2cb1bc' />
        </BarChart>
      </ResponsiveContainer>
    </Wrapper>
  )
}

export default BarChartContainer
