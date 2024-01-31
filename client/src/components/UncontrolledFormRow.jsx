const UncontrolledFormRow = ({
  type,
  name,
  labelText,
  defaultValue = '',
  onChange,
  required = true,
  rows = 6,
}) => {
  if (type === 'textarea') {
    return (
      <div className='form-row'>
        <label htmlFor={name} className='form-label'>
          {labelText || name}
        </label>
        <textarea
          id={name}
          name={name}
          rows={rows}
          className='form-textarea'
        ></textarea>
      </div>
    )
  } else if (type === 'number' && labelText === 'price') {
    return (
      <div className='form-row'>
        <label htmlFor={name} className='form-label'>
          {labelText || name}
        </label>
        <input
          type={type}
          id={name}
          name={name}
          min='0.00'
          step='0.01'
          className='form-input'
          defaultValue={defaultValue}
          onChange={onChange}
          required={required}
        />
      </div>
    )
  } else {
    return (
      <div className='form-row'>
        <label htmlFor={name} className='form-label'>
          {labelText || name}
        </label>
        <input
          type={type}
          id={name}
          name={name}
          className='form-input'
          defaultValue={defaultValue}
          onChange={onChange}
          required={required}
        />
      </div>
    )
  }
}

export default UncontrolledFormRow
