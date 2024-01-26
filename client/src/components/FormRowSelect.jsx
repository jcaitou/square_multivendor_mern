const FormRowSelect = ({
  name,
  labelText,
  list,
  listLabels,
  defaultValue = '',
  onChange,
  doubleList = false,
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
        {list.map((itemValue, index) => {
          return (
            <option key={itemValue} value={itemValue}>
              {listLabels && doubleList
                ? listLabels[index]
                : listLabels
                ? listLabels[itemValue]
                : itemValue}
            </option>
          )
        })}
      </select>
    </div>
  )
}
export default FormRowSelect
