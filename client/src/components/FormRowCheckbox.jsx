const FormRowCheckbox = ({
  name,
  labelText,
  list,
  defaultValue = '',
  onChange,
}) => {
  return (
    <div className='form-row'>
      <label htmlFor={name} className='form-label'>
        {labelText || name}
      </label>
      {list.map((itemValue) => {
        return (
          <>
            <input
              type='checkbox'
              name={name}
              id={`${name}-${itemValue}`}
              value={itemValue}
            />
            <label htmlFor={`${name}-${itemValue}`}> I have a bike</label>
          </>
        )
      })}
    </div>
  )
}
export default FormRowCheckbox
