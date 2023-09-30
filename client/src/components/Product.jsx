import { FaLocationArrow, FaBriefcase, FaCalendarAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import Wrapper from '../assets/wrappers/Job'
import JobInfo from './JobInfo'
import { Form } from 'react-router-dom'
import day from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
day.extend(advancedFormat)

const Product = (product) => {
  const date = day(product.updatedAt).format('MMM Do, YYYY')

  return (
    <Wrapper>
      <header>
        <div className='main-icon'>{product.itemData.name.charAt(0)}</div>
        <div className='info'>
          <h5>{product.itemData.name}</h5>
          <p>
            {product.itemData.variations[0].itemVariationData.priceMoney.amount}
          </p>
        </div>
      </header>
      <div className='content'>
        {/* <div className='content-center'>
          <JobInfo icon={<FaLocationArrow />} text={jobLocation} />
          <JobInfo icon={<FaCalendarAlt />} text={date} />
          <JobInfo icon={<FaBriefcase />} text={jobType} />
          <div className={`status ${jobStatus}`}>{jobStatus}</div>
        </div> */}

        <footer className='actions'>
          <Link to={`../edit-product/${product.id}`} className='btn edit-btn'>
            Edit
          </Link>
          <Form>
            <button type='submit' className='btn delete-btn'>
              Delete
            </button>
          </Form>
        </footer>
      </div>
    </Wrapper>
  )
}

export default Product
