import styled from 'styled-components'

const Wrapper = styled.div`
  .switch-checkbox {
    position: relative;
    width: 44px;
    height: 22px;
    border-radius: 20px;
    background: var(--bs-gray-300);
    appearance: none;
    transition: background 0.1s ease-in 0s;
    cursor: pointer;
    border: 1px solid #e1e3e4;
  }
  .switch-checkbox:before {
    display: block;
    position: absolute;
    content: '';
    width: 14px;
    height: 14px;
    top: 3px;
    left: 3px;
    background: var(--bs-danger);
    border-radius: 100%;
    box-shadow: 0 1px 1px #0003;
    transition: background 0.1s ease-in, transform 0.1s ease-in;
  }
  .switch-checkbox:checked {
    background: var(--bs-success);
  }
  .switch-checkbox:checked:before {
    transform: translate(calc(100% + 8px));
    background: var(--bs-gray-200);
  }
  .switch-checkbox[disabled] {
    cursor: not-allowed;
  }
`

export default Wrapper
