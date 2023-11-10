import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

const AreaChartComponent = ({ data, dataKeyX, dataKeyY = 'count' }) => {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <AreaChart data={data} margin={{ top: 50 }}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey={dataKeyX} />
        <YAxis allowDecimals={false} unit='$' />
        <Tooltip />
        <Area
          type='monotone'
          dataKey={dataKeyY}
          stroke='#2cb1bc'
          fill='#bef8fd'
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default AreaChartComponent
