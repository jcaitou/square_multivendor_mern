import { HoverTooltip } from '.'
import { RiInformationLine } from 'react-icons/ri'

const SearchByDate = ({ defaultStartDate, defaultEndDate }) => {
  const debounce = (onChange) => {
    let timeout
    return (e) => {
      const form = e.currentTarget.form
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        onChange(form, e)
      }, 1000)
    }
  }

  return (
    <>
      <div className='date-search'>
        <div className='date-group'>
          <HoverTooltip
            title='Leave both start and end date empty to search entire history.'
            id='tt-date'
          >
            <label htmlFor='startDate'>Start date:</label>
          </HoverTooltip>

          <input
            type='date'
            id='startDate'
            name='startDate'
            defaultValue={defaultStartDate}
            onChange={debounce((form, e) => {
              const selectedDate = e.target.value
              const dateInput = e.target
                .closest('.date-search')
                .querySelector('input[name=endDate]')
              if (!selectedDate) {
                dateInput.removeAttribute('min')
              } else {
                dateInput.setAttribute('min', selectedDate)
              }
            })}
          />
        </div>
        <div className='date-group'>
          <label htmlFor='endDate'>End date:</label>
          <input
            type='date'
            id='endDate'
            name='endDate'
            defaultValue={defaultEndDate}
            min={defaultStartDate}
            //start date can be anything, only limit end date
            // onChange={(e) => {
            //   const form = e.currentTarget.form
            //   const selectedDate = e.target.value
            //   const dateInput = document.querySelector(
            //     'input[name=startDate]'
            //   )
            //   if (!selectedDate) {
            //     dateInput.removeAttribute('max')
            //   } else {
            //     dateInput.setAttribute('max', selectedDate)
            //   }
            //   submit(form)
            // }}
          />
        </div>

        <button className='btn btn-block'>submit</button>
      </div>
    </>
  )
}

export default SearchByDate
