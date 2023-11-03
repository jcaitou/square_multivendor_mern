const UncontrolledFormRow = ({
  type,
  name,
  labelText,
  defaultValue = '',
  onChange,
  required = true,
}) => {
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

export default UncontrolledFormRow
