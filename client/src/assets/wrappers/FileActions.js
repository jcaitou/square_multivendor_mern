import styled from 'styled-components'

const Wrapper = styled.article`
  background: var(--background-secondary-color);
  border-radius: var(--border-radius);
  display: grid;
  grid-template-columns: 1fr auto;
  box-shadow: var(--shadow-2);
  padding: 1rem 1.5rem;

  .file-action-info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .file-action-status {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-end;
  }

  .download-link {
    text-overflow: ellipsis;
    max-width: 400px;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    vertical-align: bottom;
  }

  .import-type {
    text-transform: capitalize;
    font-weight: 700;
  }

  .import-status {
    text-transform: capitalize;
  }

  .import-status::after {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    margin-left: 10px;
  }
  .import-status-complete::after {
    background: var(--bs-form-valid-color);
  }
  .import-status-running::after {
    background: var(---bs-warning-text-emphasis);
  }
`

export default Wrapper
