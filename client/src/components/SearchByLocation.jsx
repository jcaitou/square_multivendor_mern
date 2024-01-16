import { useSubmit } from 'react-router-dom'

const SearchByLocation = ({ user, searchLocations, allStoreLocations }) => {
  const submit = useSubmit()

  const locationChangeAll = (e) => {
    const form = e.currentTarget.form
    const locationInputs = document.querySelectorAll('input[name=locations]')
    locationInputs.forEach((input) => {
      input.checked = e.currentTarget.checked
    })
    if (e.currentTarget.checked) {
      submit(form)
    }
  }

  const locationChange = (e) => {
    const form = e.currentTarget.form
    const locationInputs = document.querySelectorAll('input[name=locations]')
    const allLocationInput = document.querySelector(
      'input[value=locations-all]'
    )
    let prop = true
    for (let i = 0; i < locationInputs.length; i++) {
      if (locationInputs[i].checked === false) {
        prop = false
        break
      }
    }
    allLocationInput.checked = prop

    submit(form)
  }

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
      <div className='form-row'>
        <label htmlFor='locations' className='form-label'>
          locations
        </label>
        <div className='locations-search'>
          <div className='location-search-group'>
            <input
              type='checkbox'
              value='locations-all'
              defaultChecked={
                (searchLocations.length === 0 &&
                  user.locationsHistory.length === user.locations.length) ||
                searchLocations.length === user.locationsHistory.length
              }
              onChange={(e) => {
                locationChangeAll(e)
              }}
            />
            <label htmlFor='locations-all'>All</label>
          </div>
          {user.locationsHistory.map((itemValue) => {
            return (
              <div
                className='location-search-group'
                key={`select-${itemValue}`}
              >
                <input
                  type='checkbox'
                  name='locations'
                  id={`locations-${itemValue}`}
                  value={itemValue}
                  defaultChecked={
                    (searchLocations.length === 0 &&
                      user.locations.includes(itemValue)) ||
                    searchLocations.includes(itemValue)
                  }
                  onChange={(e) => {
                    locationChange(e)
                  }}
                />
                <label htmlFor={`locations-${itemValue}`}>
                  {
                    allStoreLocations.find((el) => {
                      return el._id === itemValue
                    }).name
                  }
                </label>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default SearchByLocation
