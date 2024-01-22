const FormRow = ({
  type,
  name,
  labelText,
  value,
  onChange,
  maxLength = false,
  required = true,
  rows = 6,
}) => {
  if (type === 'number') {
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
          value={value}
          onChange={onChange}
          required={required}
        />
      </div>
    )
  } else if (type === 'textarea') {
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
          maxLength={maxLength ? maxLength : undefined}
          className='form-input'
          value={value}
          onChange={onChange}
          required={required}
        />
      </div>
    )
  }
}

export default FormRow
