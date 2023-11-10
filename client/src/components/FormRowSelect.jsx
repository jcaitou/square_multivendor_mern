const FormRowSelect = ({
  name,
  labelText,
  list,
  listLabels,
  defaultValue = '',
  onChange,
}) => {
  return (
    <div className='form-row'>
      <label htmlFor={name} className='form-label'>
        {labelText || name}
      </label>
      <select
        name={name}
        id={name}
        className='form-select'
        defaultValue={defaultValue}
        onChange={onChange}
      >
        {list.map((itemValue) => {
          return (
            <option key={itemValue} value={itemValue}>
              {listLabels ? listLabels[itemValue] : itemValue}
            </option>
          )
        })}
      </select>
    </div>
  )
}
export default FormRowSelect
